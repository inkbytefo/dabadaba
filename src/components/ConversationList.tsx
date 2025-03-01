import React, { useEffect, useCallback } from 'react';
import { useConversations, Conversation } from '@/store/messaging';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useMessagingStore } from '@/store/messaging';
import { useTheme } from './ThemeProvider'; // Import useTheme hook
import { cn } from '@/lib/utils';

interface ConversationListProps {
  viewType?: 'chat' | 'groups';
}

export const ConversationList: React.FC<ConversationListProps> = React.memo(({ viewType = 'chat' }) => {
  const { conversations, isLoading } = useConversations();
  const setActiveConversation = useMessagingStore((state) => state.setActiveConversation);
  const { theme } = useTheme(); // Use useTheme hook

  const filteredConversations = React.useMemo(() => conversations.filter(conv =>
    viewType === 'groups' ? conv.type === 'group' : conv.type === 'private'
  ), [conversations, viewType]);

  const renderConversationItem = useCallback((conversation: Conversation) => (
    <Button
      key={conversation.id}
      variant="ghost"
      className="w-full justify-start px-4 py-6 h-auto"
      onClick={() => setActiveConversation(conversation.id)}
    >
      <div className="flex items-start gap-3">
        {conversation.photoURL ? (
          <img
            src={conversation.photoURL}
            alt={conversation.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            theme === 'dark' ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary' // Apply theme background color and text color
          )}>
            <span className="text-lg font-semibold text-primary">
              {conversation.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium truncate" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{conversation.name}</h3> {/* Apply theme text color */}
            {conversation.lastMessageTimestamp && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(conversation.lastMessageTimestamp.toMillis()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          {conversation.lastMessage && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {conversation.lastMessage}
            </p>
          )}
          {conversation.unreadCount ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-primary px-2 py-0.5 rounded-full text-xs text-primary-foreground">
                {conversation.unreadCount} yeni mesaj
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </Button>
  ), [setActiveConversation, theme]); // Add theme to useCallback dependencies

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            {viewType === 'groups' ? 'Henüz bir gruba katılmadınız' : 'Henüz bir konuşma başlatmadınız'}
          </div>
        ) : (
          filteredConversations.map(renderConversationItem)
        )}
      </div>
    </ScrollArea>
  );
});

export default ConversationList;