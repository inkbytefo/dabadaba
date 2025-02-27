import { useState } from "react";
import { MessageSquare, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { ChatHistory } from "../ChatHistory";
import { ChatWindow } from "../ChatWindow";
import { UserList } from "../UserList";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMessages } from "@/store/messaging";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ChatView = () => {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const { loading } = useMessages();

  // On mobile/tablet, only show one panel at a time
  const handleLeftPanelToggle = () => {
    setLeftPanelOpen(!leftPanelOpen);
    if (isMobile && !leftPanelOpen) {
      setRightPanelOpen(false);
    }
  };

  const handleRightPanelToggle = () => {
    setRightPanelOpen(!rightPanelOpen);
    if (isMobile && !rightPanelOpen) {
      setLeftPanelOpen(false);
    }
  };

  return (
    <div className="flex w-full h-full relative">
      {/* Left Panel - Chat History */}
      <div
        className={cn(
          "absolute md:relative z-20 w-[320px] bg-[#1e1e1e]/80 border-r border-white/10",
          "transition-all duration-300 ease-in-out",
          isMobile ? (leftPanelOpen ? "left-0" : "-left-[320px]") : "",
          !leftPanelOpen && !isMobile ? "-ml-[320px]" : ""
        )}
      >
        <div className="flex flex-col h-full backdrop-blur-lg">
          <div className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-white/70" />
              <h2 className="text-lg font-semibold text-white/90 tracking-wide">Messages</h2>
            </div>
          </div>
          <ChatHistory />
        </div>
      </div>

      {/* Toggle Left Panel Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={handleLeftPanelToggle}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-30",
          "bg-[#1e1e1e]/80 border border-white/10 backdrop-blur-lg",
          "hover:bg-white/5 transition-colors",
          leftPanelOpen ? "translate-x-[320px]" : "translate-x-0",
          isMobile ? "md:hidden" : ""
        )}
        aria-label={leftPanelOpen ? "Hide message history" : "Show message history"}
      >
        {leftPanelOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Center Panel */}
      <div 
        className={cn(
          "flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]/80 mx-6 rounded-lg border border-white/10 backdrop-blur-lg",
          "transition-all duration-300",
          loading ? "animate-pulse" : ""
        )}
      >
        <ChatWindow />
      </div>

      {/* Right Panel - Users */}
      <div
        className={cn(
          "absolute md:relative right-0 z-20 w-[320px] bg-[#1e1e1e]/80 border-l border-white/10",
          "transition-all duration-300 ease-in-out",
          isMobile ? (rightPanelOpen ? "right-0" : "-right-[320px]") : "",
          !rightPanelOpen && !isMobile ? "-mr-[320px]" : "",
          isTablet && !isMobile ? "w-[280px]" : ""
        )}
      >
        <div className="flex flex-col h-full backdrop-blur-lg">
          <div className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-white/70" />
              <h2 className="text-lg font-semibold text-white/90 tracking-wide">Users</h2>
            </div>
          </div>
          <UserList />
        </div>
      </div>

      {/* Toggle Right Panel Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={handleRightPanelToggle}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-30",
          "bg-[#1e1e1e]/80 border border-white/10 backdrop-blur-lg",
          "hover:bg-white/5 transition-colors",
          rightPanelOpen ? "-translate-x-[320px]" : "translate-x-0",
          isMobile ? "md:hidden" : "",
          isTablet && !isMobile ? "-translate-x-[280px]" : ""
        )}
        aria-label={rightPanelOpen ? "Hide user list" : "Show user list"}
      >
        {rightPanelOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Backdrop for mobile */}
      {isMobile && (leftPanelOpen || rightPanelOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => {
            setLeftPanelOpen(false);
            setRightPanelOpen(false);
          }}
        />
      )}
    </div>
  );
};
