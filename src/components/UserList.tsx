import { getSentFriendRequests } from "@/services/firebase";
import { FriendRequestButton } from "./FriendRequestButton";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dot } from "lucide-react";
import { useMessagingStore } from "@/store/messaging";
import type { User } from "@/types/models";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToFriendsList } from "../services/firebase";

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { setCurrentConversation } = useMessagingStore();
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [friends, setFriends] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToFriendsList(currentUserId, (friendsList) => {
      setFriends(friendsList);
    });

    // Subscribe to all users except current user
    const q = query(
      collection(db, "users"),
      where("id", "!=", currentUserId)
    );

    const unsubscribeUsers = onSnapshot(q, (snapshot) => {
      const updatedUsers = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as User[];
      setUsers(updatedUsers);
    });

    return () => {
      unsubscribe();
      unsubscribeUsers();
    };
  }, [currentUserId]);

  const handleUserClick = async (user: User) => {
    const conversationId = [currentUserId, user.id].sort().join("_");
    setCurrentConversation({
      id: conversationId,
      type: "private",
      participants: {
        [currentUserId as string]: true,
        [user.id]: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-80 border-r border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold">Contacts</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName}
                      className="object-cover"
                    />
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(
                      user.status
                    )}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-lg font-medium">{user.displayName}</div>
                  <div className="text-sm text-gray-400 flex items-center">
                    {user.status === "online" ? (
                      <>
                        <Dot className="h-4 w-4 text-green-500" />
                        Online
                      </>
                    ) : user.status === "away" ? (
                      <>
                        <Dot className="h-4 w-4 text-yellow-500" />
                        Away
                      </>
                    ) : (
                      <>
                        <Dot className="h-4 w-4 text-gray-500" />
                        Offline
                      </>
                    )}
                  </div>
                </div>
              </div>
              {friends.some(friend => friend.id === user.id) ? (
                <div className="ml-2 text-sm text-green-500">Friends</div>
              ) : sentRequests.includes(user.id) ? (
                <div className="ml-2 text-sm text-gray-500">Request Sent</div>
              ) : (
                <FriendRequestButton userId={user.id} />
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
