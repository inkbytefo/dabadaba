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
export const createUserProfile = async (userId: string, data: Partial<User>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'online',
  });
};

export const updateUserStatus = async (userId: string, status: User['status']) => {
  const userRef = doc(db, 'users', userId);
  await firestoreUpdateDoc(userRef, {
    status,
    lastSeen: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToUserPresence = (userId: string, callback: (status: User['status']) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().status);
    }
  });
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as User;
  } else {
    console.log("No such document!");
    return null;
  }
};

// Messages
export const sendMessage = async (data: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
  const messageRef = doc(collection(db, 'messages'));
  await setDoc(messageRef, {
    ...data,
    id: messageRef.id,
    timestamp: serverTimestamp(),
    status: 'sending',
  });
  return messageRef.id;
};

export const updateMessageStatus = async (messageId: string, status: Message['status']) => {
  const messageRef = doc(db, 'messages', messageId);
  await firestoreUpdateDoc(messageRef, { status });
};

export const updateDoc = async (messageId: string, data: Partial<Message>) => {
  const messageRef = doc(db, 'messages', messageId);
  await firestoreUpdateDoc(messageRef, data);
};

export const deleteDoc = async (messageId: string) => {
  const messageRef = doc(db, 'messages', messageId);
  await firestoreDeleteDoc(messageRef);
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as Message[];
    callback(messages.reverse());
  });
};

// Conversations
export const createConversation = async (data: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) => {
  const conversationRef = doc(collection(db, 'conversations'));
  await setDoc(conversationRef, {
    ...data,
    id: conversationRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return conversationRef.id;
};

export const subscribeToConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  const q = query(
    collection(db, 'conversations'),
    where(`participants.${userId}`, '==', true),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
      lastMessage: doc.data().lastMessage ? {
        ...doc.data().lastMessage,
        timestamp: (doc.data().lastMessage.timestamp as Timestamp).toDate(),
      } : undefined,
    })) as Conversation[];
    callback(conversations);
  });
};

// Channels
export const createChannel = async (data: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => {
  const channelRef = doc(collection(db, 'channels'));
  await setDoc(channelRef, {
    ...data,
    id: channelRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return channelRef.id;
};

export const subscribeToChannel = (channelId: string, callback: (channel: Channel) => void) => {
  const channelRef = doc(db, 'channels', channelId);
  return onSnapshot(channelRef, (doc) => {
    if (doc.exists()) {
      const channel = {
        ...doc.data(),
        id: doc.id,
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
      } as Channel;
      callback(channel);
    }
  });
};

// Voice States
export const updateVoiceState = async (data: Omit<VoiceState, 'timestamp'>) => {
  const stateRef = doc(db, 'voiceStates', data.userId);
  await setDoc(stateRef, {
    ...data,
    timestamp: serverTimestamp(),
  });
};

export const subscribeToVoiceStates = (channelId: string, callback: (states: VoiceState[]) => void) => {
  const q = query(
    collection(db, 'voiceStates'),
    where('channelId', '==', channelId)
  );

  return onSnapshot(q, (snapshot) => {
    const states = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      timestamp: (doc.data().timestamp as Timestamp).toDate(),
    })) as VoiceState[];
    callback(states);
  });
};

// Typing States
export const updateTypingState = async (conversationId: string, userId: string, isTyping: boolean) => {
  const typingRef = doc(db, 'typing', conversationId);
  
  if (isTyping) {
    await setDoc(typingRef, {
      [userId]: {
        userId,
        conversationId,
        timestamp: serverTimestamp(),
      },
    }, { merge: true });
  } else {
    await firestoreUpdateDoc(typingRef, {
      [userId]: deleteField(),
    });
  }
};

let typingTimeout: NodeJS.Timeout;
export const setTypingState = (conversationId: string, userId: string) => {
  clearTimeout(typingTimeout);
  updateTypingState(conversationId, userId, true);
  typingTimeout = setTimeout(() => {
    updateTypingState(conversationId, userId, false);
  }, 5000);
};

// Media Upload
export const uploadMedia = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

export const uploadMediaBatch = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    const url = await uploadMedia(file, (progress) => {
      // Calculate overall progress
      const overallProgress = (index * 100 + progress) / files.length;
      onProgress?.(Math.round(overallProgress));
    });
    return url;
  });

  return Promise.all(uploadPromises);
};

// Friend Requests
export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  const friendRequestRef = doc(collection(db, 'friendRequests'));
  await setDoc(friendRequestRef, {
    senderId,
    receiverId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return friendRequestRef.id;
};

export const subscribeToFriendRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
) => {
  const q = query(
    collection(db, 'friendRequests'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const friendRequests = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as FriendRequest[];
    callback(friendRequests);
  });
};

export const acceptFriendRequest = async (requestId: string) => {
  const requestRef = doc(db, 'friendRequests', requestId);
  await firestoreUpdateDoc(requestRef, { status: 'accepted' });
  
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) {
    console.error("Friend request not found:", requestId);
    return;
  }
  const requestData = requestSnap.data();
  const senderId = requestData.senderId;
  const receiverId = requestData.receiverId;

  const senderRef = doc(db, 'users', senderId);
  const receiverRef = doc(db, 'users', receiverId);

  await Promise.all([
    firestoreUpdateDoc(senderRef, {
      friends: arrayUnion(receiverId)
    }),
    firestoreUpdateDoc(receiverRef, {
      friends: arrayUnion(senderId)
    })
  ]);
};

export const rejectFriendRequest = async (requestId: string) => {
  const requestRef = doc(db, 'friendRequests', requestId);
  await firestoreUpdateDoc(requestRef, { status: 'rejected' });
  await firestoreDeleteDoc(requestRef); // Optionally delete rejected requests
};

export const removeFriend = async (currentUserId: string, friendId: string) => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const friendUserRef = doc(db, 'users', friendId);

  await Promise.all([
    firestoreUpdateDoc(currentUserRef, {
      friends: arrayRemove(friendId)
    }),
    firestoreUpdateDoc(friendUserRef, {
      friends: arrayRemove(currentUserId)
    })
  ]);
};

export const getReceivedFriendRequests = async (userId: string) => {
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

export const getSentFriendRequests = async (userId: string) => {
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

export const subscribeToFriendsList = (
  userId: string,
  callback: (friends: User[]) => void
) => {
  const userRef = doc(db, 'users', userId);

  return onSnapshot(userRef, async (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      const friendIds = userData.friends || [];
      // Fetch user profiles for each friend ID
      const friendsPromises = friendIds.map(async (friendId: string) => {
        const friend = await getUserProfile(friendId);
        return friend;
      });
      const friends = await Promise.all(friendsPromises);
      // Filter out null values in case getUserProfile returns null for some IDs
      const validFriends = friends.filter(friend => friend !== null) as User[];
      callback(validFriends);
    } else {
      callback([]); // User doc doesn't exist or has no friends
    }
  });
};
