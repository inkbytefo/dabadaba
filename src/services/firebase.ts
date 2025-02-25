import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc as firestoreUpdateDoc,
  deleteField,
  deleteDoc as firestoreDeleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentReference,
  arrayUnion,
  arrayRemove,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { 
  User,
  Message,
  Conversation,
  Channel,
  VoiceState,
  FriendRequest,
} from '@/types/models';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Users
export const createUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    console.log('Creating user profile:', { userId, data });
    const userRef = doc(db, 'users', userId);

    const profile = {
      username: (data.username || data.email?.split('@')[0] || 'defaultusername').toLowerCase(), // Ensure username is always set and generate default if needed
      displayName: data.displayName || data.username || data.email?.split('@')[0] || 'defaultusername', // Use displayName if available, otherwise username
      email: data.email || '',
      photoURL: data.photoURL || '',
      status: 'online',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      friends: [],
    };

    await setDoc(userRef, profile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, status: User['status']) => {
  const userRef = doc(db, 'users', userId);
  await firestoreUpdateDoc(userRef, {
    status,
    lastSeen: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as User;
  }
  console.log("No such document!");
  return null;
};

export const subscribeToUserPresence = (userId: string, callback: (status: User['status']) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().status);
    }  });
};
export const subscribeToFriendRequests =  (
  userId: string,
  callback: (requests: FriendRequest[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'friendRequests'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as FriendRequest[];
    callback(requests);
  });
}
// Friend Request Actions
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, 'friendRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error("Friend request not found");
  }

  const requestData = requestSnap.data();
  await Promise.all([
    firestoreUpdateDoc(doc(db, 'users', requestData.senderId), {
      friends: arrayUnion(requestData.receiverId)
    }),
    firestoreUpdateDoc(doc(db, 'users', requestData.receiverId), {
      friends: arrayUnion(requestData.senderId)
    }),
    firestoreUpdateDoc(requestRef, { status: 'accepted' })
  ]);
};

export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  await firestoreDeleteDoc(doc(db, 'friendRequests', requestId));
};

export const cancelFriendRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, 'friendRequests', requestId);
  await firestoreDeleteDoc(requestRef);
};

export const removeFriend = async (currentUserId: string, friendId: string): Promise<void> => {
  await Promise.all([
    firestoreUpdateDoc(doc(db, 'users', currentUserId), {
      friends: arrayRemove(friendId)
    }),
    firestoreUpdateDoc(doc(db, 'users', friendId), {
      friends: arrayRemove(currentUserId)
    })
  ]);
};

export const subscribeToFriendsList = (
  userId: string,
  callback: (friends: User[]) => void
): (() => void) => {
  const userRef = doc(db, 'users', userId);

  return onSnapshot(userRef, async (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      const friendIds = userData.friends || [];
      const friendProfiles = await Promise.all(
        friendIds.map(async (friendId: string) => {
          const friend = await getUserProfile(friendId);
          return friend;
        })
      );
      callback(friendProfiles
        .filter((friend): friend is User => friend !== null)
        .filter(friend => friend.id !== userId) // Filter out current user
      );
    } else {
      callback([]);
    }
  });
};

// Username management
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase()),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const updateUsername = async (userId: string, username: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await firestoreUpdateDoc(userRef, {
    username: username.toLowerCase(),
    displayName: username,
    updatedAt: serverTimestamp(),
  });
};

// Search
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  const q = query(
    collection(db, 'users'),
    where('username', '>=', searchTerm),
    where('username', '<=', searchTerm + '\uf8ff'),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as User[];
};

// Friend Requests
export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  const friendRequestRef = doc(collection(db, 'friendRequests'));
  await setDoc(friendRequestRef, {
    senderId,
    receiverId,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return friendRequestRef.id;
};

export const getSentFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  const q = query(
    collection(db, 'friendRequests'),
    where('senderId', '==', userId),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as FriendRequest[];
};

export const getReceivedFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  const q = query(
    collection(db, 'friendRequests'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as FriendRequest[];
};

// Messaging functions
export const sendMessage = async (messageData: Partial<Message>): Promise<void> => {
  const messageRef = doc(collection(db, 'messages'));
  await setDoc(messageRef, {
    ...messageData,
    id: messageRef.id,
    timestamp: serverTimestamp(),
    status: 'sent',
  });
};

export const updateDoc = async (docId: string, data: Partial<Message>): Promise<void> => {
  const messageRef = doc(db, 'messages', docId);
  await firestoreUpdateDoc(messageRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDoc = async (docId: string): Promise<void> => {
  const messageRef = doc(db, 'messages', docId);
  await firestoreDeleteDoc(messageRef);
};

export const updateMessageStatus = async (messageId: string, status: Message['status']): Promise<void> => {
  const messageRef = doc(db, 'messages', messageId);
  await firestoreUpdateDoc(messageRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToMessages = (
  parentId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', parentId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Message[];
    callback(messages);
  });
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Conversation[];
    callback(conversations);
  });
};
