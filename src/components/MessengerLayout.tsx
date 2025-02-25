import { Outlet, useLocation } from "react-router-dom";
import { ChatWindow } from "./ChatWindow";
import { Sidebar } from "./Sidebar";
import { TeamList } from "./TeamList";

export const MessengerLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      {location.pathname === '/' ? (
        <>
          <TeamList />
          <div className="flex-1">
            <ChatWindow />
          </div>
        </>
      ) : (
        <div className="flex-1">
          <Outlet />
        </div>
      )}
    </div>
  );
};
