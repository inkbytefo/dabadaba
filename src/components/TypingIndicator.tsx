import React from 'react';
import { cn } from '@/lib/utils';

export interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-1">
        <span className="text-sm text-white/50">Typing</span>
        <div className="flex gap-1">
          <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.2s]" />
          <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.1s]" />
        </div>
      </div>
    </div>
  );
};
