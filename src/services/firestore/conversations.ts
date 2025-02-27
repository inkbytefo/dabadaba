import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Conversation, User } from '@/types/models';

const getTimestamp = (timestamp: Timestamp | null | undefined): number => {
  if (!timestamp) return 0;
  return timestamp.toMillis();
};

// Firestore document type
interface ConversationDoc {
  type: 'private' | 'group';
  participants: { [key: string]: boolean };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  name?: string;
  photoURL?: string;
  lastMessage?: string;
  lastMessageTimestamp?: Timestamp;
}

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  // Query conversations where user is a participant
  const q = query(
    collection(db, 'conversations'),
    where('participants.' + userId, '==', true)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      console.log("[Conversations] Snapshot updated with", snapshot.docs.length, "conversations");

      // Map conversations with basic data
      const conversationsPromise = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data() as ConversationDoc;
        console.log("[Conversations] Processing conversation:", docSnapshot.id);

        // Get participant details
        const participantIds = Object.keys(data.participants || {}).filter(
          (id: string) => id !== userId
        );

        let participantData: { [userId: string]: boolean } = { [userId]: true };

        if (participantIds.length > 0) {
          try {
            const participantDocs = await Promise.all(
              participantIds.map(async (id) => {
                try {
                  return await getDoc(doc(db, 'users', id));
                } catch (err) {
                  console.error(`[Conversations] Failed to fetch participant ${id}:`, err);
                  return null;
                }
              })
            );

            participantData = participantDocs.reduce((acc, docSnapshot) => {
              if (docSnapshot?.exists()) {
                acc[docSnapshot.id] = true;
              }
              return acc;
            }, participantData);
          } catch (err) {
            console.error('[Conversations] Error fetching participants:', err);
            // Continue with basic conversation data even if participant fetch fails
          }
        }

        const conversation: Conversation = {
          id: docSnapshot.id,
          type: data.type || 'private',
          participants: participantData,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          name: data.name || participantIds[0] || 'Unknown',
          photoURL: data.photoURL,
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp
        };

        return conversation;
      });

      // Process all conversations and sort them
      Promise.all(conversationsPromise)
        .then(conversations => {
          // Sort by most recent
          conversations.sort((a: Conversation, b: Conversation) => {
            const aTimestamp = getTimestamp(a.updatedAt);
            const bTimestamp = getTimestamp(b.updatedAt);
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
      console.error('[Conversations] Error in snapshot listener:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  });
};
