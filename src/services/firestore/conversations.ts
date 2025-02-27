import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Conversation } from '@/types/models';

const getTimestamp = (timestamp: Timestamp | undefined): number => {
  if (!timestamp) return 0;
  return timestamp.toMillis();
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  // Query conversations where user is a participant
  const q = query(
    collection(db, 'conversations'),
    where('participants.' + userId, '==', true)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const conversations = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const participantIds = Object.keys(data.participants).filter(
            (id) => id !== userId
          );

          const participantDocs = await Promise.all(
            participantIds.map((id) => getDoc(doc(db, 'users', id)))
          );

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
            lastMessage: data.lastMessage,
          } as Conversation;
        })
      );

      // Sort conversations by updatedAt timestamp
      conversations.sort((a, b) => {
        const aTimestamp = getTimestamp(a.updatedAt as unknown as Timestamp);
        const bTimestamp = getTimestamp(b.updatedAt as unknown as Timestamp);
        return bTimestamp - aTimestamp;
      });

      callback(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  });
};
