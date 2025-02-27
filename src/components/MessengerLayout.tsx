import { Outlet, useLocation } from "react-router-dom";
import { TopNavigation } from "./TopNavigation";
import { ChatView } from "./MessengerLayout/ChatView";
import { GroupsView } from "./MessengerLayout/GroupsView";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useCurrentConversation } from "@/store/messaging";
import { Loader2 } from "lucide-react";

export const MessengerLayout = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState<'chat' | 'groups'>('chat');
  const { user, loading: authLoading } = useAuth();
  const { conversation } = useCurrentConversation();

  const renderContent = () => {
    // Show loader while auth is loading
    if (authLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-white/50 animate-spin" />
            <p className="text-white/70">Loading your conversations...</p>
          </div>
        </div>
      );
    }

    // If not on root path, render Outlet (used for settings pages)
    if (location.pathname !== "/") {
      return (
        <div className="flex-1">
          <Outlet />
        </div>
      );
    }

    // Render active view
    return (
      <div className="flex-1">
        {activeView === 'chat' ? <ChatView /> : <GroupsView />}
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#1e1e1e] flex flex-col overflow-hidden">
      <TopNavigation onViewChange={setActiveView} />
      <div className="flex-1 flex overflow-hidden p-4">
        {renderContent()}
      </div>
    </div>
  );
};
