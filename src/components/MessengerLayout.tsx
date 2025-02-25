import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChatWindow } from "./ChatWindow";
import { Navigation } from "./Navigation";
import { UserList } from "./UserList";
import { FriendsList } from "./FriendsList";
import { FriendRequests } from "./FriendRequests";
import { UserSearch } from "./UserSearch";
import { SentFriendRequests } from "./SentFriendRequests";

export const MessengerLayout = () => {
  const location = useLocation();

  return (
    <>
      <Navigation />
      {location.pathname === '/' ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[800px] rounded-3xl flex overflow-hidden animate-fade-in">
            <div className="flex flex-col">
              {/* Profile Section (Placeholder) */}
              <div className="p-4 border-b border-white/10">
                <h2 className="font-bold text-lg">My Profile</h2>
              </div>
              <UserSearch />
              <FriendsList />
              <FriendRequests />
              <SentFriendRequests />
              {/* UserList (Contacts Section - Optional) */}
              {/* <UserList /> */}
            </div>
            <ChatWindow />
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          <Outlet />
        </div>
      )}
    </>
  );
};
