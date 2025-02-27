import React, { useState, useCallback } from "react";
import { FriendRequestButton } from "./FriendRequestButton";
import { searchUsers } from "@/services/firestore/users";
import { useDebounce } from "@/hooks/use-debounce";

export const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(async (term: string) => {
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchUsers(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  return (
    <div className="p-4 pb-0">
      <div className="relative">
        <input
          type="text"
          placeholder="Search Contacts"
          className="w-full p-3 border border-white/10 rounded-full bg-transparent text-white placeholder-gray-400 focus:ring-0 focus-visible:ring-0 focus:border-messenger-primary"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-messenger-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      {searchResults.length > 0 && (
        <ul className="mt-3 space-y-2">
          {searchResults.map((user) => (
            <li key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
              <div>{user.displayName}</div>
              <FriendRequestButton userId={user.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
