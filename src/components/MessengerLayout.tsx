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
    // Set a timeout to ensure we don't show the loading state forever
    // in case there's an issue with loading conversations
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // When conversations are loaded or timeout occurs, stop showing initializing state
  useEffect(() => {
    if (conversations.length > 0 || !loading) {
      setInitializing(false);
    }
  }, [conversations, loading]);

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
