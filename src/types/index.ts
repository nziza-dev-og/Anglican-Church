import type { Timestamp } from "firebase/firestore";

export type UserRole =
  | 'Super Admin'
  | 'Church Admin'
  | 'Pastor'
  | 'Chief Pastor'
  | 'Diacon'
  | 'Choir Admin'
  | 'Choir Member'
  | 'Union Admin'
  | 'Union Member'
  | 'Regular Member';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  interests?: string[];
  createdAt: Timestamp;
}

export interface ChurchEvent {
  id?: string;
  title: string;
  description: string;
  date: Timestamp;
  location?: string;
  imageUrl?: string;
  createdBy: string; // UID
  createdAt: Timestamp;
}

export interface Book {
  id?: string;
  title: string;
  author?: string;
  description?: string;
  downloadUrl: string;
  coverImageUrl?: string;
  category?: string;
  uploadedBy: string; // UID
  uploadedAt: Timestamp;
}

export interface Video {
  id?: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  uploadedBy: string; // UID
  uploadedAt: Timestamp;
}

export interface Choir {
  id?: string;
  name: string;
  chamber: string;
  description?: string;
  adminUids: string[];
  createdAt: Timestamp;
}

export interface ChoirMember {
  id?: string; // choirId_userId
  userId: string;
  choirId: string;
  roleInChoir: string;
  joinDate: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
}

export type UnionType = 'Mothers Union' | 'Fathers Union';

export interface ChurchUnion {
  id?: string;
  name: UnionType;
  description?: string;
  adminUids: string[];
  createdAt: Timestamp;
}

export interface UnionMember {
  id?: string; // unionId_userId
  userId: string;
  unionId: string;
  joinDate: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Ceremony {
  id?: string;
  type: string;
  title: string;
  date: Timestamp;
  description?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  createdBy: string; // UID
  createdAt: Timestamp;
}

export interface ChatMessage {
  id?: string;
  roomId: string;
  senderUid: string;
  senderName: string;
  senderPhotoURL?: string | null;
  text: string;
  timestamp: Timestamp;
}

export interface SecretCode {
  id: UserRole; // The role this code grants
  code: string;
}

// For personalized