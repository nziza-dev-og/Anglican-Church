import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a consistent chat room ID for two users.
 * Sorts the UIDs alphabetically and joins them with an underscore.
 * This ensures that the same room ID is generated regardless of who initiates the chat.
 * @param uid1 - The UID of the first user.
 * @param uid2 - The UID of the second user.
 * @returns The generated chat room ID.
 */
export function createChatRoomId(uid1: string, uid2: string): string {
  const ids = [uid1, uid2].sort();
  return ids.join('_');
}
