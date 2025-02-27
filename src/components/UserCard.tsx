 import { User } from "@/types/models";
import { Avatar } from "./ui/avatar";
import { FriendRequestButton } from "./FriendRequestButton";

interface UserCardProps {
  user: User;
  isFriend: boolean;
  isPending: boolean;
  onClick: () => void;
}

export const UserCard = ({ user, isFriend, isPending, onClick }: UserCardProps) => {
  const getStatusClass = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      default:
        return "Offline";
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full group flex items-center justify-between p-4 rounded-xl
                bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 
                transition-all duration-300 hover:scale-[1.01]
                hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)]
                backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-white/10 transition-all duration-300
                         group-hover:ring-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <img
              src={user.photoURL || "/placeholder.svg"}
              alt={user.displayName}
              className="object-cover"
            />
          </Avatar>
          <div
            className={`absolute -top-0 right-0 w-4 h-4 rounded-full 
                     ${getStatusClass(user.status)} ring-2 ring-[#1e1e1e]/90
                     transition-all duration-300 group-hover:scale-125 group-hover:ring-white/20`}
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-lg font-medium text-white/90 group-hover:text-white truncate
                       transition-all duration-300">
            {user.displayName}
          </div>
          <div className="text-sm text-white/50 truncate">
            {getStatusText(user.status)}
          </div>
          {user.role && (
            <div className={`text-xs mt-1 font-medium ${
                user.role === 'admin' || user.role === 'owner' ? 'text-blue-400' : 
                'text-white/50'
              }`}>
              {user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          )}
        </div>
      </div>
      <div className="ml-4">
        {isFriend ? (
          <div className="text-sm px-4 py-2 rounded-full bg-blue-500/10 text-blue-400/90 
                       border border-blue-500/20 font-medium backdrop-blur-sm">
            Friends
          </div>
        ) : isPending ? (
          <div className="text-sm px-4 py-2 rounded-full bg-white/5 text-white/50 
                       border border-white/10 font-medium backdrop-blur-sm">
            Pending
          </div>
        ) : (
          <FriendRequestButton userId={user.id} />
        )}
      </div>
    </button>
  );
};
