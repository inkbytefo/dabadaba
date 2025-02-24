
import React from "react";
import { UserList } from "./UserList";
import { ChatWindow } from "./ChatWindow";
import { useAuth } from "./AuthProvider";

export const MessengerLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[800px] glass-panel rounded-2xl flex overflow-hidden animate-fade-in">
        <button
          onClick={async () => {
            await logout();
          }}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
        <UserList />
        <ChatWindow />
      </div>
    </div>
  );
};
