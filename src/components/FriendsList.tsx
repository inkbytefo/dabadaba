import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToFriendsList, removeFriend } from "@/services/firebase";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dot } from "lucide-react";
import type { User } from "@/types/models";

export const FriendsList = () => {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToFriendsList(currentUserId, (friendsList) => {
      setFriends(friendsList);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUserId) return;
    try {
      await removeFriend(currentUserId, friendId);
    } catch (error) {
      console.error("Error removing friend:", error);
      // TODO: Handle error (e.g., show error message)
    }
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
    <div className="p-4 flex-col space-y-4">
      <h2 className="font-bold text-lg">Friends</h2>
      {friends.length === 0 ? (
        <p className="text-gray-400">No friends yet.</p>
      ) : (
        <ScrollArea className="flex-1">
        <ul className="space-y-2">
          {friends.map((friend) => (
            <li key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <img
                      src={friend.photoURL || "/placeholder.svg"}
                      alt={friend.displayName}
                      className="object-cover"
                    />
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-background ${getStatusColor(
                      friend.status
                    )}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-lg font-medium">{friend.displayName}</div>
                  <div className="text-sm text-gray-400 flex items-center">
                    {friend.status === "online" ? (
                      <>
                        <Dot className="h-3 w-3 text-green-500" />
                        Online
                      </>
                    ) : friend.status === "away" ? (
                      <>
                        <Dot className="h-3 w-3 text-yellow-500" />
                        Away
                      </>
                    ) : (
                      <>
                        <Dot className="h-3 w-3 text-gray-500" />
                        Offline
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleRemoveFriend(friend.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
              >
                Remove Friend
              </button>
            </li>
          ))}
        </ul>
        </ScrollArea>
      )}
    </div>
  );
};