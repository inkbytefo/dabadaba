import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui';
import { useConversations } from '@/store/messaging';
import { ChatView } from './MessengerLayout/ChatView';
import { Conversation } from '@/store/messaging';

export const MessengerLayout: React.FC = () => {
  const { activeView, setActiveView } = useUIStore();
  const { conversations } = useConversations();
  
  const unreadCount = conversations.reduce(
    (total: number, conv: Conversation) => total + (conv.unreadCount || 0),
    0
  );

  // URL'den gelen view type'ı kontrol et
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('groups')) {
      setActiveView('groups');
    } else {
      setActiveView('chat');
    }
  }, [setActiveView]);

  return (
    <div className="h-full">
      {/* ViewType'a göre ilgili görünümü göster */}
      <ChatView viewType={activeView || 'chat'} />
    </div>
  );
};
