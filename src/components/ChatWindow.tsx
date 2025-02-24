
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const ChatWindow = () => {
  const [message, setMessage] = useState("");

  const messages = [
    { id: 1, text: "Hey! Ready for some gaming?", sender: "them" },
    { id: 2, text: "Absolutely! What are we playing?", sender: "me" },
    { id: 3, text: "How about some ranked matches?", sender: "them" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Player One</h2>
          <span className="text-sm text-messenger-primary">Online</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`message-bubble ${
                  msg.sender === "me" ? "message-bubble-out" : "message-bubble-in"
                } animate-fade-in`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) {
              // Handle message send
              setMessage("");
            }
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
          />
          <Button type="submit" size="icon" className="bg-messenger-primary hover:bg-messenger-secondary">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
