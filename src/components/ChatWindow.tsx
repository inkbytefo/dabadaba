import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
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
  ThumbsUp,
  Loader2 
} from "lucide-react";
import { Message as MessageType } from "@/types/models";
import { useMessages } from "@/store/messaging";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";

const ReactionIcons = {
  "❤️": <Heart className="h-4 w-4" />,
  "👍": <ThumbsUp className="h-4 w-4" />,
  "😊": <Smile className="h-4 w-4" />
};

export const ChatWindow = () => {
  const {
    messages,
    loading,
    currentConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    pinMessage,
    unpinMessage,
    markAsRead
  } = useMessages();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!currentConversation) return;
    
    const unreadMessages = messages.filter(m => m.status !== 'read');
    unreadMessages.forEach(message => {
      markAsRead(message.id);
    });
  }, [messages, currentConversation, markAsRead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentConversation) return;

    try {
      await sendMessage(inputValue.trim());
      setInputValue('');
      setIsTyping(false);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    try {
      await editMessage(messageId, newContent);
      setEditingMessageId(null);
    } catch (error) {
      toast.error("Failed to edit message");
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    try {
      await reactToMessage(messageId, reaction);
      setShowReactionPicker(null);
    } catch (error) {
      toast.error("Failed to add reaction");
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
          <button
            key={reaction}
            onClick={() => handleReaction(message.id, reaction)}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full",
              "bg-white/5 hover:bg-white/8 text-white/70 text-sm",
              "border border-white/10 transition-all duration-200",
              message.reactions?.[currentConversation?.id || ''] === reaction && "bg-white/15"
            )}
          >
            {reaction} {count}
          </button>
        ))}
      </div>
    );
  };

  const groupMessagesByDate = (messages: MessageType[]) => {
    const groups: { [key: string]: MessageType[] } = {};
    
    messages.forEach(message => {
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

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4" />
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#1e1e1e]/80 backdrop-blur-lg">
      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1"
        viewportClassName="p-6"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-white/40" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/40">
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
              <div key={date} className="space-y-4">
                <div className="sticky top-0 bg-[#1e1e1e]/90 backdrop-blur-lg py-2 z-10">
                  <h3 className="text-sm font-medium text-white/50 tracking-wide text-center">{date}</h3>
                </div>

                {msgs.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full px-4",
                      message.senderId === currentConversation.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "message-bubble group relative max-w-[70%] p-4 rounded-lg border",
                      message.senderId === currentConversation.id
                        ? "bg-blue-500/20 backdrop-blur-sm text-white border-blue-500/20"
                        : "bg-white/5 backdrop-blur-sm text-white/90 border-white/10",
                      "transition-all duration-200 hover:shadow-lg"
                    )}>
                      {editingMessageId === message.id ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.querySelector('textarea') as HTMLTextAreaElement;
                          handleEdit(message.id, input.value);
                        }}>
                          <Textarea
                            defaultValue={message.content}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 
                                     text-white focus:ring-2 focus:ring-white/20 transition-all duration-200
                                     hover:bg-white/8 min-h-[100px] resize-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMessageId(null)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" size="sm">Save</Button>
                          </div>
                        </form>
                      ) : (
                        <MessageContent
                          content={message.content}
                          type={message.type}
                          className="text-sm"
                          metadata={message.metadata}
                        />
                      )}

                      {/* Message Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="flex items-center gap-1.5 bg-[#1e1e1e]/90 backdrop-blur-sm rounded-full 
                                    p-1 border border-white/10 shadow-lg">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowReactionPicker(message.id)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white/60"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {message.senderId === currentConversation.id && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingMessageId(message.id)}
                                className="p-1.5 rounded-full hover:bg-white/10 text-white/60"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(message.id)}
                                className="p-1.5 rounded-full hover:bg-red-500/10 text-red-400/70"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Reaction Picker */}
                      {showReactionPicker === message.id && (
                        <div className="absolute -top-12 right-0 flex items-center gap-1.5 p-2 
                                    rounded-lg bg-[#1e1e1e]/95 backdrop-blur-lg border border-white/10 
                                    shadow-xl z-10">
                          {Object.entries(ReactionIcons).map(([emoji, icon]) => (
                            <Button
                              key={emoji}
                              size="icon"
                              variant="ghost"
                              onClick={() => handleReaction(message.id, emoji)}
                              className="p-1.5 rounded-full hover:bg-white/10 text-white/60"
                            >
                              {icon}
                            </Button>
                          ))}
                        </div>
                      )}

                      {renderReactions(message)}

                      {/* Message Footer */}
                      <div className="text-xs text-white/40 mt-2 flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          {format(message.timestamp.toDate(), 'HH:mm')}
                          {message.editedAt && (
                            <span className="text-white/30">(edited)</span>
                          )}
                          {message.senderId === currentConversation.id && (
                            <ReadReceipt status={message.status} />
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200",
                            "rounded-full p-1 hover:bg-white/10 text-white/50 hover:text-white/70"
                          )}
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
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowMediaUpload(!showMediaUpload)}
            className="flex-shrink-0"
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsTyping(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[80px] max-h-[200px] bg-white/5 border-white/10 
                       focus:ring-2 focus:ring-white/20 transition-all duration-200
                       resize-none"
            />
            {isTyping && (
              <TypingIndicator className="absolute -top-6 left-2 text-white/40 text-sm" />
            )}
          </div>
          
          <Button 
            type="submit"
            className="flex-shrink-0"
            disabled={!inputValue.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        {showMediaUpload && (
          <div className="mt-4">
            <MediaUpload onClose={() => setShowMediaUpload(false)} />
          </div>
        )}
      </div>
    </div>
  );
};
