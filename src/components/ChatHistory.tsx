import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Search } from 'lucide-react';
import { Input } from './ui/input';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  conversationId: string;
}

export const ChatHistory = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
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
      const date = format(message.timestamp, 'MMM d, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(filteredMessages);

  return (
    <div className="flex flex-col h-full bg-black/30 backdrop-blur-sm">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40
                     focus:ring-2 focus:ring-blue-500/50 w-full"
          />
        </div>
      </div>

      {/* Message History */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(messageGroups).map(([date, messages]) => (
            <div key={date} className="space-y-2">
              <div className="sticky top-0 bg-black/30 backdrop-blur-sm py-2">
                <h3 className="text-sm font-medium text-white/60">{date}</h3>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-white/90 truncate">
                        {message.senderName}
                      </p>
                      <span className="text-xs text-white/40 flex-shrink-0">
                        {format(message.timestamp, 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 line-clamp-2 mt-1">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};