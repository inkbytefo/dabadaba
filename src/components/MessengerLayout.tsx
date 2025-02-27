import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChatWindow } from "./ChatWindow";
import Dashboard from "./Dashboard";
import { Sidebar } from "./Sidebar";
import { ChatHistory } from "./ChatHistory";
import { UserList } from "./UserList";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Users2, MessageSquare, Grid } from "lucide-react";

export const MessengerLayout = () => {
  const location = useLocation();
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [view, setView] = useState<'dashboard' | 'chat'>('dashboard');

  const toggleLeftPanel = () => setLeftPanelCollapsed(!leftPanelCollapsed);
  const toggleRightPanel = () => setRightPanelCollapsed(!rightPanelCollapsed);

  const switchView = (newView: 'dashboard' | 'chat') => {
    setView(newView);
  };

  const mainContent = location.pathname === "/" ? (
    <div className="flex w-full h-full relative">
      {/* Left Toggle */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={leftPanelCollapsed ? "Expand left panel" : "Collapse left panel"}
        aria-expanded={!leftPanelCollapsed}
        className={`absolute top-4 z-50 bg-black/30 hover:bg-white/5 text-white/60 
                   hover:text-white/90 shadow-lg backdrop-blur-sm border border-white/10 
                   transition-all duration-300 ${
                     leftPanelCollapsed ? "left-16" : "left-[300px]"
                   }`}
        onClick={toggleLeftPanel}
      >
        {leftPanelCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </Button>

      {/* Right Toggle */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={rightPanelCollapsed ? "Expand right panel" : "Collapse right panel"}
        aria-expanded={!rightPanelCollapsed}
        className={`absolute top-4 z-50 bg-black/30 hover:bg-white/5 text-white/60 
                   hover:text-white/90 shadow-lg backdrop-blur-sm border border-white/10 
                   transition-all duration-300 ${
                     rightPanelCollapsed ? "right-16" : "right-[300px]"
                   }`}
        onClick={toggleRightPanel}
      >
        {rightPanelCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </Button>

      {/* Left Panel */}
      <div
        className={`left-panel h-full flex bg-background transition-all duration-300 ease-in-out ${
          leftPanelCollapsed ? "w-16" : "w-[320px]"
        }`}
      >
        <Sidebar />
        {!leftPanelCollapsed && (
          <div className="w-[260px] border-r border-white/10 bg-black/30 backdrop-blur-sm rounded-r-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white/90">Message History</h2>
              </div>
            </div>
            <ChatHistory />
          </div>
        )}
      </div>

      {/* Center Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e] mx-4 rounded-lg shadow-lg">
        {/* View Toggle */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-black/30 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${
              view === 'dashboard' ? 'bg-white/10 text-white' : 'text-white/60'
            }`}
            onClick={() => switchView('dashboard')}
          >
            <Grid size={18} />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${
              view === 'chat' ? 'bg-white/10 text-white' : 'text-white/60'
            }`}
            onClick={() => switchView('chat')}
          >
            <MessageSquare size={18} />
            Chat
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          {view === 'dashboard' ? <Dashboard /> : <ChatWindow />}
        </div>
      </div>

      {/* Right Panel */}
      <div
        className={`right-panel h-full transition-all duration-300 ease-in-out ${
          rightPanelCollapsed ? "w-16" : "w-[320px]"
        }`}
      >
        <div className="flex flex-col h-full bg-black/30 backdrop-blur-sm rounded-l-lg shadow-lg">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-blue-400" />
                <h2
                  className={`font-semibold text-white/90 transition-opacity duration-300 ${
                    rightPanelCollapsed ? "opacity-0" : "opacity-100"
                  }`}
                >
                  People
                </h2>
              </div>
            </div>
          </div>
          {!rightPanelCollapsed && <UserList />}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex-1">
      <Outlet />
    </div>
  );

  return (
    <div className="h-screen bg-[#1e1e1e] flex overflow-hidden p-4">
      {mainContent}
    </div>
  );
};