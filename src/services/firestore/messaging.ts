import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Message, Conversation } from '@/store/messaging';
import { retryOperation } from './index'; // Import retryOperation

// Firestore koleksiyon referansları
const MESSAGES_COLLECTION = 'messages';
const CONVERSATIONS_COLLECTION = 'conversations';

// Veri dönüşüm yardımcıları
const convertMessage = (doc: QueryDocumentSnapshot<DocumentData>): Message => {
  const data = doc.data();
  return {
    id: doc.id,
    content: data.content,
    senderId: data.senderId,
    senderName: data.senderName,
    conversationId: data.conversationId,
    timestamp: data.timestamp,
    status: data.status,
    type: data.type,
    metadata: data.metadata,
    reactions: data.reactions || {},
  };
};

const convertConversation = (doc: QueryDocumentSnapshot<DocumentData>): Conversation => {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type,
    name: data.name,
    photoURL: data.photoURL,
    participants: data.participants || {},
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastMessage: data.lastMessage,
    lastMessageTimestamp: data.lastMessageTimestamp,
    unreadCount: data.unreadCount || 0,
  };
};

// Mesaj İşlemleri
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(convertMessage);
    callback(messages);
  });
};

export const sendMessage = async (
  conversationId: string,
  content: string,
  type: Message['type'] = 'text'
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const messageData = {
    content,
    type,
    senderId: user.uid,
    senderName: user.displayName || '',
    conversationId,
    timestamp: serverTimestamp(),
    status: 'sending' as const,
  };

  const messageRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
  
  // Konuşmayı güncelle
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(conversationRef, {
    lastMessage: content,
    lastMessageTimestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return messageRef.id;
};

export const sendMessageWithRetry = async (
  conversationId: string,
  content: string,
  type: Message['type'] = 'text'
): Promise<string> => {
  return retryOperation(async () => {
    return sendMessage(conversationId, content, type);
  });
};

// Konuşma İşlemleri
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  // Konuşmaları sadece updatedAt'e göre sıralıyoruz
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where(`participants.${userId}`, '==', true),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(convertConversation);
    callback(conversations);
  });
};

export const createConversation = async (participants: string[]) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Katılımcıları map'e çevir
  const participantsMap = participants.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {} as { [key: string]: boolean });

  // Konuşma oluşturucu kullanıcıyı da ekle
  participantsMap[user.uid] = true;

  const conversationData = {
    type: 'private' as const,
    name: participants.join(', '),
    participants: participantsMap,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const conversationRef = await addDoc(
    collection(db, CONVERSATIONS_COLLECTION),
    conversationData
  );

  return conversationRef.id;
};

export const createConversationWithRetry = async (participants: string[]): Promise<string> => {
  return retryOperation(async () => {
    return createConversation(participants);
  });
};

export const updateConversation = async (
  conversationId: string,
  updates: Partial<Omit<Conversation, 'id'>>
) => {
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(conversationRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const updateConversationWithRetry = async (
  conversationId: string,
  updates: Partial<Omit<Conversation, 'id'>>
): Promise<void> => {
  return retryOperation(async () => {
    await updateConversation(conversationId, updates);
  });
};

export const deleteConversation = async (conversationId: string) => {
  // İlgili mesajları sil
  const messagesQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId)
  );
  
  const messagesSnapshot = await getDocs(messagesQuery);
  const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Konuşmayı sil
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await deleteDoc(conversationRef);
};

export const deleteConversationWithRetry = async (conversationId: string): Promise<void> => {
  return retryOperation(async () => {
    await deleteConversation(conversationId);
  });
};