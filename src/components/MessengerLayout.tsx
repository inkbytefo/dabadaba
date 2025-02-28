import { Outlet, useLocation } from "react-router-dom";
import { TopNavigation } from "./TopNavigation";
import { ChatView } from "./MessengerLayout/ChatView";
import { GroupsView } from "./MessengerLayout/GroupsView";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Loader2, MessageSquare } from "lucide-react";

export const MessengerLayout = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState<'chat' | 'groups'>('chat');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <TopNavigation onViewChange={setActiveView} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-white/50 animate-spin" />
            <p className="text-white/70">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated
  if (!user) {
    return (
      <div className="app-container">
        <TopNavigation onViewChange={setActiveView} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <MessageSquare className="h-12 w-12 text-white/50" />
            <p className="text-white/70">Please sign in to view messages</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <TopNavigation onViewChange={setActiveView} />
      <div className="flex-1 flex overflow-hidden">
        {location.pathname !== "/" ? (
          <div className="flex-1 h-full">
            <Outlet />
          </div>
        ) : (
          <div className="flex-1 h-full main-content">
            {activeView === 'chat' ? <ChatView /> : <GroupsView />}
          </div>
        )}
      </div>
    </div>
  );
};
