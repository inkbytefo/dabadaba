import React, { forwardRef, useMemo } from "react";
import { Message } from "@/store/messaging";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useTheme } from "./ThemeProvider"; // Import useTheme hook

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

export const MessageItem = React.memo(forwardRef<HTMLDivElement, MessageItemProps>(
  ({ message, isOwn }, ref) => {
    const timestamp = useMemo(() => message.timestamp.toDate(), [message.timestamp]);
    const formattedTime = useMemo(() => new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp), [timestamp]);

    const statusIcons = useMemo(() => ({
      sending: '⌛',
      sent: '✓',
      delivered: '✓✓',
      read: '✓✓',
      failed: '❌'
    }), []);

    const { theme } = useTheme(); // Use useTheme hook

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full space-x-2 p-2",
          isOwn ? "justify-end" : "justify-start"
        )}
      >
        {!isOwn && (
          <Avatar className="h-8 w-8">
            <div className={cn(
              "h-full w-full flex items-center justify-center text-xs font-medium",
              theme === 'dark' ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary' // Apply theme background color and text color
            )}>
              {message.senderName?.[0]?.toUpperCase() || '?'}
            </div>
          </Avatar>
        )}

        <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
          {!isOwn && (
            <span className="text-xs text-muted-foreground mb-1">
              {message.senderName}
            </span>
          )}

          <Card
            className={cn(
              "px-3 py-2 max-w-[70%] break-words",
              isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
              theme === 'dark' ? 'bg-muted-foreground/10 text-white' : 'bg-muted' // Apply theme background color and text color
            )}
          >
            <div className="flex flex-col gap-1">
              {message.type === 'text' && <p style={{color: theme === 'dark' ? '#fff' : '#000'}}>{message.content}</p>} {/* Apply theme text color */}
              {message.type === 'image' && (
                <img
                  src={message.content}
                  alt="Shared image"
                  className="max-w-full rounded"
                  loading="lazy"
                />
              )}
              {message.type === 'file' && (
                <a
                  href={message.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {message.metadata?.fileName || 'Download file'}
                </a>
              )}

              <div className={cn(
                "flex items-center gap-1 text-xs",
                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                <span style={{color: theme === 'dark' ? '#fff' : '#000'}}>{formattedTime}</span> {/* Apply theme text color */}
                {isOwn && (
                  <span title={message.status}>
                    {statusIcons[message.status]}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
));

MessageItem.displayName = "MessageItem";