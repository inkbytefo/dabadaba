export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId?: string;
  channelId?: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'audio';
  timestamp: Date;
  editedAt?: Date;
  replyTo?: string;
  reactions: { [userId: string]: string };
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: {
    fileType?: string;
    fileSize?: number;
    fileName?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number; // For audio/video
    thumbnailUrl?: string;
  };
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  participants: { [userId: string]: boolean };
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
    type: Message['type'];
  };
  createdAt: Date;
  updatedAt: Date;
  name?: string; // For group conversations 
  photoURL?: string; // For group conversations
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'video';
  members: { [userId: string]: boolean };
  ownerId: string;
  permissions: {
    sendMessages: boolean;
    embedLinks: boolean;
    attachFiles: boolean;
    addMembers: boolean;
    removeMembers: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceState {
  id: string;
  userId: string;
  channelId: string;
  muted: boolean;
  deafened: boolean;
  speaking: boolean;
  timestamp: Date;
}

export interface VoiceChannel extends Channel {
  type: 'voice';
  bitrate: number;
  userLimit?: number;
  currentUsers: { [userId: string]: VoiceState };
}

export interface VideoChannel extends Channel {
  type: 'video';
  quality: 'auto' | '720p' | '1080p';
  layout: 'grid' | 'spotlight' | 'sidebar';
  currentParticipants: { [userId: string]: {
    camera: boolean;
    microphone: boolean;
    screenshare: boolean;
    timestamp: Date;
  }};
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}