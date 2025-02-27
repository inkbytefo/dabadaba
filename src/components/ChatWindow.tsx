import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageContent } from "./MessageContent";
import { TypingIndicator } from "./TypingIndicator";
import { MediaUpload } from "./MediaUpload";
import { ReadReceipt } from "./ReadReceipt";
import { 
  PaperclipIcon, 
  X, 
  Search, 
  Pin, 
  PinOff, 
  Send, 
  Smile,
  Edit,
  Trash2,
  MessageSquare,
  Heart,
  ThumbsUp
} from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Message as MessageType } from "@/types/models";
import { useMessagingStore } from "@/store/messaging";

export const ChatWindow = () => {
  const { pinMessage, unpinMessage } = useMessagingStore();
  const mockConversationId = "demo-conversation";
  const currentUserId = auth.currentUser?.uid || 'demo-user';

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState<MessageType[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const reactions = {
    "❤️": <Heart className="h-4 w-4" />,
    "👍": <ThumbsUp className="h-4 w-4" />,
    "😊": <Smile className="h-4 w-4" />
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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

  const handleEdit = async (messageId: string, newContent: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        content: newContent,
        editedAt: serverTimestamp()
      });
      setEditingMessageId(null);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        deleted: true,
        deletedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const message = messages.find(m => m.id === messageId);
      
      if (!message) return;
      
      const reactions = { ...(message.reactions || {}) };
      if (reactions[currentUserId] === reaction) {
        delete reactions[currentUserId];
      } else {
        reactions[currentUserId] = reaction;
      }
      
      await updateDoc(messageRef, { reactions });
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const renderReactions = (message: MessageType) => {
    if (!message.reactions) return null;
    
    const reactionCounts = Object.values(message.reactions).reduce((acc, reaction) => {
      acc[reaction] = (acc[reaction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {Object.entries(reactionCounts).map(([reaction, count]) => (
          <span 
            key={reaction} 
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full 
                     bg-white/5 hover:bg-white/8 text-white/70 text-sm 
                     border border-white/10 transition-all duration-200"
          >
            {reaction} {count}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#1e1e1e]/80 backdrop-blur-lg p-6">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${
                message.senderId === currentUserId ? 'justify-end' : 'justify-start'
              } px-4`}
            >
              <div className={`message-bubble group relative max-w-[70%] p-4 rounded-lg border 
                           ${message.senderId === currentUserId
                             ? 'bg-blue-500/20 backdrop-blur-sm text-white border-blue-500/20'
                             : 'bg-white/5 backdrop-blur-sm text-white/90 border-white/10'
                           } transition-all duration-200 hover:shadow-lg`}
              >
                {editingMessageId === message.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                    handleEdit(message.id, input.value);
                  }}>
                    <input
                      type="text"
                      defaultValue={message.content}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 
                               text-white focus:ring-2 focus:ring-white/20 transition-all duration-200
                               hover:bg-white/8"
                      autoFocus
                    />
                  </form>
                ) : (
                  <MessageContent
                    content={message.content}
                    type={message.type}
                    className="text-sm"
                    metadata={message.metadata}
                  />
                )}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="flex items-center gap-1.5 bg-[#1e1e1e]/90 backdrop-blur-sm rounded-full 
                                p-1 border border-white/10 shadow-lg">
                    <button
                      onClick={() => setShowReactionPicker(message.id)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white/60 
                               transition-colors duration-200"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    {message.senderId === currentUserId && (
                      <>
                        <button
                          onClick={() => setEditingMessageId(message.id)}
                          className="p-1.5 rounded-full hover:bg-white/10 text-white/60 
                                   transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="p-1.5 rounded-full hover:bg-red-500/10 text-red-400/70 
                                   transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {showReactionPicker === message.id && (
                  <div className="absolute -top-12 right-0 flex items-center gap-1.5 p-2 
                              rounded-lg bg-[#1e1e1e]/95 backdrop-blur-lg border border-white/10 
                              shadow-xl">
                    {Object.entries(reactions).map(([emoji, icon]) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/60 
                                 transition-colors duration-200"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}

                {renderReactions(message)}

                <div className="text-xs text-white/40 mt-2 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    {formatTimestamp(message.timestamp)}
                    {message.senderId === currentUserId && (
                      <ReadReceipt status={message.status} />
                    )}
                  </div>
                  <button
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 
                             rounded-full p-1 hover:bg-white/10 text-white/50 hover:text-white/70"
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
    </div>
  );
};
