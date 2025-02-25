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
    <div className="p-4">
      <input
        type="text"
        placeholder="Search users..."
        className="w-full p-2 border border-white/10 rounded-md bg-transparent text-white"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {searchResults.length > 0 && (
        <ul className="mt-2 space-y-2">
          {searchResults.map((user) => (
            <li key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors border border-white/10">
              <div>{user.displayName}</div>
              <FriendRequestButton userId={user.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};