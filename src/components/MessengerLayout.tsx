import { Outlet, useLocation } from "react-router-dom";
import { TopNavigation } from "./TopNavigation";
import { ChatView } from "./MessengerLayout/ChatView";
import { GroupsView } from "./MessengerLayout/GroupsView";
import { useState } from "react";

export const MessengerLayout = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState<'chat' | 'groups'>('chat');

  const mainContent = location.pathname === "/" ? (
    <>
      {activeView === 'chat' ? <ChatView /> : <GroupsView />}
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
