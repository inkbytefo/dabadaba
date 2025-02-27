import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Message, MessageData } from '@/types/models';

// Convert Firestore data to Message type
const convertMessageData = (doc: QueryDocumentSnapshot<DocumentData>): Message => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    timestamp: data.timestamp?.toDate() ? data.timestamp : new Date(),
    editedAt: data.editedAt?.toDate() || null,
    pinnedAt: data.pinnedAt?.toDate() || null,
    deletedAt: data.deletedAt?.toDate() || null,
  } as Message;
};

export const sendMessage = async (messageData: Partial<MessageData>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const message: Partial<MessageData> = {
      ...messageData,
      senderId: user.uid,
      timestamp: serverTimestamp(),
      status: 'sent',
    };

    return await addDoc(collection(db, 'messages'), message);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const editMessage = async (messageId: string, data: Partial<MessageData>) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      ...data,
      editedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      content: "This message has been deleted"
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const updateMessageStatus = async (messageId: string, status: Message['status']) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, { status });
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

export const updateMessage = async (messageId: string, data: Partial<MessageData>) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(convertMessageData);
    callback(messages);
  });
};
