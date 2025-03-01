import React, { useState, useCallback, useRef, useMemo } from "react";
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
import { Message } from "@/store/messaging"; // Correct import path
import { FixedSizeList } from 'react-window';

interface ChatViewProps {
  viewType?: 'chat' | 'groups';
}

const ROW_HEIGHT = 72; // Adjust based on MessageItem height

const Row = ({ index, style, data }: { index: number, style: React.CSSProperties, data: Message[] }) => {
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

export const ChatView: React.FC<ChatViewProps> = React.memo(({ viewType = 'chat' }) => {
  const [newMessage, setNewMessage] = useState("");
  const { messages, isLoading, sendMessage } = useMessaging();
  const { conversation: activeConversation } = useActiveConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !currentUser) return;

    try {
      await sendMessage(activeConversation.id, newMessage.trim());
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [newMessage, activeConversation, currentUser, sendMessage, scrollToBottom]);

  const renderMessageItem = useCallback((message: Message) => (
    <MessageItem
      key={message.id}
      message={message}
      isOwn={message.senderId === currentUser?.uid}
    />
  ), [currentUser?.uid]);

  const conversationList = useMemo(() => (
    <ConversationList viewType={viewType} />
  ), [viewType]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Lütfen giriş yapın</p>
        </div>
      </div>
    );
  }

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
              <p className="text-muted-foreground">Bir konuşma seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});