import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { Message, MessageData, Conversation, User, Channel, TimestampField } from '@/types/models';
import { auth } from '@/lib/firebase';
import { Auth, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  serverTimestamp,
  DocumentReference,
  DocumentData,
  FieldValue
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
};

export interface MessagingState extends ActionTypes {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentConversationId: string | null;
  userStatus: string;
  messages: Message[];
  channels: Channel[];
  currentChannel: Channel | null;
  loadingMessages: boolean;
  error: string | null;
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
  loadingMessages: false,
  error: null
};

type MessageUpdateData = Partial<Omit<MessageData, 'id' | 'conversationId' | 'senderId' | 'senderName'>>;

export const useMessagingStore = create<MessagingState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      setCurrentConversation: (conversation) => {
        set({ 
          currentConversation: conversation, 
          currentConversationId: conversation?.id || null,
          messages: [], 
          loadingMessages: true 
        });
        if (conversation) {
          subscribeToMessages(conversation.id, (messages) => {
            set({ messages, loadingMessages: false });
          });
        }
      },

      setCurrentChannel: (channel) => {
        set({ currentChannel: channel, messages: [], loadingMessages: true });
        if (channel) {
          subscribeToMessages(channel.id, (messages) => {
            set({ messages, loadingMessages: false });
          });
        }
      },

      sendMessage: async (content, type = 'text', metadata?) => {
        try {
          const { currentConversation, currentChannel } = get();
          if (!currentConversation && !currentChannel) return;

          const currentUser = auth.currentUser;
          if (!currentUser) throw new Error('User not authenticated');

          const messageData: Partial<MessageData> = {
            content,
            type,
            metadata,
            senderId: currentUser.uid,
            ...(currentConversation 
              ? { conversationId: currentConversation.id }
              : { channelId: currentChannel!.id }
            ),
            timestamp: serverTimestamp(),
            reactions: {},
          };

          await sendMessage(messageData);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      editMessage: async (messageId: string, newContent: string) => {
        try {
          const update: MessageUpdateData = {
            content: newContent,
            editedAt: serverTimestamp()
          };
          await editMessage(messageId, update);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      deleteMessage: async (messageId: string) => {
        try {
          await deleteMessage(messageId);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      reactToMessage: async (messageId: string, reaction: string) => {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) throw new Error('User not authenticated');

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
          set({ error: (error as Error).message });
        }
      },

      markMessageAsRead: async (messageId: string) => {
        try {
          await updateMessageStatus(messageId, 'read');
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      pinMessage: async (messageId: string) => {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) throw new Error('User not authenticated');

          const update: MessageUpdateData = {
            isPinned: true,
            pinnedAt: serverTimestamp(),
            pinnedBy: currentUser.uid
          };
          await updateMessage(messageId, update);
        } catch (error) {
          set({ error: (error as Error).message });
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
          set({ error: (error as Error).message });
        }
      },
    }))
  )
);

export const initializeMessaging = (userId: string) => {
  subscribeToConversations(userId, (conversations) => {
    useMessagingStore.setState({ conversations });
  });
};

export const useCurrentConversation = () => {
  return useMessagingStore((state) => ({
    conversation: state.currentConversation,
    setConversation: state.setCurrentConversation,
  }));
};

export const useMessages = () => {
  return useMessagingStore((state) => ({
    messages: state.messages,
    loading: state.loadingMessages,
    currentConversation: state.currentConversation,
    sendMessage: state.sendMessage,
    editMessage: state.editMessage,
    deleteMessage: state.deleteMessage,
    reactToMessage: state.reactToMessage,
    markAsRead: state.markMessageAsRead,
    pinMessage: state.pinMessage,
    unpinMessage: state.unpinMessage,
  }));
};

export const useChannels = () => {
  return useMessagingStore((state) => ({
    channels: state.channels,
    currentChannel: state.currentChannel,
    setCurrentChannel: state.setCurrentChannel,
  }));
};
