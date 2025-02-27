import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { Message, MessageData, Conversation, User, Channel, TimestampField, MessageStatus } from '@/types/models';
import { auth } from '@/lib/firebase';
import { Auth, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  serverTimestamp,
  DocumentReference,
  DocumentData,
  FieldValue,
  Timestamp
} from 'firebase/firestore';
import { 
  subscribeToMessages, 
  sendMessage, 
  editMessage, 
  deleteMessage, 
  updateMessageStatus, 
  updateMessage 
} from '@/services/firestore/messages';
import { subscribeToConversations } from '@/services/firestore/conversations';

// Error types for better error handling
type MessageError = {
  code: 'AUTH_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'UNKNOWN_ERROR';
  message: string;
};

type MessagingStatus = {
  isLoading: boolean;
  error: MessageError | null;
};

type ActionTypes = {
  pinMessage: (messageId: string) => Promise<void>;
  unpinMessage: (messageId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  sendMessage: (content: string, type?: Message['type'], metadata?: Message['metadata']) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, reaction: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  setError: (error: MessageError | null) => void;
  setLoading: (isLoading: boolean) => void;
};

export interface MessagingState extends ActionTypes {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentConversationId: string | null;
  userStatus: string;
  messages: Message[];
  channels: Channel[];
  currentChannel: Channel | null;
  status: MessagingStatus;
  optimisticUpdates: Map<string, Message>;
}

type StateWithoutActions = Omit<MessagingState, keyof ActionTypes>;

const initialState: StateWithoutActions = {
  conversations: [],
  userStatus: 'Online',
  currentConversation: null,
  currentConversationId: null,
  messages: [],
  channels: [],
  currentChannel: null,
  status: {
    isLoading: false,
    error: null
  },
  optimisticUpdates: new Map()
};

type MessageUpdateData = Partial<Omit<MessageData, 'id' | 'conversationId' | 'senderId' | 'senderName'>>;

// Helper function to create optimistic updates
const createOptimisticMessage = (
  content: string, 
  type: Message['type'], 
  metadata?: Message['metadata'],
  currentUser?: FirebaseUser | null
): Message => ({
  id: `optimistic-${Date.now()}`,
  content,
  type,
  metadata,
  senderId: currentUser?.uid || '',
  senderName: currentUser?.displayName || '',
  conversationId: '',
  timestamp: Timestamp.now(),
  status: 'sending' as MessageStatus,
  reactions: {},
  isPinned: false
});

export const useMessagingStore = create<MessagingState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      setError: (error) => set((state) => ({
        status: { ...state.status, error }
      })),

      setLoading: (isLoading) => set((state) => ({
        status: { ...state.status, isLoading }
      })),

      setCurrentConversation: (conversation) => {
        set((state) => ({ 
          currentConversation: conversation, 
          currentConversationId: conversation?.id || null,
          messages: [] as Message[],
          status: { ...state.status, isLoading: true }
        }));

        if (conversation) {
          subscribeToMessages(conversation.id, (messages) => {
            set((state) => ({ 
              messages: messages as Message[],
              status: { ...state.status, isLoading: false }
            }));
          });
        }
      },

      setCurrentChannel: (channel) => {
        set((state) => ({ 
          currentChannel: channel, 
          messages: [] as Message[],
          status: { ...state.status, isLoading: true }
        }));

        if (channel) {
          subscribeToMessages(channel.id, (messages) => {
            set((state) => ({ 
              messages: messages as Message[],
              status: { ...state.status, isLoading: false }
            }));
          });
        }
      },

      sendMessage: async (content, type = 'text', metadata?) => {
        const currentUser = auth.currentUser;
        const { currentConversation, currentChannel } = get();

        if (!currentConversation && !currentChannel) {
          set((state) => ({
            status: {
              ...state.status,
              error: {
                code: 'UNKNOWN_ERROR',
                message: 'No active conversation or channel'
              }
            }
          }));
          return;
        }

        if (!currentUser) {
          set((state) => ({
            status: {
              ...state.status,
              error: {
                code: 'AUTH_ERROR',
                message: 'User not authenticated'
              }
            }
          }));
          return;
        }

        // Create optimistic message
        const optimisticMessage = createOptimisticMessage(content, type, metadata, currentUser);
        
        set((state) => ({
          messages: [...state.messages, optimisticMessage],
          optimisticUpdates: new Map(state.optimisticUpdates).set(optimisticMessage.id, optimisticMessage)
        }));

        try {
          const messageData: Partial<MessageData> = {
            content,
            type,
            metadata,
            senderId: currentUser.uid,
            status: 'sending' as MessageStatus,
            ...(currentConversation 
              ? { conversationId: currentConversation.id }
              : { channelId: currentChannel!.id }
            ),
            timestamp: serverTimestamp() as TimestampField,
            reactions: {},
          };

          await sendMessage(messageData);
          
          // Remove optimistic update on success
          set((state) => {
            const updates = new Map(state.optimisticUpdates);
            updates.delete(optimisticMessage.id);
            return { optimisticUpdates: updates };
          });
        } catch (error) {
          // Mark optimistic message as failed
          const failedMessage: Message = {
            ...optimisticMessage,
            status: 'sending' as MessageStatus
          };

          set((state) => ({
            messages: state.messages.map(m => 
              m.id === optimisticMessage.id ? failedMessage : m
            ),
            status: {
              ...state.status,
              error: {
                code: 'NETWORK_ERROR',
                message: (error as Error).message
              }
            }
          }));
        }
      },

      editMessage: async (messageId: string, newContent: string) => {
        set((state) => ({ status: { ...state.status, isLoading: true } }));
        
        try {
          const update: MessageUpdateData = {
            content: newContent,
            editedAt: serverTimestamp() as TimestampField
          };
          await editMessage(messageId, update);
          set((state) => ({ status: { ...state.status, isLoading: false } }));
        } catch (error) {
          set((state) => ({
            status: {
              isLoading: false,
              error: {
                code: 'SERVER_ERROR',
                message: (error as Error).message
              }
            }
          }));
        }
      },

      deleteMessage: async (messageId: string) => {
        set((state) => ({ status: { ...state.status, isLoading: true } }));
        
        try {
          await deleteMessage(messageId);
          set((state) => ({ status: { ...state.status, isLoading: false } }));
        } catch (error) {
          set((state) => ({
            status: {
              isLoading: false,
              error: {
                code: 'SERVER_ERROR',
                message: (error as Error).message
              }
            }
          }));
        }
      },

      reactToMessage: async (messageId: string, reaction: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          set((state) => ({
            status: {
              ...state.status,
              error: {
                code: 'AUTH_ERROR',
                message: 'User not authenticated'
              }
            }
          }));
          return;
        }

        try {
          const message = get().messages.find(m => m.id === messageId);
          if (!message) return;

          const reactions = { ...message.reactions };
          if (reactions[currentUser.uid] === reaction) {
            delete reactions[currentUser.uid];
          } else {
            reactions[currentUser.uid] = reaction;
          }

          const update: MessageUpdateData = { reactions };
          await updateMessage(messageId, update);
        } catch (error) {
          set((state) => ({
            status: {
              ...state.status,
              error: {
                code: 'SERVER_ERROR',
                message: (error as Error).message
              }
            }
          }));
        }
      },

      markMessageAsRead: async (messageId: string) => {
        try {
          await updateMessageStatus(messageId, 'read' as MessageStatus);
        } catch (error) {
          set((state) => ({
            status: {
              ...state.status,
              error: {
                code: 'SERVER_ERROR',
                message: (error as Error).message
              }
            }
          }));
        }
      },

      pinMessage: async (messageId: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          set((state) => ({
            status: {
              ...state.status,
              error: {
                code: 'AUTH_ERROR',
                message: 'User not authenticated'
              }
            }
          }));
          return;
        }

        try {
          const update: MessageUpdateData = {
            isPinned: true,
            pinnedAt: serverTimestamp() as TimestampField,
            pinnedBy: currentUser.uid
          };
          await updateMessage(messageId, update);
        } catch (error) {
          set((state) => ({
            status: {
              ...state.status,
              error: {
                code: 'SERVER_ERROR',
                message: (error as Error).message
              }
            }
          }));
        }
      },

      unpinMessage: async (messageId: string) => {
        try {
          const update: MessageUpdateData = {
            isPinned: false,
            pinnedAt: null,
            pinnedBy: null
          };
          await updateMessage(messageId, update);
        } catch (error) {
          set((state) => ({
            status: {
              ...state.status,
              error: {
                code: 'SERVER_ERROR',
                message: (error as Error).message
              }
            }
          }));
        }
      },
    }))
  )
);

let unsubscribeMessaging: (() => void) | null = null;

export const initializeMessaging = (userId: string) => {
  // Set loading state
  useMessagingStore.setState((state) => ({
    status: { ...state.status, isLoading: true }
  }));

  // Clean up existing subscription
  if (unsubscribeMessaging) {
    unsubscribeMessaging();
    unsubscribeMessaging = null;
  }

  // Reset store state
  useMessagingStore.setState({
    ...initialState,
    status: { isLoading: true, error: null }
  });

  // Create new subscription
  unsubscribeMessaging = subscribeToConversations(userId, (conversations) => {
    useMessagingStore.setState((state) => ({
      conversations,
      status: { ...state.status, isLoading: false }
    }));
  });

  // Return cleanup function
  return () => {
    if (unsubscribeMessaging) {
      unsubscribeMessaging();
      unsubscribeMessaging = null;
    }
    // Reset store on cleanup
    useMessagingStore.setState(initialState);
  };
};

// Memoized selectors with complete typing
const currentConversationSelector = (state: MessagingState) => ({
  conversation: state.currentConversation,
  setConversation: state.setCurrentConversation,
  isLoading: state.status.isLoading,
  error: state.status.error
});

const messagesSelector = (state: MessagingState) => ({
  messages: state.messages,
  currentConversation: state.currentConversation,
  isLoading: state.status.isLoading,
  error: state.status.error,
  optimisticUpdates: state.optimisticUpdates,
  sendMessage: state.sendMessage,
  editMessage: state.editMessage,
  deleteMessage: state.deleteMessage,
  reactToMessage: state.reactToMessage,
  markAsRead: state.markMessageAsRead,
  pinMessage: state.pinMessage,
  unpinMessage: state.unpinMessage,
});

const channelsSelector = (state: MessagingState) => ({
  channels: state.channels,
  currentChannel: state.currentChannel,
  setCurrentChannel: state.setCurrentChannel,
  isLoading: state.status.isLoading,
  error: state.status.error
});

export const useCurrentConversation = () => useMessagingStore(currentConversationSelector);
export const useMessages = () => useMessagingStore(messagesSelector);
export const useChannels = () => useMessagingStore(channelsSelector);
