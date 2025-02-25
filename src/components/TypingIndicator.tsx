import React from "react";

interface TypingIndicatorProps {
  conversationId: string;
}

export const TypingIndicator = ({ conversationId }: TypingIndicatorProps) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 animate-pulse">
      <div className="flex space-x-1">
        <div className="h-2 w-2 rounded-full bg-messenger-primary"></div>
        <div className="h-2 w-2 rounded-full bg-messenger-primary animation-delay-200"></div>
        <div className="h-2 w-2 rounded-full bg-messenger-primary animation-delay-400"></div>
      </div>
      <span>Someone is typing...</span>
    </div>
  );
};