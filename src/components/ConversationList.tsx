import React, { useEffect, useCallback } from 'react';
import { useConversations, Conversation } from '@/store/messaging';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useMessagingStore } from '@/store/messaging';

interface ConversationListProps {
  viewType?: 'chat' | 'groups';
}

export const ConversationList: React.FC<ConversationListProps> = React.memo(({ viewType = 'chat' }) => {
  const { conversations, isLoading } = useConversations();
  const setActiveConversation = useMessagingStore((state) => state.setActiveConversation);

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
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {conversation.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium truncate">{conversation.name}</h3>
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
  ), [setActiveConversation]);

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