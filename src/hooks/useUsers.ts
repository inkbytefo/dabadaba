import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types/models';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Query for active users
    const q = query(
      collection(db, 'users'),
      where('status', '!=', 'offline')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User));
        
        setUsers(usersList);
        setIsLoading(false);
      },
      (err) => {
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    users,
    isLoading,
    error
  };
};
