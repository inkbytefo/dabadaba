import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  searchTerms?: string[];
  username?: string;
  role?: 'owner' | 'admin' | 'member';
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'markdown' | 'image' | 'video' | 'file' | 'audio';
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isPinned?: boolean;
  pinnedAt?: Timestamp | null;
  pinnedBy?: string | null;
  metadata?: {
    fileType?: string;
    fileSize?: number;
    fileName?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number;
  };
  reactions?: {
    [userId: string]: string;
  };
  editedAt?: Timestamp;
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  participants: {
    [userId: string]: boolean;
  };
  lastMessage?: string;
  lastMessageTimestamp?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  name?: string; // For group chats
  photoURL?: string; // For group chats
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  members: {
    [userId: string]: 'owner' | 'admin' | 'member';
  };
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Timestamp;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Timestamp;
  typing?: {
    [conversationId: string]: boolean;
  };
}

export type MessageContentType = 'text' | 'markdown' | 'image' | 'video' | 'file' | 'audio';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type UserRole = 'owner' | 'admin' | 'member';
export type UserStatus = 'online' | 'offline' | 'away';
