import { useState, useCallback } from "react";
import { MessageSquare, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { ChatHistory } from "../ChatHistory";
import { ChatWindow } from "../ChatWindow";
import { UserList } from "../UserList";
import { useMessages } from "@/store/messaging";
import { useUsers } from "@/hooks/useUsers";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PanelState {
  left: boolean;
  right: boolean;
}

interface ChatViewProps {
  viewType?: 'chat' | 'groups';
}

export const ChatView = ({ viewType = 'chat' }: ChatViewProps) => {
  const isGroupsView = viewType === 'groups';
  const [panels, setPanels] = useState<PanelState>({ left: true, right: true });
  const { messages, isLoading: messagesLoading, error: messagesError } = useMessages();
  const { users, isLoading: usersLoading, error: usersError } = useUsers();

  const leftPanelOpen = panels.left;
  const rightPanelOpen = panels.right;

  const togglePanel = useCallback((panel: keyof PanelState) => {
    setPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  }, []);

  if (messagesError) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-400">Error loading messages</p>
          <p className="text-sm mt-2 text-white/30">{messagesError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full relative">
      {/* Left Panel - Chat History */}
      <div
        className={cn(
          "fixed left-0 w-[320px] h-full",
          "bg-[#1e1e1e]/95 backdrop-blur-lg border-r border-white/10",
          "transition-transform duration-300 ease-out will-change-transform z-20",
          !panels.left && "-translate-x-full",
          messagesLoading && "animate-pulse"
        )}
      >
        <div className="flex flex-col h-full backdrop-blur-lg">
          <div className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {isGroupsView ? <Users className="h-5 w-5 text-white/70" /> :
                <MessageSquare className="h-5 w-5 text-white/70" />}
              <h2 className="text-lg font-semibold text-white/90 tracking-wide">
                {isGroupsView ? 'Groups' : 'Messages'}
              </h2>
            </div>
          </div>
          <ChatHistory />
        </div>
      </div>

      {/* Toggle Left Panel Button */}
      <Button
        onClick={() => togglePanel('left')}
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-30",
          buttonVariants({ variant: "ghost", size: "icon" }),
          "bg-[#1e1e1e]/95 backdrop-blur-lg border border-white/10",
          "hover:bg-white/10 transition-colors duration-200",
          panels.left && "translate-x-[320px]",
          messagesLoading && "opacity-50 cursor-not-allowed"
        )}
        disabled={messagesLoading}
        aria-label={panels.left ? "Hide message history" : "Show message history"}
      >
        {leftPanelOpen ? (
          <ChevronLeft className="h-4 w-4 text-white/70" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/70" />
        )}
      </Button>

      {/* Center Panel - Chat Window */}
      <div 
        className={cn(
          "flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]/90 backdrop-blur-lg border border-white/10",
          "transition-all duration-300 ease-out will-change-transform",
          panels.left && "ml-[320px]",
          panels.right && "mr-[320px]",
          messagesLoading && "animate-pulse"
        )}
      >
        <ChatWindow />
      </div>

      {/* Right Panel - Users */}
      <div
        className={cn(
          "fixed right-0 w-[320px] h-full",
          "bg-[#1e1e1e]/95 backdrop-blur-lg border-l border-white/10",
          "transition-transform duration-300 ease-out will-change-transform z-20",
          !panels.right && "translate-x-full",
          usersLoading && "animate-pulse"
        )}
      >
        <div className="flex flex-col h-full backdrop-blur-lg">
          <div className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-white/70" />
              <h2 className="text-lg font-semibold text-white/90 tracking-wide">Users</h2>
            </div>
          </div>
          <UserList 
            users={users} 
            isLoading={usersLoading}
            error={usersError}
          />
        </div>
      </div>

      {/* Toggle Right Panel Button */}
      <Button
        onClick={() => togglePanel('right')}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-30",
          buttonVariants({ variant: "ghost", size: "icon" }),
          "bg-[#1e1e1e]/95 backdrop-blur-lg border border-white/10",
          "hover:bg-white/10 transition-colors duration-200",
          panels.right && "-translate-x-[320px]",
          messagesLoading && "opacity-50 cursor-not-allowed"
        )}
        disabled={messagesLoading}
        aria-label={panels.right ? "Hide user list" : "Show user list"}
      >
        {rightPanelOpen ? (
          <ChevronRight className="h-4 w-4 text-white/70" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-white/70" />
        )}
      </Button>
    </div>
  );
};
