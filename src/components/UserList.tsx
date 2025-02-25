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
        return "status-online";
      case "away":
        return "status-away";
      default:
        return "status-offline";
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-messenger-secondary" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="chat-input pl-11"
          />
        </div>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-2 space-y-1">
          {displayUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="w-full group flex items-center justify-between p-3 rounded-lg hover:bg-messenger-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-border/50">
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName}
                      className="object-cover"
                    />
                  </Avatar>
                  <div className={`status-indicator ${getStatusClass(user.status)} absolute bottom-0 right-0 ring-2 ring-background`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-base font-medium text-foreground group-hover:text-messenger-primary transition-colors">
                    {user.displayName}
                  </div>
                  <div className="text-sm text-messenger-secondary">
                    {getStatusText(user.status)}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {friends.some(friend => friend.id === user.id) ? (
                  <div className="text-sm px-2 py-1 rounded bg-messenger-primary/20 text-messenger-primary">
                    Friends
                  </div>
                ) : sentRequests.includes(user.id) ? (
                  <div className="text-sm px-2 py-1 rounded bg-messenger-secondary/20 text-messenger-secondary">
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
