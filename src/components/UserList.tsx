import { User } from "@/types/models";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollArea } from "./ui/scroll-area";
import { UserCard } from "./UserCard";
import { ErrorBoundary } from "./ErrorBoundary";
import { UserListSkeleton } from "./ui/skeleton-loader";

interface UserListProps {
  users: User[];
  isLoading?: boolean;
  error?: Error | null;
  onUserSelect?: (user: User) => void;
  selectedUserId?: string;
}

export const UserList = ({ 
  users, 
  isLoading, 
  error, 
  onUserSelect,
  selectedUserId 
}: UserListProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (error) {
    throw error; // This will be caught by the ErrorBoundary
  }

  return (
    <ErrorBoundary>
      <div className="h-full bg-[#1e1e1e]/80 backdrop-blur-lg rounded-lg border border-white/10">
        <ScrollArea className="h-full">
          {isLoading ? (
            <UserListSkeleton />
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4 text-white/40">
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {users.map((user) => (
                <UserCard 
                  key={user.id}
                  user={user}
                  onClick={() => onUserSelect?.(user)}
                  isSelected={user.id === selectedUserId}
                  compact={isMobile}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </ErrorBoundary>
  );
};
