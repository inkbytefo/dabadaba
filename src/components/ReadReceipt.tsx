import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReadReceiptProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  className?: string;
}

export const ReadReceipt: React.FC<ReadReceiptProps> = ({ status, className }) => {
  const renderIcon = () => {
    switch (status) {
      case 'read':
        return (
          <CheckCheck 
            className={cn(
              "h-3.5 w-3.5 text-blue-400 fill-blue-400/20",
              className
            )} 
          />
        );
      case 'delivered':
        return (
          <CheckCheck 
            className={cn(
              "h-3.5 w-3.5 text-white/60",
              className
            )} 
          />
        );
      case 'sent':
        return (
          <Check 
            className={cn(
              "h-3.5 w-3.5 text-white/60",
              className
            )} 
          />
        );
      case 'sending':
        return (
          <div 
            className={cn(
              "h-2 w-2 rounded-full bg-white/40 animate-pulse",
              className
            )} 
          />
        );
    }
  };

  return (
    <div 
      className="inline-flex items-center"
      role="status"
      aria-label={`Message ${status}`}
    >
      {renderIcon()}
    </div>
  );
};
