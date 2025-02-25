import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChatWindow } from "./ChatWindow";
import { Sidebar } from "./Sidebar";
import { TeamList } from "./TeamList";
import { UserList } from "./UserList";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Users2, ListTodo } from "lucide-react";

export const MessengerLayout = () => {
  const location = useLocation();
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const toggleLeftPanel = () => setLeftPanelCollapsed(!leftPanelCollapsed);
  const toggleRightPanel = () => setRightPanelCollapsed(!rightPanelCollapsed);

  const mainContent = location.pathname === "/" ? (
    <div className="flex w-full h-full relative">
      {/* Left Toggle */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={leftPanelCollapsed ? "Expand left panel" : "Collapse left panel"}
        aria-expanded={!leftPanelCollapsed}
        className={`absolute top-4 z-50 bg-background-secondary hover:bg-messenger-primary/10 text-messenger-secondary hover:text-messenger-primary border border-border/50 transition-all duration-300 ${
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
        className={`absolute top-4 z-50 bg-background-secondary hover:bg-messenger-primary/10 text-messenger-secondary hover:text-messenger-primary border border-border/50 transition-all duration-300 ${
          rightPanelCollapsed ? "right-16" : "right-[300px]"
        }`}
        onClick={toggleRightPanel}
      >
        {rightPanelCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </Button>

      {/* Left Panel */}
      <div
        className={`left-panel h-full flex transition-all duration-300 ease-in-out ${
          leftPanelCollapsed ? "w-16" : "w-[320px]"
        }`}
      >
        <Sidebar />
        {!leftPanelCollapsed && (
          <div className="w-[260px] border-r border-border/50">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-messenger-primary" />
                <h2 className="text-xl font-semibold text-foreground">Teams</h2>
              </div>
            </div>
            <TeamList />
          </div>
        )}
      </div>

      {/* Center Panel */}
      <div className="flex-1 flex overflow-hidden">
        <ChatWindow />
      </div>

      {/* Right Panel */}
      <div
        className={`right-panel h-full transition-all duration-300 ease-in-out ${
          rightPanelCollapsed ? "w-16" : "w-[320px]"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="glass-panel border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-messenger-primary" />
                <h2
                  className={`font-semibold text-foreground transition-opacity duration-300 ${
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
    <div className="h-screen bg-background flex overflow-hidden">
      {mainContent}
    </div>
  );
};