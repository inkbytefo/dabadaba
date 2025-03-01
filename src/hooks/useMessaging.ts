import { useEffect, useCallback, useRef } from 'react';
import { useMessagingStore } from '@/store/messaging';
import {
  subscribeToMessages,
  subscribeToConversations,
  sendMessageWithRetry
} from '@/services/firestore/messaging';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

// Global subscription manager
const subscriptionManager = {
  conversations: null as null | (() => void),
  messages: null as null | (() => void),
  cleanup() {
    if (this.conversations) {
      this.conversations();
      this.conversations = null;
    }
    if (this.messages) {
      this.messages();
      this.messages = null;
    }
  }
};

export const initializeMessaging = async (userId: string) => {
  // Cleanup existing subscriptions
  subscriptionManager.cleanup();
  
  const store = useMessagingStore.getState();
  store.reset();
  store.setLoading(true);

  try {
    subscriptionManager.conversations = subscribeToConversations(userId, (conversations) => {
      store.setConversations(conversations);
      store.setLoading(false);
    });

    return () => {
      subscriptionManager.cleanup();
      store.reset();
    };
  } catch (error) {
    console.error('Error initializing messaging:', error);
    store.setError(error as Error);
    store.setLoading(false);
    throw error;
  }
};

export const useMessaging = () => {
  const store = useMessagingStore();
  const messageSubscriptionRef = useRef<(() => void) | null>(null);

  // Aktif konuşma değiştiğinde mesajları yükle
  useEffect(() => {
    const activeConversationId = store.activeConversationId;
    const activeConversation = activeConversationId 
      ? store.normalized.conversations.byId[activeConversationId]
      : null;

    if (!activeConversation) return;

    const loadMessages = () => {
      // Önceki aboneliği temizle
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current();
        messageSubscriptionRef.current = null;
      }

      try {
        // Yeni mesajları dinle
        messageSubscriptionRef.current = subscribeToMessages(
          activeConversation.id,
          (messages) => {
            store.setMessages(messages);
          }
        );
      } catch (error) {
        console.error('Error loading messages:', error);
        store.setError(error as Error);
      }
    };

    loadMessages();

    return () => {
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current();
        messageSubscriptionRef.current = null;
      }
    };
  }, [store.activeConversationId]);

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text'
  ) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Mesaj göndermek için giriş yapmalısınız');
      return;
    }

    try {
      await sendMessageWithRetry(conversationId, content, type);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Mesaj gönderilemedi, tekrar deneniyor...');
      throw error;
    }
  }, []);

  // Normalize edilmiş state'ten veriyi dönüştür
  const messages = store.normalized.messages.allIds
    .map(id => store.normalized.messages.byId[id])
    .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

  const conversations = store.normalized.conversations.allIds
    .map(id => store.normalized.conversations.byId[id]);

  return {
    messages,
    conversations,
    isLoading: store.isLoading,
    error: store.error,
    sendMessage,
  };
};