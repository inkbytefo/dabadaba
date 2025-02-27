import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Message, User, Conversation } from '@/types/models';

export const sendMessage = async (messageData: Partial<Message>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Get sender's display name
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    const senderName = userData?.displayName || user.email || 'Unknown User';

    const message = {
      ...messageData,
      senderId: user.uid,
      senderName,
      timestamp: serverTimestamp(),
      status: 'sent',
    };

    return await addDoc(collection(db, 'messages'), message);
  } catch (error) {
    console.error('Error sending message:', error);
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
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as Message[];
    callback(messages);
  });
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants.' + userId, '==', true),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const conversations = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const participantIds = Object.keys(data.participants).filter(
          (id) => id !== userId
        );

        // Get participant details
        const participantPromises = participantIds.map((id) =>
          getDoc(doc(db, 'users', id))
        );
        const participantDocs = await Promise.all(participantPromises);
        const participants = participantDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as User));

        return {
          id: doc.id,
          type: data.type || 'private',
          participants,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Conversation;
      })
    );

    callback(conversations);
  });
};

export const updateMessageStatus = async (messageId: string, status: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, { status });
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

export const pinMessage = async (messageId: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      isPinned: true,
      pinnedAt: serverTimestamp(),
      pinnedBy: auth.currentUser?.uid,
    });
  } catch (error) {
    console.error('Error pinning message:', error);
    throw error;
  }
};

export const unpinMessage = async (messageId: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
    });
  } catch (error) {
    console.error('Error unpinning message:', error);
    throw error;
  }
};

export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('searchTerms', 'array-contains', searchTerm.toLowerCase())
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
  try {
    await addDoc(collection(db, 'friendRequests'), {
      fromUserId,
      toUserId,
      status: 'pending',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const subscribeToFriendsList = (
  userId: string,
  callback: (friends: User[]) => void
) => {
  const q = query(
    collection(db, 'friends'),
    where('users', 'array-contains', userId)
  );

  return onSnapshot(q, async (snapshot) => {
    const friendPromises = snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const friendId = data.users.find((id: string) => id !== userId);
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      const friendData = friendDoc.data();
      return { id: friendId, ...friendData } as User;
    });

    const friends = await Promise.all(friendPromises);
    callback(friends);
  });
};

// Export functions used by other modules
export {
  updateDoc,
  deleteDoc,
  db,
  auth,
};
