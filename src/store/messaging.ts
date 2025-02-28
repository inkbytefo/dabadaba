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
  sendMessage as apiSendMessage, 
  editMessage as apiEditMessage, 
  deleteMessage as apiDeleteMessage, 
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
  reset: () => void;
};

type StateWithoutActions = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentConversationId: string | null;
  userStatus: string;
  messages: Message[];
  channels: Channel[];
  currentChannel: Channel | null;
  status: MessagingStatus;
  optimisticUpdates: Map<string, Message>;
};

export interface MessagingState extends StateWithoutActions, ActionTypes {}

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

let unsubscribeMessaging: (() => void) | null = null;
let unsubscribeMessages: (() => void) | null = null;

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
      
      reset: () => {
        if (unsubscribeMessages) {
          unsubscribeMessages();
          unsubscribeMessages = null;
        }
        if (unsubscribeMessaging) {
          unsubscribeMessaging();
          unsubscribeMessaging = null;
        }
        set(initialState);
      },
      
      setCurrentConversation: (conversation) => {
        if (unsubscribeMessages) {
          unsubscribeMessages();
          unsubscribeMessages = null;
        }

        set((state) => ({ 
          currentConversation: conversation, 
          currentConversationId: conversation?.id || null,
          messages: [],
          status: { ...state.status, isLoading: true }
        }));

        if (conversation) {
          try {
            unsubscribeMessages = subscribeToMessages(
              conversation.id,
              (messages) => {
                set((state) => ({ 
                  messages: messages as Message[],
                  status: { ...state.status, isLoading: false }
                }));
              }
            );
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
        }
      },

      setCurrentChannel: (channel) => {
        if (unsubscribeMessages) {
          unsubscribeMessages();
          unsubscribeMessages = null;
        }

        set((state) => ({ 
          currentChannel: channel, 
          messages: [],
          status: { ...state.status, isLoading: true }
        }));

        if (channel) {
          try {
            unsubscribeMessages = subscribeToMessages(
              channel.id,
              (messages) => {
                set((state) => ({ 
                  messages: messages as Message[],
                  status: { ...state.status, isLoading: false }
                }));
              }
            );
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
          throw new Error('User not authenticated');
        }

        const messageData: Partial<MessageData> = {
          content,
          type,
          metadata,
          senderId: currentUser.uid,
          senderName: currentUser.displayName || '',
          status: 'sending',
          ...(currentConversation 
            ? { conversationId: currentConversation.id }
            : { channelId: currentChannel!.id }
          ),
          timestamp: serverTimestamp() as TimestampField,
          reactions: {},
        };

        await apiSendMessage(messageData);
      },

      editMessage: async (messageId, newContent) => {
        const update: MessageUpdateData = {
          content: newContent,
          editedAt: serverTimestamp() as TimestampField
        };
        await apiEditMessage(messageId, update);
      },

      deleteMessage: async (messageId) => {
        await apiDeleteMessage(messageId);
      },

      reactToMessage: async (messageId, reaction) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const message = get().messages.find(m => m.id === messageId);
        if (!message) return;

        const reactions = { ...message.reactions };
        if (reactions[currentUser.uid] === reaction) {
          delete reactions[currentUser.uid];
        } else {
          reactions[currentUser.uid] = reaction;
        }

        await updateMessage(messageId, { reactions });
      },

      markMessageAsRead: async (messageId) => {
        await updateMessageStatus(messageId, 'read');
      },

      pinMessage: async (messageId) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        await updateMessage(messageId, {
          isPinned: true,
          pinnedAt: serverTimestamp() as TimestampField,
          pinnedBy: currentUser.uid
        });
      },

      unpinMessage: async (messageId) => {
        await updateMessage(messageId, {
          isPinned: false,
          pinnedAt: null,
          pinnedBy: null
        });
      },
    }))
  )
);

export const initializeMessaging = (userId: string) => {
  useMessagingStore.getState().setLoading(true);

  if (unsubscribeMessaging) {
    unsubscribeMessaging();
    unsubscribeMessaging = null;
  }
  
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  // Reset store state
  useMessagingStore.setState({
    ...initialState,
    status: { isLoading: true, error: null }
  });

  unsubscribeMessaging = subscribeToConversations(userId, (conversations) => {
    useMessagingStore.setState((state) => {
      const shouldSetFirstConversation = conversations.length > 0 && !state.currentConversation;
      
      return {
        conversations,
        ...(shouldSetFirstConversation && {
          currentConversation: conversations[0],
          currentConversationId: conversations[0].id
        }),
        status: { ...state.status, isLoading: false }
      };
    });

    const firstConversation = conversations[0];
    if (firstConversation) {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
      
      try {
        unsubscribeMessages = subscribeToMessages(
          firstConversation.id,
          (messages) => {
            useMessagingStore.setState({
              messages: messages as Message[],
              status: { isLoading: false, error: null }
            });
          }
        );
      } catch (error) {
        console.error("[Messaging] Error subscribing to messages:", error);
        useMessagingStore.setState({
          status: {
            isLoading: false,
            error: {
              code: 'SERVER_ERROR',
              message: (error as Error).message
            }
          }
        });
      }
    }
  });

  return () => {
    if (unsubscribeMessaging) {
      unsubscribeMessaging();
      unsubscribeMessaging = null;
    }
    
    if (unsubscribeMessages) {
      unsubscribeMessages();
      unsubscribeMessages = null;
    }
    useMessagingStore.setState(initialState);
  };
};

// Selectors
export const currentConversationSelector = (state: MessagingState) => ({
  conversation: state.currentConversation,
  setConversation: state.setCurrentConversation,
  isLoading: state.status.isLoading,
  error: state.status.error
});

export const messagesSelector = (state: MessagingState) => ({
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
  unpinMessage: state.unpinMessage
});

export const channelsSelector = (state: MessagingState) => ({
  channels: state.channels,
  currentChannel: state.currentChannel,
  setCurrentChannel: state.setCurrentChannel,
  isLoading: state.status.isLoading,
  error: state.status.error
});

export const useCurrentConversation = () => useMessagingStore(currentConversationSelector);
export const useMessages = () => useMessagingStore(messagesSelector);
export const useChannels = () => useMessagingStore(channelsSelector);
