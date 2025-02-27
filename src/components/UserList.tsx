import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FriendRequestButton } from "./FriendRequestButton";
import { Avatar } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { useMessagingStore } from "@/store/messaging";
import type { User } from "@/types/models";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToFriendsList, searchUsers } from "../services/firebase";

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { setCurrentConversation } = useMessagingStore();
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [friends, setFriends] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToFriendsList(currentUserId, (friendsList) => {
      setFriends(friendsList);
    });

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

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);

    if (term.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const results = await searchUsers(term);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

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

  const getStatusClass = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      default:
        return "Offline";
    }
  };

  const displayUsers = searchTerm ? searchResults : users;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#1e1e1e]">
      {/* Search Input */}
      <div className="p-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500
                     focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-2 space-y-2">
          {displayUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="w-full group flex items-center justify-between p-4 rounded-xl 
                       hover:bg-white/5 bg-black/30 backdrop-blur-sm border border-white/10 
                       hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white/10 group-hover:border-white/20 transition-colors">
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName}
                      className="object-cover"
                    />
                  </Avatar>
                  <div 
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full 
                              ${getStatusClass(user.status)} ring-2 ring-[#1e1e1e]`} 
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-base font-medium text-white/90 group-hover:text-blue-400 transition-colors">
                    {user.displayName}
                  </div>
                  <div className="text-sm text-white/60">
                    {getStatusText(user.status)}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {friends.some(friend => friend.id === user.id) ? (
                  <div className="text-sm px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20">
                    Friends
                  </div>
                ) : sentRequests.includes(user.id) ? (
                  <div className="text-sm px-3 py-1.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                    Pending
                  </div>
                ) : (
                  <FriendRequestButton userId={user.id} />
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
