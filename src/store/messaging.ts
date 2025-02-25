import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { Message, Conversation, User, Channel } from '@/types/models';
import * as FirebaseService from '@/services/firebase';

interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  channels: Channel[];
  currentChannel: Channel | null;
  loadingMessages: boolean;
  error: string | null;
  // Actions
  pinMessage: (messageId: string) => Promise<void>;
  unpinMessage: (messageId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  sendMessage: (content: string, type?: Message['type'], metadata?: Message['metadata']) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, reaction: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
}

export const useMessagingStore = create<MessagingState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      channels: [],
      currentChannel: null,
      loadingMessages: false,
      error: null,

      setCurrentConversation: (conversation) => {
        set({ currentConversation: conversation, messages: [], loadingMessages: true });
        if (conversation) {
          FirebaseService.subscribeToMessages(conversation.id, (messages) => {
            set({ messages, loadingMessages: false });
          });
        }
      },

      setCurrentChannel: (channel) => {
        set({ currentChannel: channel, messages: [], loadingMessages: true });
        if (channel) {
          FirebaseService.subscribeToMessages(channel.id, (messages) => {
            set({ messages, loadingMessages: false });
          });
        }
      },

      sendMessage: async (content, type = 'text', metadata?) => {
        try {
          const { currentConversation, currentChannel } = get();
          if (!currentConversation && !currentChannel) return;

          const messageData = {
            content,
            type: type as Message['type'],
            metadata,
            senderId: window.auth.currentUser?.uid as string,
            ...(currentConversation 
              ? { conversationId: currentConversation.id }
              : { channelId: currentChannel!.id }
            ),
            reactions: {},
          };

          await FirebaseService.sendMessage(messageData);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      editMessage: async (messageId, newContent) => {
        try {
          await FirebaseService.updateDoc(messageId, {
            content: newContent,
            editedAt: new Date(),
          });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      deleteMessage: async (messageId) => {
        try {
          await FirebaseService.deleteDoc(messageId);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      reactToMessage: async (messageId, reaction) => {
        try {
          const userId = window.auth.currentUser?.uid;
          if (!userId) return;

          const message = get().messages.find(m => m.id === messageId);
          if (!message) return;

          const reactions = { ...message.reactions };
          if (reactions[userId] === reaction) {
            delete reactions[userId];
          } else {
            reactions[userId] = reaction;
          }

          await FirebaseService.updateDoc(messageId, { reactions });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      markMessageAsRead: async (messageId) => {
        try {
          await FirebaseService.updateMessageStatus(messageId, 'read');
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      pinMessage: async (messageId) => {
        try {
          const userId = window.auth.currentUser?.uid;
          if (!userId) return;

          await FirebaseService.updateDoc(messageId, {
            isPinned: true,
            pinnedAt: new Date(),
            pinnedBy: userId
          });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      unpinMessage: async (messageId) => {
        try {
          await FirebaseService.updateDoc(messageId, {
            isPinned: false,
            pinnedAt: null,
            pinnedBy: null
          });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
    }))
  )
);

// Subscribe to conversations when the user is authenticated
export const initializeMessaging = (userId: string) => {
  FirebaseService.subscribeToConversations(userId, (conversations) => {
    useMessagingStore.setState({ conversations });
  });
};

// Custom hooks for components
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
