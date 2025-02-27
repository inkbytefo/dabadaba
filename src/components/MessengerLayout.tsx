import { Outlet, useLocation } from "react-router-dom";
import { TopNavigation } from "./TopNavigation";
import { ChatView } from "./MessengerLayout/ChatView";
import { GroupsView } from "./MessengerLayout/GroupsView";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useMessages, useMessagingStore } from "@/store/messaging";
import { Loader2 } from "lucide-react";

export const MessengerLayout = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState<'chat' | 'groups'>('chat');
  const { user } = useAuth();
  const { loading } = useMessages();
  const conversations = useMessagingStore(state => state.conversations);
  const [initializing, setInitializing] = useState(true);

  // Add effect to handle initialization state
  useEffect(() => {
    // If user is authenticated, start loading conversations
    if (user) {
      // Set a timeout to ensure we don't show the loading state forever
      // in case there's an issue with loading conversations
      const timer = setTimeout(() => {
        setInitializing(false);
      }, 3000); // Increased timeout to give more time for conversations to load
      
      return () => clearTimeout(timer);
    } else {
      // If no user, we're not initializing
      setInitializing(false);
    }
  }, [user]);

  // When conversations are loaded or loading state changes, update initializing state
  useEffect(() => {
    // Only update if we're still initializing and either:
    // 1. We have conversations, or
    // 2. Loading has completed
    if (initializing && (conversations.length > 0 || !loading)) {
      setInitializing(false);
    }
  }, [conversations, loading, initializing]);

  const mainContent = location.pathname === "/" ? (
    <>
      {initializing ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-white/50 animate-spin" />
            <p className="text-white/70">Loading your conversations...</p>
          </div>
        </div>
      ) : activeView === 'chat' ? <ChatView /> : <GroupsView />}
    </>
  ) : (
    <div className="flex-1">
      <Outlet />
    </div>
  );

  return (
    <div className="h-screen bg-[#1e1e1e] flex flex-col overflow-hidden">
      <TopNavigation onViewChange={setActiveView} />
      <div className="flex-1 flex overflow-hidden p-4">
        {mainContent}
      </div>
    </div>
  );
};
