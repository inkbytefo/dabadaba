import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useMessagingStore, MessagingState } from '../store/messaging';
import { Button } from './ui/button';

// TypeScript interfaces for data structure
interface Conversation {
  id: string;
  user: { displayName: string; photoURL: string };
  lastMessage: string;
  timestamp: Date;
}

interface GroupChat {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
}

const Dashboard = () => {
  // Authentication state
  const [user, loading, error] = useAuthState(auth);

  // Local state for conversations, group chats, and notifications
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [notification, setNotification] = useState<{ message: string } | null>(null);

  // Zustand store for user status
  const userStatus = useMessagingStore((state: MessagingState) => state.userStatus ?? 'Online');

  // Fetch real-time data from Firebase
  useEffect(() => {
    if (!user) return;

    // Conversations listener
    const unsubscribeConvs = onSnapshot(collection(db, 'conversations'), (snapshot) => {
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Conversation[];
      setConversations(convs);
    });

    // Group chats listener
    const unsubscribeGroups = onSnapshot(collection(db, 'groupChats'), (snapshot) => {
      const groups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as GroupChat[];
      setGroupChats(groups);
    });

    return () => {
      unsubscribeConvs();
      unsubscribeGroups();
    };
  }, [user]);

  if (loading) return <div className="flex-center h-screen">Loading...</div>;
  if (error) return <div className="flex-center h-screen text-red-500">Error: {error.message}</div>;
  if (!user) return <div className="flex-center h-screen">Please log in</div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Conversations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {conversations.map((conv) => (
            <div key={conv.id} className="glass-card hover:scale-[1.02] transition-transform">
              <div className="flex items-start gap-3">
                <img
                  src={conv.user.photoURL || "/placeholder.svg"}
                  alt={conv.user.displayName}
                  className="w-12 h-12 rounded-full ring-2 ring-white/10"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white/90">{conv.user.displayName}</h3>
                  <p className="text-sm text-white/60 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="mt-1">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Group Chats Section */}
        <div>
          <h2 className="text-xl font-semibold text-white/90 mb-4">Active Group Chats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupChats.map((chat) => (
              <div key={chat.id} className="glass-card">
                <h3 className="font-medium text-white/90">{chat.name}</h3>
                <p className="text-sm text-white/60 mt-1">{chat.description}</p>
                <p className="text-xs text-white/40 mt-2">
                  {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      {notification && (
        <div className="fixed bottom-4 right-4 animate-slide-up">
          <div className="glass-card bg-blue-500/90 text-white">
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;