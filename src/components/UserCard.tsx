import { User } from "@/types/models";
import { Avatar } from "./ui/avatar";
import { FriendRequestButton } from "./FriendRequestButton";
import { cn } from "@/lib/utils";

export interface UserCardProps {
  user: User;
  isFriend?: boolean;
  isPending?: boolean;
  isSelected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const UserCard = ({ 
  user, 
  isFriend = false, 
  isPending = false,
  isSelected = false,
  compact = false,
  onClick 
}: UserCardProps) => {
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
      className={cn(
        "w-full group flex items-center justify-between rounded-xl",
        "transition-all duration-300 hover:scale-[1.01]",
        "hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)]",
        "backdrop-blur-sm",
        isSelected
          ? "bg-white/10 border-white/20"
          : "bg-white/5 hover:bg-white/8 border-white/10 hover:border-white/20",
        compact ? "p-2" : "p-4",
        "border"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className={cn(
            "ring-2 ring-white/10 transition-all duration-300",
            "group-hover:ring-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]",
            compact ? "h-8 w-8" : "h-12 w-12"
          )}>
            <img
              src={user.photoURL || "/placeholder.svg"}
              alt={user.displayName}
              className="object-cover"
            />
          </Avatar>
          <div
            className={cn(
              "absolute -top-0 right-0 rounded-full ring-2 ring-[#1e1e1e]/90",
              "transition-all duration-300 group-hover:scale-125 group-hover:ring-white/20",
              getStatusClass(user.status),
              compact ? "w-3 h-3" : "w-4 h-4"
            )}
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className={cn(
            "font-medium text-white/90 group-hover:text-white truncate",
            "transition-all duration-300",
            compact ? "text-sm" : "text-lg"
          )}>
            {user.displayName}
          </div>
          {!compact && (
            <>
              <div className="text-sm text-white/50 truncate">
                {getStatusText(user.status)}
              </div>
              {user.role && (
                <div className={cn(
                  "text-xs mt-1 font-medium",
                  user.role === 'admin' || user.role === 'owner' 
                    ? 'text-blue-400' 
                    : 'text-white/50'
                )}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {!compact && (
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
      )}
    </button>
  );
};
