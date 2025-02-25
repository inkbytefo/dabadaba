import React, { useState } from "react";
import { FriendRequestButton } from "./FriendRequestButton";
import { searchUsers } from "@/services/firebase";

export const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    // TODO: Implement searchUsers function in firebase services
    const results = await searchUsers(term);
    setSearchResults(results);
  };

  return (
    <div className="p-4 pb-0">
      <input
        type="text"
        placeholder="Search Contacts"
        className="w-full p-3 border border-white/10 rounded-full bg-transparent text-white placeholder-gray-400 focus:ring-0 focus-visible:ring-0 focus:border-messenger-primary"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
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