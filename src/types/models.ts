import { Timestamp, FieldValue } from 'firebase/firestore';

export type UserStatus = 'online' | 'offline' | 'away';
export type UserRole = 'owner' | 'admin' | 'member';
export type MessageType = 'text' | 'markdown' | 'image' | 'video' | 'file' | 'audio';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  status?: UserStatus;
  lastSeen?: Date;
  searchTerms?: string[];
  username?: string;
  role?: UserRole;
}

export interface MessageMetadata {
  fileType?: string;
  fileSize?: number;
  fileName?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
}

export type TimestampField = Timestamp | FieldValue;

// Interface for Message as stored in Firestore
export interface MessageData {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  senderId: string;
  senderName: string;
  timestamp: TimestampField;
  status: MessageStatus;
  isPinned?: boolean;
  pinnedAt?: TimestampField | null;
  pinnedBy?: string | null;
  editedAt?: TimestampField;
  deletedAt?: TimestampField;
  metadata?: MessageMetadata;
  reactions?: {
    [userId: string]: string;
  };
}

// Interface for Message as used in the application
export interface Message extends Omit<MessageData, 'timestamp' | 'pinnedAt' | 'editedAt' | 'deletedAt'> {
  timestamp: Timestamp;
  pinnedAt?: Timestamp | null;
  editedAt?: Timestamp;
  deletedAt?: Timestamp;
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
  name?: string;
  photoURL?: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  members: {
    [userId: string]: UserRole;
  };
}

export interface UserPresence {
  userId: string;
  status: UserStatus;
  lastSeen: Timestamp;
  typing?: {
    [conversationId: string]: boolean;
  };
}
