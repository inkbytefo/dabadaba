import { Outlet } from "react-router-dom";
import { TopNavigation } from "./TopNavigation";
import { useState } from "react";

export const MessengerLayout = () => {
  const [activeView, setActiveView] = useState<'chat' | 'groups'>('chat');

  return (
    <div className="app-container">
      <TopNavigation onViewChange={setActiveView} />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 h-full">
          <Outlet context={{ activeView }} />
        </div>
      </div>
    </div>
  );
};
