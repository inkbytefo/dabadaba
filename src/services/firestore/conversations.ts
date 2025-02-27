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

  return onSnapshot(q, (snapshot) => {
    try {
      console.log("[Conversations] Snapshot updated with", snapshot.docs.length, "conversations");

      // Map conversations with basic data
      const conversationsPromise = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        console.log("[Conversations] Processing conversation:", docSnapshot.id);

        // Get participant details
        const participantIds = Object.keys(data.participants || {}).filter(
          (id) => id !== userId
        );

        let participantData = { [userId]: true } as { [userId: string]: boolean };

        if (participantIds.length > 0) {
          const participantDocs = await Promise.all(
            participantIds.map((id) => getDoc(doc(db, 'users', id)))
          );

          participantData = participantDocs.reduce((acc, docSnapshot) => {
            if (docSnapshot.exists()) {
              acc[docSnapshot.id] = true;
            }
            return acc;
          }, participantData);
        }

        return {
          id: docSnapshot.id,
          type: data.type || 'private',
          participants: participantData,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          name: data.name || participantIds[0] || 'Unknown',
          photoURL: data.photoURL,
          lastMessage: data.lastMessage,
        } as Conversation;
      });

      // Process all conversations and sort them
      Promise.all(conversationsPromise)
        .then(conversations => {
          // Sort by most recent
          conversations.sort((a, b) => {
            const aTimestamp = getTimestamp(a.updatedAt as unknown as Timestamp);
            const bTimestamp = getTimestamp(b.updatedAt as unknown as Timestamp);
            return bTimestamp - aTimestamp;
          });

          console.log("[Conversations] Loaded and sorted", conversations.length, "conversations");
          callback(conversations);
        })
        .catch(error => {
          console.error("[Conversations] Error processing conversations:", error);
          callback([]);
        });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  });
};
