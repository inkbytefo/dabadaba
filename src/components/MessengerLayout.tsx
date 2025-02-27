import { Outlet, useLocation } from "react-router-dom";
import { TopNavigation } from "./TopNavigation";
import { ChatView } from "./MessengerLayout/ChatView";
import { GroupsView } from "./MessengerLayout/GroupsView";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useCurrentConversation, useMessagingStore } from "@/store/messaging";
import { AlertCircle, Loader2, MessageSquare, RefreshCcw } from "lucide-react";

export const MessengerLayout = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState<'chat' | 'groups'>('chat');
  const { user, loading: authLoading } = useAuth();
  const { conversation, error } = useCurrentConversation();
  const messagingState = useMessagingStore();

  // Reset any messaging errors when unmounting
  useEffect(() => {
    return () => {
      messagingState.setError(null);
    };
  }, []);

  const renderContent = () => {
    // Show loader while auth or messaging is loading
    if (authLoading || messagingState.status.isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-white/50 animate-spin" />
            <p className="text-white/70">Loading your conversations...</p>
          </div>
        </div>
      );
    }

    // Show message if no conversations are available
    if (!messagingState.conversations.length) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <MessageSquare className="h-12 w-12 text-white/50" />
            <p className="text-white/70">No conversations yet</p>
            <p className="text-sm text-white/50">Start a new conversation to begin messaging</p>
          </div>
        </div>
      );
    }

    // Show error state if there's a messaging error
    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-white/70">Error loading conversations</p>
            <p className="text-sm text-white/50 max-w-md">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Retry</span>
            </button>
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
