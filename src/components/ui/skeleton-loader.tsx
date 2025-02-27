import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  className?: string;
  fullWidth?: boolean;
}

export const Skeleton = ({ 
  count = 1,
  className,
  fullWidth = false,
  ...props
}: SkeletonProps) => {
  return (
    <div className="space-y-3" {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-white/5 rounded animate-pulse",
            fullWidth ? "w-full" : "w-[200px]",
            className
          )}
        />
      ))}
    </div>
  );
};

export const MessageSkeleton = () => {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <div className="sticky top-0 bg-[#1e1e1e]/90 backdrop-blur-lg py-2 z-10">
            <Skeleton className="w-24 mx-auto h-3" />
          </div>
          
          {Array.from({ length: 3 }).map((_, messageIndex) => (
            <div
              key={messageIndex}
              className={cn(
                "flex w-full px-4",
                messageIndex % 2 === 0 ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "message-bubble max-w-[70%] p-4 rounded-lg border",
                  messageIndex % 2 === 0
                    ? "bg-blue-500/20 backdrop-blur-sm border-blue-500/20"
                    : "bg-white/5 backdrop-blur-sm border-white/10"
                )}
              >
                <Skeleton 
                  count={2} 
                  className={cn(
                    "h-3",
                    messageIndex % 3 === 0 ? "w-[300px]" : "w-[200px]"
                  )} 
                />
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="w-12 h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChatListSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
        >
          <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const UserListSkeleton = () => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
        >
          <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
};