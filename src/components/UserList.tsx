import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { UserCard } from "./UserCard";
import { useMessagingStore } from "@/store/messaging";
import type { User } from "@/types/models";
import { collection, query, where, onSnapshot, Timestamp, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToFriendsList } from "@/services/firestore/friends";
import { searchUsers } from "@/services/firestore/users";

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

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUserId) return;
      
      try {
        const q = query(
          collection(db, "users"),
          where("id", "!=", currentUserId),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const updatedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(updatedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  };

  const displayUsers = searchTerm ? searchResults : users;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#1e1e1e]/80 backdrop-blur-lg">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white/90 tracking-wide">
            Contacts
            <span className="ml-2 text-sm text-white/50">
              ({displayUsers.length})
            </span>
          </h2>
          <div className="text-sm text-white/50">
            {users.filter(u => u.status === "online").length} online
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-6 py-4 border-b border-white/10 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white/90 placeholder:text-white/40
                     focus:ring-2 focus:ring-white/20 transition-all duration-200
                     hover:bg-white/8"
          />
        </div>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-8">
          {/* Friends Section */}
          {friends.length > 0 && (
            <div className="space-y-2">
              <div className="px-2 py-1 text-sm font-medium text-white/60 uppercase tracking-wider">
                Friends
              </div>
              <div className="space-y-2">
                {displayUsers
                  .filter(user => friends.some(friend => friend.id === user.id))
                  .map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      isFriend={true}
                      isPending={false}
                      onClick={() => handleUserClick(user)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Other Users Section */}
          <div className="space-y-2">
            <div className="px-2 py-1 text-sm font-medium text-white/60 uppercase tracking-wider">
              Discover
            </div>
            <div className="space-y-3">
              {displayUsers
                .filter(user => !friends.some(friend => friend.id === user.id))
                .map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFriend={false}
                    isPending={sentRequests.includes(user.id)}
                    onClick={() => handleUserClick(user)}
                  />
                ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
