import { MessageSquare } from "lucide-react";
import { ChatHistory } from "../ChatHistory";
import { ChatWindow } from "../ChatWindow";
import { UserList } from "../UserList";

export const ChatView = () => {
  return (
    <div className="flex w-full h-full">
      {/* Left Panel - Chat History */}
      <div className="w-[320px] bg-[#1e1e1e]/80 border-r border-white/10">
        <div className="flex flex-col h-full backdrop-blur-lg">
          <div className="flex items-center gap-3 p-4 border-b border-white/10 backdrop-blur-sm">
            <MessageSquare className="h-5 w-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white/90 tracking-wide">Message History</h2>
          </div>
          <ChatHistory />
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]/80 mx-6 rounded-lg border border-white/10 backdrop-blur-lg">
        <ChatWindow />
      </div>

      {/* Right Panel - Users */}
      <div className="w-[320px] border-l border-white/10">
        <UserList />
      </div>
    </div>
  );
};
