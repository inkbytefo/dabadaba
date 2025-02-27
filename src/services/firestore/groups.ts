import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, UserRole } from '@/types/models';

export const subscribeToGroupMembers = (
  groupId: string,
  callback: (members: User[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    return onSnapshot(doc(db, 'groupChats', groupId), async (docSnapshot) => {
      if (!docSnapshot.exists()) {
        callback([]);
        return;
      }

      const groupData = docSnapshot.data();
      const memberPromises = Object.entries(groupData.members || {}).map(async ([memberId, memberData]) => {
        const memberDoc = await getDoc(doc(db, 'users', memberId));
        if (memberDoc.exists()) {
          return {
            id: memberId,
            ...memberDoc.data(),
            role: (memberData as { role?: UserRole })?.role || 'member'
          } as User;
        }
        return null;
      });

      const members = (await Promise.all(memberPromises))
        .filter((member): member is User => member !== null);
      callback(members);
    }, onError);
  } catch (error) {
    console.error('Error subscribing to group members:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};

export const updateMemberRole = async (groupId: string, memberId: string, newRole: UserRole | null) => {
  try {
    const groupRef = doc(db, 'groupChats', groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    await updateDoc(groupRef, {
      [`members.${memberId}.role`]: newRole
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

export const removeMember = async (groupId: string, memberId: string) => {
  try {
    const groupRef = doc(db, 'groupChats', groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const members = { ...groupData.members };
    delete members[memberId];

    await updateDoc(groupRef, { members });
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};
