# Services Documentation

This document provides details about the services located in the `src/services` directory. These services handle interactions with Firebase backend services.

## Authentication Services (`auth/`)

### `auth/index.ts`
Handles user authentication operations:
- User sign-in and sign-out
- Registration with email/password
- OAuth authentication (Google, etc.)
- Password reset functionality
- Authentication state management

## Firestore Services (`firestore/`)

### `firestore/index.ts`
Common Firestore utilities and base configurations:
- Database initialization
- Collection references
- Batch operations
- Transaction handlers

### `firestore/users.ts`
User profile and management:
- Create/update user profiles
- Fetch user details
- Update user status (online/offline)
- User preferences management

### `firestore/conversations.ts`
Private chat conversations:
- Create new conversations
- Fetch user conversations
- Update conversation metadata
- Manage conversation participants

### `firestore/messages.ts`
Message handling:
- Send/receive messages
- Message history retrieval
- Message status updates (read/delivered)
- Media message handling
- Real-time message subscriptions

### `firestore/groups.ts`
Group chat functionality:
- Create/delete groups
- Manage group members
- Update group settings
- Group message handling

### `firestore/friends.ts`
Friend relationship management:
- Send/accept friend requests
- Remove friends
- Block/unblock users
- Friend list management

## Storage Services (`storage/`)

### `storage/index.ts`
Firebase Storage operations:
- File uploads (images, documents, etc.)
- File downloads
- File deletion
- Upload progress tracking
- Storage security rules

## Service Integration Example

```typescript
// Example of using multiple services together
import { auth } from '../services/auth';
import { createUserProfile } from '../services/firestore/users';
import { uploadAvatar } from '../services/storage';

async function registerNewUser(email: string, password: string, avatar: File) {
  // Create auth user
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  
  // Upload avatar
  const avatarUrl = await uploadAvatar(userCredential.user.uid, avatar);
  
  // Create user profile
  await createUserProfile(userCredential.user.uid, {
    email,
    avatarUrl,
    createdAt: new Date()
  });
}
```

## Best Practices

1. **Error Handling**
   - All services include proper error handling
   - Errors are properly typed and documented
   - Services provide meaningful error messages

2. **Real-time Updates**
   - Use Firestore snapshots for real-time data
   - Properly unsubscribe from listeners
   - Handle offline/online state

3. **Performance**
   - Implement pagination where appropriate
   - Use batch operations for multiple updates
   - Cache frequently accessed data

4. **Security**
   - Follow principle of least privilege
   - Validate data before writing
   - Implement proper security rules

## Usage Guidelines

1. **Service Initialization**
   - Services are automatically initialized with the app
   - No manual initialization required
   - Services handle their own state management

2. **Error Handling**
```typescript
try {
  await sendMessage(conversationId, message);
} catch (error) {
  if (error.code === 'permission-denied') {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

3. **Real-time Subscriptions**
```typescript
const unsubscribe = onMessages(conversationId, (messages) => {
  // Handle new messages
});

// Clean up subscription
return () => unsubscribe();
```

4. **Batch Operations**
```typescript
const batch = db.batch();
// Add operations to batch
await batch.commit();
```

## Type Definitions

For detailed type definitions used across services, refer to `src/types/models.ts`.
