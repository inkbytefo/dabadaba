import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { Timestamp } from 'firebase/firestore';

// Interfaces
export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  timestamp: Timestamp;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    imageWidth?: number;
    imageHeight?: number;
    thumbnailUrl?: string;
  };
  reactions?: { [userId: string]: string };
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  name: string;
  photoURL?: string;
  participants: { [userId: string]: boolean };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage?: string;
  lastMessageTimestamp?: Timestamp;
  unreadCount?: number;
  metadata?: {
    description?: string;
    isArchived?: boolean;
    isMuted?: boolean;
    pinnedMessages?: string[];
  };
}

export interface NormalizedState {
  conversations: {
    byId: { [id: string]: Conversation };
    allIds: string[];
  };
  messages: {
    byId: { [id: string]: Message };
    allIds: string[];
  };
}

export interface MessagingState {
  // State
  activeConversationId: string | null;
  normalized: NormalizedState;
  isLoading: boolean;
  error: Error | null;
  userStatus: 'Online' | 'Away' | 'Offline' | 'DoNotDisturb';
   
  // Actions
  setActiveConversation: (conversationId: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  setError: (error: Error | null) => void;
  setLoading: (isLoading: boolean) => void;
  setUserStatus: (status: MessagingState['userStatus']) => void;
  reset: () => void;
  cleanupCache: () => void;
}

const MAX_CACHED_MESSAGES = 1000;
const MESSAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 saat

type SetState = (
  fn: MessagingState | Partial<MessagingState> | ((state: MessagingState) => MessagingState | Partial<MessagingState>)
) => void;

type GetState = () => MessagingState;

type StoreApi = {
  setState: SetState;
  getState: GetState;
  subscribe: (listener: (state: MessagingState, prevState: MessagingState) => void) => () => void;
};

const cleanupMiddleware = (config: (set: SetState, get: GetState, api: StoreApi) => MessagingState) => (
  set: SetState,
  get: GetState,
  api: StoreApi
) => {
  const cleanup = () => {
    const state = get();
    const now = Date.now();
    const messages = state.normalized.messages;
    
    // TTL kontrolü ve aktif olmayan konuşma mesajlarını temizle
    const validMessages: { [id: string]: Message } = {};
    const validMessageIds: string[] = [];
    
    messages.allIds.forEach((id: string) => {
      const message = messages.byId[id];
      const messageAge = now - message.timestamp.toMillis();
      const isFromActiveConversation = message.conversationId === state.activeConversationId;
      
      if (messageAge < MESSAGE_CACHE_TTL || isFromActiveConversation) {
        validMessages[id] = message;
        validMessageIds.push(id);
      }
    });

    // Maksimum cache boyutu kontrolü
    if (validMessageIds.length > MAX_CACHED_MESSAGES) {
      const sortedIds = validMessageIds.sort((a: string, b: string) => 
        messages.byId[b].timestamp.toMillis() - messages.byId[a].timestamp.toMillis()
      );

      const keepIds = sortedIds.slice(0, MAX_CACHED_MESSAGES);
      const filteredMessages: { [id: string]: Message } = {};
      keepIds.forEach((id: string) => {
        filteredMessages[id] = validMessages[id];
      });

      set({
        normalized: {
          ...state.normalized,
          messages: {
            byId: filteredMessages,
            allIds: keepIds
          }
        }
      });
    }
  };

  const store = config(
    (...args: [MessagingState | Partial<MessagingState> | ((state: MessagingState) => MessagingState | Partial<MessagingState>)]) => {
      set(...args);
      cleanup();
    },
    get,
    api
  );

  return {
    ...store,
    cleanupCache: cleanup
  };
};

const initialState: Pick<MessagingState, 
  'activeConversationId' | 'normalized' | 'isLoading' | 'error' | 'userStatus'
> = {
  activeConversationId: null,
  normalized: {
    conversations: {
      byId: {},
      allIds: [],
    },
    messages: {
      byId: {},
      allIds: [],
    },
  },
  isLoading: false,
  error: null,
  userStatus: 'Online' as const,
};

export const useMessagingStore = create<MessagingState>()(
  subscribeWithSelector(
    devtools(
      cleanupMiddleware((set, get) => ({
        ...initialState,

        setActiveConversation: (conversationId: string | null) => 
          set({ activeConversationId: conversationId }),

        setConversations: (conversations: Conversation[]) => {
          const byId: { [id: string]: Conversation } = {};
          const allIds: string[] = [];
          
          conversations.forEach((conv: Conversation) => {
            byId[conv.id] = conv;
            allIds.push(conv.id);
          });

          set(state => ({
            normalized: {
              ...state.normalized,
              conversations: { byId, allIds }
            }
          }));
        },

        setMessages: (messages: Message[]) => {
          const byId: { [id: string]: Message } = {};
          const allIds: string[] = [];
          
          messages.forEach((msg: Message) => {
            byId[msg.id] = msg;
            allIds.push(msg.id);
          });

          set(state => ({
            normalized: {
              ...state.normalized,
              messages: { byId, allIds }
            }
          }));
        },

        addMessage: (message: Message) => {
          if (!message.id) return;
          
          set((state: MessagingState) => {
            const existingMessage = state.normalized.messages.byId[message.id];
            if (existingMessage && 
                existingMessage.timestamp === message.timestamp && 
                existingMessage.status === message.status) {
              return state;
            }

            return {
              normalized: {
                ...state.normalized,
                messages: {
                  byId: {
                    ...state.normalized.messages.byId,
                    [message.id]: message
                  },
                  allIds: state.normalized.messages.allIds.includes(message.id)
                    ? state.normalized.messages.allIds
                    : [...state.normalized.messages.allIds, message.id]
                }
              }
            };
          });
        },

        updateMessage: (messageId: string, updates: Partial<Message>) =>
          set((state: MessagingState) => {
            const message = state.normalized.messages.byId[messageId];
            if (!message) return state;

            return {
              normalized: {
                ...state.normalized,
                messages: {
                  ...state.normalized.messages,
                  byId: {
                    ...state.normalized.messages.byId,
                    [messageId]: { ...message, ...updates }
                  }
                }
              }
            };
          }),

        deleteMessage: (messageId: string) =>
          set((state: MessagingState) => {
            const { [messageId]: deleted, ...remainingMessages } = state.normalized.messages.byId;
            return {
              normalized: {
                ...state.normalized,
                messages: {
                  byId: remainingMessages,
                  allIds: state.normalized.messages.allIds.filter(id => id !== messageId)
                }
              }
            };
          }),

        setUserStatus: (status: MessagingState['userStatus']) => set({ userStatus: status }),
        
        setError: (error: Error | null) => set({ error }),
        
        setLoading: (isLoading: boolean) => set({ isLoading }),
        
        reset: () => set(initialState),
        cleanupCache: () => get().cleanupCache(),
      })),
      { name: 'messaging-store' }
    )
  )
);

// Memoized Selectors
const selectActiveConversation = (state: MessagingState) => {
  const conversationId = state.activeConversationId;
  return conversationId ? state.normalized.conversations.byId[conversationId] : null;
};

const selectConversations = (state: MessagingState) => {
  return state.normalized.conversations.allIds.map(
    id => state.normalized.conversations.byId[id]
  );
};

const selectMessages = (state: MessagingState) => {
  return state.normalized.messages.allIds
    .map(id => state.normalized.messages.byId[id])
    .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
};

// Hook Exports
export const useActiveConversation = () => 
  useMessagingStore(state => ({
    conversation: selectActiveConversation(state),
    setConversation: state.setActiveConversation,
  }));

export const useConversations = () => 
  useMessagingStore(state => ({
    conversations: selectConversations(state),
    setConversations: state.setConversations,
    isLoading: state.isLoading,
    error: state.error,
  }));

export const useMessages = () => 
  useMessagingStore(state => ({
    messages: selectMessages(state),
    addMessage: state.addMessage,
    updateMessage: state.updateMessage,
    deleteMessage: state.deleteMessage,
    isLoading: state.isLoading,
    error: state.error,
  }));