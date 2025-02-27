import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Search } from 'lucide-react';
import { Input } from './ui/input';
import { useMessagingStore } from "@/store/messaging";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
  conversationId: string;
  type: 'text' | 'image' | 'video' | 'file';
}

export const ChatHistory = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { setCurrentConversation } = useMessagingStore();

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = format(message.timestamp.toDate(), 'MMM d, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(filteredMessages);

  const getMessagePreview = (message: ChatMessage) => {
    switch (message.type) {
      case 'image':
        return '🖼️ Shared an image';
      case 'video':
        return '🎥 Shared a video';
      case 'file':
        return '📎 Shared a file';
      default:
        return message.content;
    }
  };

  const handleMessageClick = (message: ChatMessage) => {
    setCurrentConversation({
      id: message.conversationId,
      type: "private",
      participants: {
        [message.senderId]: true
      },
      createdAt: message.timestamp,
      updatedAt: message.timestamp,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]/80 backdrop-blur-lg border-l border-white/10">
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
          />
        </div>
      </div>

      {/* Message History */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-4 space-y-6">
          {Object.entries(messageGroups).map(([date, messages]) => (
            <div key={date} className="space-y-1">
              <div className="sticky top-0 bg-[#1e1e1e]/90 backdrop-blur-lg py-2 z-10 px-2">
                <h3 className="text-sm font-medium text-white/50 tracking-wide">{date}</h3>
              </div>

              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="w-full group flex items-start gap-3 p-3 rounded-lg 
                           bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 
                           transition-all duration-300 hover:scale-[1.01]
                           backdrop-blur-sm"
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
                        {message.senderName}
                      </p>
                      <span className="text-xs text-white/40 flex-shrink-0">
                        {format(message.timestamp.toDate(), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 line-clamp-2 mt-1">
                      {getMessagePreview(message)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
