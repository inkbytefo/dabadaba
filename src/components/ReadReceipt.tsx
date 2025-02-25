import React from 'react';
import { Check } from 'lucide-react';

interface ReadReceiptProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  className?: string;
}

export const ReadReceipt: React.FC<ReadReceiptProps> = ({ status, className = '' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'read':
        return 'text-blue-500';
      case 'delivered':
        return 'text-gray-400';
      case 'sent':
        return 'text-gray-500';
      case 'sending':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderIcon = () => {
    switch (status) {
      case 'read':
        return (
          <div className="flex">
            <Check className="h-3 w-3" />
            <Check className="-ml-1 h-3 w-3" />
          </div>
        );
      case 'delivered':
      case 'sent':
        return (
          <div className="flex">
            <Check className="h-3 w-3" />
          </div>
        );
      case 'sending':
        return (
          <div className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex items-center ${getStatusColor()} ${className}`}>
      {renderIcon()}
    </div>
  );
};