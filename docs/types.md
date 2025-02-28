# Types Documentation

This document details the TypeScript type definitions located in the `src/types` directory.

## Core Type Enums (`models.ts`)

### Status and Role Types
```typescript
type UserStatus = 'online' | 'offline' | 'away';
type UserRole = 'owner' | 'admin' | 'member';
type MessageType = 'text' | 'markdown' | 'image' | 'video' | 'file' | 'audio';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
```

## Data Models

### User Model
```typescript
interface User {
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
```

### Message Models

#### Message Metadata
```typescript
interface MessageMetadata {
  fileType?: string;
  fileSize?: number;
  fileName?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
}
```

#### Firestore Message Data
```typescript
interface MessageData {
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
```

#### Application Message Model
```typescript
interface Message extends Omit<MessageData, 'timestamp' | 'pinnedAt' | 'editedAt' | 'deletedAt'> {
  timestamp: Timestamp;
  pinnedAt?: Timestamp | null;
  editedAt?: Timestamp;
  deletedAt?: Timestamp;
}
```

### Conversation Model
```typescript
interface Conversation {
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
```

### Channel Model
```typescript
interface Channel {
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
```

### User Presence Model
```typescript
interface UserPresence {
  userId: string;
  status: UserStatus;
  lastSeen: Timestamp;
  typing?: {
    [conversationId: string]: boolean;
  };
}
```

## Environment Types (`environment.d.ts`)

### Firebase Configuration
```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APP_ID: string;
    VITE_FIREBASE_MEASUREMENT_ID: string;
  }
}
```

### Asset Module Declarations
```typescript
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
```

## Usage Examples

### Working with Messages
```typescript
// Creating a new message
const newMessage: MessageData = {
  id: 'msg123',
  conversationId: 'conv456',
  content: 'Hello!',
  type: 'text',
  senderId: 'user789',
  senderName: 'John Doe',
  timestamp: serverTimestamp(),
  status: 'sending'
};

// Handling message reactions
message.reactions = {
  'user123': '👍',
  'user456': '❤️'
};
```

### Managing User Status
```typescript
const userPresence: UserPresence = {
  userId: 'user123',
  status: 'online',
  lastSeen: Timestamp.now(),
  typing: {
    'conversation123': true
  }
};
```

### Type Guards
```typescript
function isGroupConversation(conversation: Conversation): boolean {
  return conversation.type === 'group';
}

function isImageMessage(message: Message): boolean {
  return message.type === 'image';
}
```

## Best Practices

1. **Type Safety**
   - Use strict type checking
   - Avoid type assertions
   - Leverage union types
   - Use interfaces for objects

2. **Timestamps**
   - Use Firestore Timestamp
   - Handle timezone differences
   - Convert to Date when needed

3. **Optional Properties**
   - Mark optional fields with ?
   - Provide fallback values
   - Handle undefined cases

4. **Type Composition**
   - Use type inheritance
   - Leverage utility types
   - Keep types DRY
