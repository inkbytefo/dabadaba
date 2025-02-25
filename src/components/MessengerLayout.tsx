import React from "react";
import { ChatWindow } from "./ChatWindow";
import { UserList } from "./UserList";
import { FriendsList } from "./FriendsList";
import { FriendRequests } from "./FriendRequests";

export const MessengerLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[800px] glass-panel rounded-2xl flex overflow-hidden animate-fade-in">
        <div className="flex flex-col">
          <FriendsList />
          <FriendRequests />
          <UserList />
        </div>
        <ChatWindow />
      </div>
    </div>
  );
};
