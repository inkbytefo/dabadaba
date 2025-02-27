import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { db } from '@/lib/firebase';
import type { User, UserRole, UserStatus } from '@/types/models';

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    return {
      id: userDoc.id,
      ...userDoc.data()
    } as User;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (user: FirebaseAuthUser) => {
  try {
    if (!user) throw new Error('No user provided');

    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = serverTimestamp();

      // Create user profile
      await setDoc(userRef, {
        id: user.uid,
        email,
        displayName: displayName || email?.split('@')[0],
        photoURL,
        createdAt,
        updatedAt: createdAt,
        status: 'offline',
        role: 'member',
        searchTerms: [
          (displayName || '').toLowerCase(),
          (email || '').toLowerCase(),
          (email?.split('@')[0] || '').toLowerCase()
        ].filter(Boolean)
      });

      // Create initial presence
      const presenceRef = doc(db, 'presence', user.uid);
      await setDoc(presenceRef, {
        userId: user.uid,
        status: 'online',
        lastSeen: serverTimestamp()
      });

      // Create welcome conversation
      const welcomeConversationRef = doc(collection(db, 'conversations'));
      await setDoc(welcomeConversationRef, {
        type: 'system',
        participants: {
          [user.uid]: true
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        name: 'Welcome',
        lastMessage: 'Welcome to the chat! Start a conversation or search for users.'
      });

      // Add welcome message
      const welcomeMessageRef = doc(collection(db, 'messages'));
      await setDoc(welcomeMessageRef, {
        conversationId: welcomeConversationRef.id,
        content: 'Welcome to the chat! Start a conversation or search for users.',
        senderId: 'system',
        senderName: 'System',
        type: 'text',
        timestamp: serverTimestamp(),
        status: 'sent'
      });
    }

    return userRef;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
      searchTerms: [
        (data.displayName || '').toLowerCase(),
        (data.email || '').toLowerCase(),
        (data.username || '').toLowerCase()
      ].filter(Boolean)
    };

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUsername = async (userId: string, username: string) => {
  try {
    const usernameAvailable = await isUsernameAvailable(username);
    if (!usernameAvailable) {
      throw new Error('Username is already taken');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      username,
      searchTerms: [username.toLowerCase()],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '==', username.toLowerCase())
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, status: UserStatus) => {
  try {
    const presenceRef = doc(db, 'presence', userId);
    await setDoc(presenceRef, {
      userId,
      status,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const term = searchTerm.toLowerCase();
    
    const nameQuery = query(
      usersRef,
      where('displayName', '>=', term),
      where('displayName', '<=', term + '\uf8ff')
    );
    
    const emailQuery = query(
      usersRef,
      where('email', '>=', term),
      where('email', '<=', term + '\uf8ff')
    );
    
    const [nameSnapshot, emailSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(emailQuery)
    ]);
    
    const uniqueUsers = new Map<string, User>();
    
    [...nameSnapshot.docs, ...emailSnapshot.docs].forEach(doc => {
      if (!uniqueUsers.has(doc.id)) {
        uniqueUsers.set(doc.id, {
          id: doc.id,
          ...doc.data(),
        } as User);
      }
    });
    
    return Array.from(uniqueUsers.values());
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};
