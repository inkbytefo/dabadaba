import React, { useEffect, useRef, KeyboardEvent, useState, useMemo, useCallback } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { MessageSquare, Search, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { useMessages, useCurrentConversation } from "@/store/messaging";
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/models';
import { useAuth } from './AuthProvider';

export const ChatHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages } = useMessages();
  const { user } = useAuth();
  const { conversation: currentConversation, setConversation } = useCurrentConversation();

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    return messages.filter(message => (
      message.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (message.senderName && message.senderName.toLowerCase().includes(debouncedSearch.toLowerCase()))
    ));
  }, [messages, debouncedSearch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredMessages.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredMessages[selectedIndex]) {
      handleMessageClick(filteredMessages[selectedIndex]);
    }
  }, [filteredMessages, selectedIndex]);

  const handleMessageClick = useCallback((message: Message) => {
    if (!message.conversationId || !message.senderId) return;

    setConversation({
      id: message.conversationId,
      type: "private",
      participants: {
        [message.senderId]: true,
        [user?.uid || ""]: true
      },
      createdAt: message.timestamp,
      updatedAt: message.timestamp,
    });
  }, [setConversation, user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4" />
          <p>Please sign in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full bg-[#1e1e1e]/80 backdrop-blur-lg border-l border-white/10"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Message History"
    >
      {/* Search Bar */}
      <div className="p-4 border-b border-white/10 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white/90 placeholder:text-white/40
                     focus:ring-2 focus:ring-white/20 w-full transition-all duration-200
                     hover:bg-white/8"
            aria-label="Search messages"
          />
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 space-y-6 relative min-h-[200px]">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-white/40">
              <MessageSquare className="h-12 w-12 mb-4" />
              <p className="text-sm">No messages found</p>
              {searchQuery && (
                <p className="text-xs mt-2 text-white/30">Try adjusting your search</p>
              )}
            </div>
          ) : (
            Object.entries(groupMessagesByDate(filteredMessages)).map(([date, messages]) => (
              <div key={date} className="space-y-1">
                <div className="sticky top-0 bg-[#1e1e1e]/90 backdrop-blur-lg py-2 z-10 px-2">
                  <h3 className="text-sm font-medium text-white/50 tracking-wide">{date}</h3>
                </div>

                {messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={cn(
                      "w-full group flex items-start gap-3 p-3 rounded-lg",
                      "bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20",
                      "transition-all duration-300 hover:scale-[1.01]",
                      "backdrop-blur-sm focus:outline-none",
                      selectedIndex === filteredMessages.indexOf(message) && "bg-white/10 border-white/20",
                      message.conversationId === currentConversation?.id && "ring-2 ring-white/20",
                      message.status !== 'read' && "border-l-2 border-l-blue-500"
                    )}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center 
                                  ring-2 ring-white/10 group-hover:ring-white/20 transition-all duration-300
                                  group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <MessageSquare className="h-5 w-5 text-white/70" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-base font-medium text-white/90 truncate">
                          {message.senderName || 'Unknown User'}
                        </p>
                        <span className="text-xs text-white/40 flex-shrink-0">
                          {message.timestamp ? format(message.timestamp.toDate(), 'HH:mm') : 'No time'}
                        </span>
                      </div>
                      <p className="text-sm text-white/50 line-clamp-2 mt-1">
                        {getMessagePreview(message)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      if (!message.timestamp) return;
      
      const messageDate = message.timestamp.toDate();
      let date = format(messageDate, 'MMM d, yyyy');
      
      if (isToday(messageDate)) {
        date = 'Today';
      } else if (isYesterday(messageDate)) {
        date = 'Yesterday';
      }
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const getMessagePreview = (message: Message) => {
    if (!message.content) return "No content";
    
    switch (message.type) {
      case 'image':
        return '🖼️ Shared an image';
      case 'video':
        return '🎥 Shared a video';
      case 'file':
        return '📎 Shared a file';
      case 'audio':
        return '🎵 Shared audio';
      case 'markdown':
        return message.content;
      default:
        return message.content;
    }
  };
