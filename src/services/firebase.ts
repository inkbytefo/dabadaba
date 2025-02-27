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
  setDoc,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Message, User, Conversation, UserPresence } from '@/types/models';

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
      snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const participantIds = Object.keys(data.participants).filter(
          (id) => id !== userId
        );

        // Get participant details
        const participantPromises = participantIds.map((id) =>
          getDoc(doc(db, 'users', id))
        );
        const participantDocs = await Promise.all(participantPromises);
        const participantData = participantDocs.reduce((acc, docSnapshot) => {
          if (docSnapshot.exists()) {
            acc[docSnapshot.id] = true;
          }
          return acc;
        }, {} as { [userId: string]: boolean });

        return {
          id: docSnapshot.id,
          type: data.type || 'private',
          participants: participantData,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          name: data.name,
          photoURL: data.photoURL,
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
    const presenceRef = collection(db, 'presence');
    const term = searchTerm.toLowerCase();
    
    // Query by displayName and email
    const nameQuery = query(
      usersRef,
      where('displayName', '>=', term),
      where('displayName', '<=', term + '')
    );
    
    const emailQuery = query(
      usersRef,
      where('email', '>=', term),
      where('email', '<=', term + '')
    );
    
    // Get users and their presence data
    const [nameSnapshot, emailSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(emailQuery)
    ]);
    
    // Combine results and remove duplicates
    const results = new Map<string, User>();
    
    // Get unique user IDs
    const userIds = new Set<string>();
    [...nameSnapshot.docs, ...emailSnapshot.docs].forEach(doc => {
      if (!results.has(doc.id)) {
        results.set(doc.id, {
          id: doc.id,
          ...doc.data(),
          status: 'offline' // Default status
        } as User);
        userIds.add(doc.id);
      }
    });
    
    // Get presence data for these users
    const presenceQuery = query(
      presenceRef,
      where('userId', 'in', Array.from(userIds))
    );
    const presenceSnapshot = await getDocs(presenceQuery);
    
    // Update user statuses from presence data
    presenceSnapshot.forEach(doc => {
      const presence = doc.data() as UserPresence;
      const user = results.get(presence.userId);
      if (user) {
        user.status = presence.status;
      }
    });
    
    return Array.from(results.values());
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
    const friendPromises = snapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      const friendId = data.users.find((id: string) => id !== userId);
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        return {
          id: friendId,
          ...friendDoc.data(),
        } as User;
      }
      return null;
    });

    const friends = (await Promise.all(friendPromises)).filter((friend): friend is User => friend !== null);
    callback(friends);
  });
};

// New functions for user management
export const createUserProfile = async (userId: string, userData: { email: string; username: string }) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      id: userId,
      displayName: userData.username,
      email: userData.email,
      status: 'offline',
      searchTerms: [userData.username.toLowerCase(), userData.email.toLowerCase()],
    } as User);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUsername = async (userId: string, username: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();
    
    await updateDoc(userRef, {
      displayName: username,
      searchTerms: [username.toLowerCase(), userData.email?.toLowerCase()].filter(Boolean),
    });
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('displayName', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | undefined> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const createGroup = async (groupName: string, selectedMembers: string[]) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const members = {
      [user.uid]: true, // Add creator as member
    };
    // Add selected members
    selectedMembers.forEach(memberId => {
      members[memberId] = true;
    });

    const group = {
      name: groupName,
      creatorId: user.uid,
      createdAt: serverTimestamp(),
      members,
      items: [], // Initialize items as empty array
    };

    return await addDoc(collection(db, 'groupChats'), group);
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const subscribeToGroupMembers = (
  groupId: string,
  callback: (members: User[]) => void
) => {
  return onSnapshot(doc(db, 'groupChats', groupId), async (docSnapshot) => {
    if (!docSnapshot.exists()) {
      callback([]);
      return;
    }

    const groupData = docSnapshot.data();
    const memberIds = Object.keys(groupData.members || {});
    const memberPromises = memberIds.map(async (memberId) => {
      const memberDoc = await getDoc(doc(db, 'users', memberId));
      return memberDoc.exists() ? { id: memberId, ...memberDoc.data() } : null;
    });

    const members = (await Promise.all(memberPromises))
      .filter(member => member !== null) as User[];
    callback(members);
  });
};


// Export functions used by other modules
export {
  updateDoc,
  deleteDoc,
  db,
  auth,
};
