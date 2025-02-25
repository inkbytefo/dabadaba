import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageContent } from "./MessageContent";
import { TypingIndicator } from "./TypingIndicator";
import { MediaUpload } from "./MediaUpload";
import { ReadReceipt } from "./ReadReceipt";
import { PaperclipIcon, X, Search, Pin, PinOff } from "lucide-react";
import {
  addDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  or,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
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

  // Scroll to bottom when new messages arrive
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

  // Filter pinned messages
  useEffect(() => {
    const pinned = messages.filter(msg => msg.isPinned);
    setPinnedMessages(pinned);
  }, [messages]);

  // Listen for messages
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', mockConversationId),
      ...(searchQuery // Conditionally apply 'where' filter for search
        ? [where('content', '>=', searchQuery), where('content', '<=', searchQuery + '\uf8ff')]
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

      // Mark messages as read
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
    <div className="flex-1 flex flex-col">
      <div className="border-b border-white/10">
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Public</span>
              </div>
              <h2 className="text-lg font-semibold">All PR and Media Credentials</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              18 Access
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-accent/5 border-0 rounded-md py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        {pinnedMessages.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pinned Messages
            </h3>
            <div className="space-y-2">
              {pinnedMessages.map((message) => (
                <div
                  key={`pinned-${message.id}`}
                  className={`flex w-full max-w-[80%] ${
                    message.senderId === currentUserId ? 'ml-auto' : ''
                  }`}
                >
                  <div className="w-full bg-white/5 rounded-xl p-3">
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
              className={`flex w-full max-w-[80%] ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative max-w-[80%] bg-white/10 rounded-3xl p-4 group">
                <MessageContent
                  content={message.content}
                  type={message.type}
                  className="text-sm"
                  metadata={message.metadata}
                />
                <div className="text-xs text-white/50 mt-1 flex items-center gap-1 justify-between">
                  <div className="flex items-center gap-1">
                  {message.timestamp.toLocaleTimeString()}
                    {message.senderId === currentUserId && (
                      <ReadReceipt status={message.status} />
                    )}
                  </div>
                  <button
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-accent/20"
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

      <div className="p-4 space-y-2 border-t border-white/10">
        {isTyping && <TypingIndicator conversationId={mockConversationId} />}

        {showMediaUpload ? (
          <div className="relative">
            <button
              className="absolute top-2 right-2 z-10 rounded-full p-2 hover:bg-accent/20"
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
          <form onSubmit={handleSubmit} className="flex gap-2">
            <button
              type="button"
              className="rounded-full p-2 hover:bg-accent/20"
              onClick={() => setShowMediaUpload(true)}
            >
              <PaperclipIcon className="h-5 w-5" />
            </button>
            <Textarea
              value={inputValue}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="min-h-[60px] flex-1"
              rows={1}
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
