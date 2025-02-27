import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types/models';

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

    const friends = (await Promise.all(friendPromises))
      .filter((friend): friend is User => friend !== null);
    callback(friends);
  });
};
