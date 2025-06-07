
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types';
import { USERS_COLLECTION, USER_ROLES } from '@/lib/constants';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean; // Combines Church Admin and Super Admin
  isChoirAdmin: boolean;
  isUnionAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
        
        // Set up a snapshot listener for real-time profile updates
        const unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // This case might happen if user is created but profile doc is not yet ready
            // Or if user was deleted from Firestore but still authenticated
            // For now, we assume profile should exist if user is authenticated
            console.warn("User document not found for UID:", firebaseUser.uid);
            // Potentially create a basic profile here if it's a new registration flow.
            // For now, let's assume it's handled during registration.
            setUserProfile(null); 
          }
        });
        
        setLoading(false);
        return () => unsubSnapshot(); // Cleanup snapshot listener
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        // Redirect to login if not on public pages
        const publicPaths = ['/auth/login', '/auth/register', '/', '/about', '/contact', '/events', '/books', '/choirs', '/unions', '/videos', '/ceremonies'];
        const isPublicEventDetail = pathname.startsWith('/events/');

        if (!publicPaths.some(p => pathname.startsWith(p)) && !isPublicEventDetail && !pathname.startsWith('/_next')) {
         // router.push('/auth/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);
  
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      router.push('/auth/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const isAdmin = userProfile?.role === USER_ROLES.CHURCH_ADMIN || userProfile?.role === USER_ROLES.SUPER_ADMIN;
  const isChoirAdmin = userProfile?.role === USER_ROLES.CHOIR_ADMIN;
  const isUnionAdmin = userProfile?.role === USER_ROLES.UNION_ADMIN;

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAdmin, isChoirAdmin, isUnionAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const createUserProfileDocument = async (userAuth: FirebaseUser, additionalData?: Partial<UserProfile>) => {
  if (!userAuth) return;

  const userDocRef = doc(db, USERS_COLLECTION, userAuth.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    const { email, displayName, photoURL } = userAuth;
    const createdAt = serverTimestamp() as Timestamp; // Get server timestamp
    const defaultRole: UserRole = USER_ROLES.REGULAR_MEMBER;

    try {
      await setDoc(userDocRef, {
        uid: userAuth.uid,
        email,
        displayName: displayName || email?.split('@')[0] || 'User',
        photoURL: photoURL || `https://placehold.co/100x100.png?text=${(displayName || email || 'U').charAt(0).toUpperCase()}`,
        role: defaultRole,
        interests: [],
        createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.error('Error creating user profile document', error);
    }
  }
  return userDocRef;
};
