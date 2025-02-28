# Store Documentation

This document provides details about the Zustand store located in the `src/store` directory, which manages the application's global state.

## Messaging Store (`messaging.ts`)

The messaging store handles all chat-related state management including conversations, messages, channels, and real-time updates.

### State Structure

```typescript
interface MessagingState {
  // Collections
  conversations: Conversation[];
  messages: Message[];
  channels: Channel[];
  
  // Active Items
  currentConversation: Conversation | null;
  currentConversationId: string | null;
  currentChannel: Channel | null;
  
  // User State
  userStatus: string;
  
  // UI State
  status: {
    isLoading: boolean;
    error: MessageError | null;
  };
  
  // Optimistic Updates
  optimisticUpdates: Map<string, Message>;
}
```

### Actions

#### Conversation Management
- `setCurrentConversation(conversation: Conversation | null)`: Set active conversation
- `setCurrentChannel(channel: Channel | null)`: Set active channel

#### Message Operations
- `sendMessage(content: string, type?: Message['type'], metadata?: Message['metadata'])`: Send new message
- `editMessage(messageId: string, newContent: string)`: Edit existing message
- `deleteMessage(messageId: string)`: Delete message
- `reactToMessage(messageId: string, reaction: string)`: Add/remove reaction
- `markMessageAsRead(messageId: string)`: Mark message as read
- `pinMessage(messageId: string)`: Pin message
- `unpinMessage(messageId: string)`: Unpin message

#### State Management
- `setError(error: MessageError | null)`: Update error state
- `setLoading(isLoading: boolean)`: Update loading state

### Hooks and Selectors

```typescript
// Get current conversation
const { conversation, setConversation, isLoading, error } = useCurrentConversation();

// Access messages and actions
const {
  messages,
  currentConversation,
  sendMessage,
  editMessage,
  deleteMessage,
  // ... other actions
} = useMessages();

// Channel management
const { channels, currentChannel, setCurrentChannel } = useChannels();
```

### Error Handling

The store uses typed error handling:

```typescript
type MessageError = {
  code: 'AUTH_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'UNKNOWN_ERROR';
  message: string;
};
```

Example usage:
```typescript
try {
  await sendMessage('Hello');
} catch (error) {
  // Store automatically handles error state
  // Access via status.error in components
}
```

### Optimistic Updates

The store implements optimistic updates for better UX:

```typescript
// When sending a message:
1. Create optimistic message with temporary ID
2. Add to messages list immediately
3. Track in optimisticUpdates Map
4. On success: Remove from optimisticUpdates
5. On failure: Mark message as failed
```

### Real-time Subscriptions

The store manages Firebase subscriptions:

```typescript
// Initialize messaging for a user
const cleanup = initializeMessaging(userId);

// Automatically handles:
- Conversation subscription
- Message subscription for active conversation
- Real-time updates
- Cleanup on unmount
```

### Usage Examples

1. **Sending a Message**
```typescript
const { sendMessage } = useMessages();

const handleSend = async (content: string) => {
  await sendMessage(content, 'text');
};
```

2. **Switching Conversations**
```typescript
const { setConversation } = useCurrentConversation();

const handleSelect = (conversation: Conversation) => {
  setConversation(conversation);
};
```

3. **Message Reactions**
```typescript
const { reactToMessage } = useMessages();

const handleReact = async (messageId: string, emoji: string) => {
  await reactToMessage(messageId, emoji);
};
```

4. **Error Handling in Components**
```typescript
const { error, isLoading } = useMessages();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
```

### Best Practices

1. **Subscription Management**
   - Initialize messaging on auth
   - Clean up subscriptions on logout
   - Use provided hooks for consistent access

2. **Error Handling**
   - Check error states in components
   - Display appropriate error UI
   - Handle retries for failed operations

3. **Optimistic Updates**
   - Use optimistic UI for better UX
   - Handle failure states gracefully
   - Show pending state for operations

4. **Performance**
   - Use selectors to minimize rerenders
   - Clean up subscriptions when not needed
   - Leverage optimistic updates

### Migration Guide

When making changes to the messaging store:

1. Update types in `models.ts`
2. Update store state and actions
3. Update selectors if needed
4. Test all affected components
5. Update documentation
