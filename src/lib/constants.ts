import type { UserRole } from '@/types';

export const USER_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  CHURCH_ADMIN: 'Church Admin',
  PASTOR: 'Pastor',
  CHIEF_PASTOR: 'Chief Pastor',
  DIACON: 'Diacon',
  CHOIR_ADMIN: 'Choir Admin',
  CHOIR_MEMBER: 'Choir Member',
  UNION_ADMIN: 'Union Admin',
  UNION_MEMBER: 'Union Member',
  REGULAR_MEMBER: 'Regular Member',
} as const;

export const ALL_USER_ROLES_LIST: UserRole[] = Object.values(USER_ROLES);

export const SECRET_CODES_COLLECTION = 'secretCodes';
export const USERS_COLLECTION = 'users';
export const EVENTS_COLLECTION = 'events';
export const BOOKS_COLLECTION = 'books';
export const VIDEOS_COLLECTION = 'videos';
export const CHOIRS_COLLECTION = 'choirs';
export const CHOIR_MEMBERS_COLLECTION = 'choirMembers';
export const UNIONS_COLLECTION = 'unions';
export const UNION_MEMBERS_COLLECTION = 'unionMembers';
export const CEREMONIES_COLLECTION = 'ceremonies';
export const CHAT_MESSAGES_COLLECTION = 'chatMessages';

// These are default codes. In a real app, these should be securely managed,
// possibly fetched from a secure configuration or Firestore itself.
export const DEFAULT_SECRET_CODES: Record<string, { role: UserRole }> = {
  'anglican': { role: USER_ROLES.CHURCH_ADMIN },
  'peace': { role: USER_ROLES.CHOIR_ADMIN },
  'union': { role: USER_ROLES.UNION_ADMIN },
};

export const APP_NAME = "Rubavu Anglican Connect";