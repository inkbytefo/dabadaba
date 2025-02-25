import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageContent } from "./MessageContent";
import { TypingIndicator } from "./TypingIndicator";
import { MediaUpload } from "./MediaUpload";
import { ReadReceipt } from "./ReadReceipt";
import { PaperclipIcon, X, Search, Pin, PinOff, Send, Smile } from "lucide-react";
import {
  addDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Message as MessageType } from "@/types/models";
import { useMessagingStore } from "@/store/messaging";

export const ChatWindow = () => {
  const { pinMessage, unpinMessage } = useMessagingStore();
  const mockConversationId = "demo-conversation";
  const currentUserId = window.auth.currentUser?.uid || 'demo-user';

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState<MessageType[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Existing useEffects and handlers...
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const markMessagesAsRead = useCallback(async (messages: MessageType[]) => {
    const unreadMessages = messages.filter(
      msg =>
        msg.senderId !== currentUserId &&
        msg.status !== 'read' &&
        ['sent', 'delivered'].includes(msg.status)
    );

    for (const message of unreadMessages) {
      try {
        await updateDoc(doc(db, 'messages', message.id), {
          status: 'read'
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    const pinned = messages.filter(msg => msg.isPinned);
    setPinnedMessages(pinned);
  }, [messages]);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', mockConversationId),
      ...(searchQuery
        ? [where('content', '>=', searchQuery), where('content', '<=', searchQuery + '')]
        : []),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newMessages: MessageType[] = [];
      const deliveredUpdates = [];

      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const messageData = change.doc.data();
          const message = {
            id: change.doc.id,
            ...messageData,
            timestamp: messageData.timestamp?.toDate() || new Date(),
          } as MessageType;
          newMessages.push(message);

          if (message.senderId !== currentUserId && message.status === 'sent') {
            deliveredUpdates.push(
              updateDoc(doc(db, 'messages', change.doc.id), {
                status: 'delivered'
              })
            );
          }
        }
      });

      await Promise.all(deliveredUpdates);
      setMessages(prevMessages => [...prevMessages, ...newMessages]);
      markMessagesAsRead([...messages, ...newMessages]);
    });

    return () => unsubscribe();
  }, [mockConversationId, markMessagesAsRead, currentUserId, messages, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: mockConversationId,
        content: inputValue,
        type: 'text',
        senderId: currentUserId,
        timestamp: serverTimestamp(),
        status: 'sent'
      });

      setInputValue('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleMediaUpload = async (files: {
    url: string;
    type: string;
    fileName: string;
    fileSize: number;
    metadata?: {
      width?: number;
      height?: number;
      duration?: number;
    };
  }[]) => {
    try {
      for (const file of files) {
        const messageType = file.type.startsWith('image/') ? 'image' : 'video';

        await addDoc(collection(db, 'messages'), {
          conversationId: mockConversationId,
          content: file.url,
          type: messageType,
          senderId: currentUserId,
          timestamp: serverTimestamp(),
          status: 'sending',
          metadata: {
            fileType: file.type,
            fileSize: file.fileSize,
            fileName: file.fileName,
            ...file.metadata
          }
        });
      }

      setShowMediaUpload(false);
    } catch (error) {
      console.error('Error sending media message:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-background-secondary">
      {/* Header */}
      <div className="glass-panel sticky top-0 z-10 px-6 py-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="status-indicator status-online"></div>
              <span className="text-sm text-messenger-secondary">Public</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">All PR and Media Credentials</h2>
          </div>
          <div className="text-sm text-messenger-secondary">
            18 Access
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-messenger-secondary" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background/50 border border-border/50 rounded-lg py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-messenger-secondary focus:outline-none focus:ring-2 focus:ring-messenger-primary"
          />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea 
        className="flex-1 px-6 py-4 overflow-y-auto" 
        ref={scrollAreaRef}
      >
        {pinnedMessages.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-medium text-messenger-secondary flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pinned Messages
            </h3>
            <div className="space-y-2">
              {pinnedMessages.map((message) => (
                <div
                  key={`pinned-${message.id}`}
                  className={`flex w-full ${
                    message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="glass-panel max-w-[80%] p-3">
                    <MessageContent
                      content={message.content}
                      type={message.type}
                      className="text-sm"
                      metadata={message.metadata}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${
                message.senderId === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`message-bubble ${
                  message.senderId === currentUserId
                    ? 'message-bubble-out'
                    : 'message-bubble-in'
                } group`}
              >
                <MessageContent
                  content={message.content}
                  type={message.type}
                  className="text-sm"
                  metadata={message.metadata}
                />
                <div className="text-xs text-messenger-secondary mt-1 flex items-center gap-1 justify-between">
                  <div className="flex items-center gap-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.senderId === currentUserId && (
                      <ReadReceipt status={message.status} />
                    )}
                  </div>
                  <button
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-messenger-primary/10 text-messenger-secondary"
                    onClick={() => {
                      if (message.isPinned) {
                        unpinMessage(message.id);
                      } else {
                        pinMessage(message.id);
                      }
                    }}
                  >
                    {message.isPinned ? (
                      <PinOff className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 left-0 right-0">
        <div className="glass-panel mx-4 mb-4 p-3 border border-border/50 rounded-2xl">
          {isTyping && <TypingIndicator conversationId={mockConversationId} />}

          {showMediaUpload ? (
            <div className="relative">
              <button
                className="absolute top-2 right-2 z-10 rounded-full p-2 hover:bg-messenger-primary/10 text-messenger-secondary"
                onClick={() => setShowMediaUpload(false)}
              >
                <X className="h-4 w-4" />
              </button>
              <MediaUpload
                onUpload={handleMediaUpload}
                onCancel={() => setShowMediaUpload(false)}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-messenger-primary/10 text-messenger-secondary"
                onClick={() => setShowMediaUpload(true)}
              >
                <PaperclipIcon className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <Textarea
                  value={inputValue}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="chat-input min-h-[44px] max-h-[120px] resize-none pr-12"
                  rows={1}
                />
                <button
                  type="button"
                  className="absolute right-2 bottom-2 rounded-full p-1.5 hover:bg-messenger-primary/10 text-messenger-secondary"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
                className="bg-messenger-primary hover:bg-messenger-primary/90 text-white rounded-full h-11 w-11 flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
