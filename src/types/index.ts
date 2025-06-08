
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
  phoneNumber?: string; // Added for leadership details
}

export interface ChurchEvent {
  id?: string;
  title: string;
  description: string;
  date: Timestamp;
  location?: string;
  imageUrl?: string; // Optional direct image URL
  createdBy: string; // UID
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Book {
  id?: string;
  title: string;
  author?: string;
  description?: string;
  downloadUrl: string; // Final URL (from upload or direct input)
  coverImageUrl?: string; // Final URL (from upload or direct input)
  category?: string;
  uploadedBy: string; // UID
  uploadedAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Video {
  id?: string;
  title: string;
  description?: string;
  videoUrl: string; // YouTube, Vimeo, or direct .mp4 URL
  thumbnailUrl?: string; // Optional direct thumbnail URL
  category?: string;
  uploadedBy: string; // UID
  uploadedAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Choir {
  id?: string;
  name: string;
  chamber: string; // e.g., Main, Youth, Children
  description?: string;
  adminUids: string[]; // Array of user UIDs who can administer this choir
  createdBy: string; // UID of Church/Super Admin
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ChoirMember {
  id?: string; // choirId_userId - or let Firestore auto-generate
  userId: string;
  choirId: string;
  roleInChoir?: string; // e.g., Singer, Instrumentalist - Made optional
  joinDate: Timestamp;
  status: 'pending' | 'approved' | 'rejected'; // Managed by Choir Admin
}

export type UnionType = 'Mothers Union' | 'Fathers Union' | 'Youth Union' | 'Other'; // Added Youth and Other

export interface ChurchUnion {
  id?: string;
  name: UnionType;
  description?: string;
  adminUids: string[]; // Array of user UIDs who can administer this union
  createdBy: string; // UID of Church/Super Admin
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface UnionMember {
  id?: string; // unionId_userId - or let Firestore auto-generate
  userId: string;
  unionId: string;
  joinDate: Timestamp;
  status: 'pending' | 'approved' | 'rejected'; // Managed by Union Admin
}

export interface Ceremony {
  id?: string;
  type: string; // e.g., Baptism, Wedding, Confirmation, Funeral
  title: string;
  date: Timestamp;
  description?: string;
  imageUrls?: string[]; // Array of direct image URLs
  videoUrls?: string[]; // Array of direct video URLs (e.g., YouTube links)
  createdBy: string; // UID
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ChatMessage {
  id?: string;
  roomId: string; // Can be event ID, choir ID, union ID, or 'general'
  senderUid: string;
  senderName: string | null; // Ensure senderName can be null
  senderPhotoURL?: string | null;
  text: string;
  timestamp: Timestamp;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Timestamp;
  userId?: string; // Optional: if a logged-in user submits
  isRead?: boolean; // For admin tracking
}


export interface SecretCode {
  id: UserRole; // The role this code grants
  code: string;
}

export interface Recommendation {
  title: string;
  description: string;
  link: string;
}

// For the new leadership page
export interface ProcessedLeader extends UserProfile {
  managedChoirs: { id: string, name: string }[];
  managedUnions: { id: string, name: string }[];
}
