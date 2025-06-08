
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
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

// Helper function to compare relevant parts of user profiles
const areProfilesEffectivelyEqual = (profile1: UserProfile | null, profile2: UserProfile | null): boolean => {
  if (!profile1 && !profile2) return true;
  if (!profile1 || !profile2) return false;
  return (
    profile1.uid === profile2.uid &&
    profile1.displayName === profile2.displayName &&
    profile1.email === profile2.email &&
    profile1.photoURL === profile2.photoURL &&
    profile1.role === profile2.role &&
    JSON.stringify(profile1.interests) === JSON.stringify(profile2.interests) && // Simple array compare
    (profile1.createdAt && profile2.createdAt ? profile1.createdAt.isEqual(profile2.createdAt) : profile1.createdAt === profile2.createdAt)
  );
};


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
        
        const unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const newProfileData = docSnap.data() as UserProfile;
            setUserProfile(currentProfile => {
              if (areProfilesEffectivelyEqual(currentProfile, newProfileData)) {
                return currentProfile; // Avoid creating a new reference if data is effectively the same
              }
              return newProfileData;
            });
          } else {
            console.warn("User document not found for UID:", firebaseUser.uid);
            setUserProfile(null); 
          }
        });
        
        setLoading(false);
        return () => unsubSnapshot(); 
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        const publicPaths = ['/auth/login', '/auth/register', '/', '/about', '/contact', '/events', '/books', '/choirs', '/unions', '/videos', '/ceremonies', '/leadership'];
        const isPublicEventDetail = pathname.startsWith('/events/');

        if (!publicPaths.some(p => pathname.startsWith(p)) && !isPublicEventDetail && !pathname.startsWith('/_next')) {
         // router.push('/auth/login'); // This was commented out, keeping it as is.
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]); // Keep router in deps if its stability is ensured by Next.js
  
  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      // setUser(null) and setUserProfile(null) will be handled by onAuthStateChanged
      router.push('/auth/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [router]);

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
