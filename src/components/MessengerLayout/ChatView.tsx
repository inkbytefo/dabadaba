import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { MessageItem } from "../MessageItem";
import { ConversationList } from "../ConversationList";
import { useMessaging } from "@/hooks/useMessaging";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { useActiveConversation } from "@/store/messaging";
import { Message, Conversation } from "@/store/messaging"; // Correct import path for Message
import { FixedSizeList } from 'react-window';
import { plugins, Plugin } from '@/plugins'; // Correct import path for plugins and import Plugin interface
import { loadPlugins } from '@/lib/plugin-loader'; // Import loadPlugins

interface ChatViewProps {
  viewType?: 'chat' | 'groups';
}

const ROW_HEIGHT = 72; // Adjust based on MessageItem height

const Row = ({ index, style, data }: { index: number; style: React.CSSProperties; data: Message[] }) => {
  const message: Message = data[index];
  return (
    <div style={style} key={message.id}>
      <MessageItem
        message={message}
        isOwn={message.senderId === auth.currentUser?.uid}
      />
    </div>
  );
};

export const ChatView: React.FC<ChatViewProps> = React.memo(({ viewType = 'chat' }: ChatViewProps): React.ReactElement | null => {
  const [newMessage, setNewMessage] = useState("");
  const { messages, isLoading, sendMessage } = useMessaging();
  const { conversation: activeConversation } = useActiveConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    // Load plugins dynamically
    loadPlugins().then(loadedPlugins => {
      setTopPlugins(loadedPlugins.filter(plugin => plugin.location === 'chat-view-top'));
      setBottomPlugins(loadedPlugins.filter(plugin => plugin.location === 'chat-view-bottom'));
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newMessage.trim() || !activeConversation || !currentUser) return;

      try {
        await sendMessage(activeConversation.id, newMessage.trim());
        setNewMessage("");
        scrollToBottom();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [newMessage, activeConversation, currentUser, sendMessage]
  );

  const renderMessageItem = useCallback(
    (message: Message) => (
      <MessageItem
        key={message.id}
        message={message}
        isOwn={message.senderId === currentUser?.uid}
      />
    ),
    [currentUser?.uid]
  );

  const conversationList = useMemo(() => (
    <ConversationList viewType={viewType} />
  ), [viewType]);

  // Plugin noktaları
  const topPlugins = useMemo(() => plugins.filter((plugin: Plugin) => plugin.location === 'chat-view-top'), [plugins]);
  const bottomPlugins = useMemo(() => plugins.filter((plugin: Plugin) => plugin.location === 'chat-view-bottom'), [plugins]);

  return (
    <div className="grid grid-cols-[320px_1fr] h-full">
      {/* Sol Panel - Konuşma Listesi */}
      <div className="border-r bg-background/95 backdrop-blur-lg">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-foreground/70" />
              <h2 className="text-lg font-semibold">
                {viewType === 'groups' ? 'Gruplar' : 'Mesajlar'}
              </h2>
            </div>
          </div>
          {conversationList}
        </div>
      </div>

      {/* Ana Mesajlaşma Alanı */}
      <div className="flex flex-col h-full">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : activeConversation ? (
          <>
            {/* Plugin noktası - Sohbet penceresi üstü */}
            <div className="p-4 flex gap-2">
              {topPlugins.map((plugin: Plugin) => ( // Add type for plugin parameter
                <plugin.component key={plugin.id} conversation={activeConversation} />
              ))}
            </div>

            <div className="border-b p-4">
              <h3 className="font-semibold">{activeConversation.name}</h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              <FixedSizeList
                height={600} // Adjust as needed
                width='100%'
                itemSize={ROW_HEIGHT}
                itemCount={messages.length}
                itemData={messages}
              >
                {Row}
              </FixedSizeList>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Plugin noktası - Sohbet penceresi altı */}
            <div className="p-4 flex gap-2">
              {bottomPlugins.map((plugin: Plugin) => ( // Add type for plugin parameter
                <plugin.component key={plugin.id} conversation={activeConversation} />
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Bir mesaj yazın..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Lütfen giriş yapın</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatView;