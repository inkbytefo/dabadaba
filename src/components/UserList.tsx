
import { Gamepad } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const UserList = () => {
  const users = [
    { id: 1, name: "Player One", status: "online", message: "Ready to game!" },
    { id: 2, name: "Pixel Master", status: "away", message: "In a match" },
    { id: 3, name: "Game Master", status: "offline", message: "Offline" },
  ];

  return (
    <div className="w-80 border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Gamepad className="w-6 h-6 text-messenger-primary" />
          <h1 className="text-xl font-semibold">Contacts</h1>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-64px)]">
        <div className="p-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-messenger-primary/50">
                  <div className="w-full h-full bg-messenger-primary/20 flex items-center justify-center">
                    {user.name[0]}
                  </div>
                </Avatar>
                <div className={`status-dot status-dot-${user.status} absolute bottom-0 right-0 animate-status-pulse`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate group-hover:text-messenger-primary transition-colors">
                    {user.name}
                  </p>
                </div>
                <p className="text-sm text-gray-400 truncate">{user.message}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
