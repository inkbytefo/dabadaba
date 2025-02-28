import React, { useMemo } from 'react';
import type { ListChildComponentProps } from 'react-window';
import type { Message } from '../types/models';
import { groupMessagesByDate, getEstimatedMessageHeight } from '../lib/utils';

export interface VirtualizedMessageItem {
  type: 'date_header' | 'message';
  content: Message | string;
  date?: string;
}

interface MessageRendererData {
  renderMessage: (message: Message) => React.ReactNode;
}

interface CustomListChildProps extends Omit<ListChildComponentProps, 'data'> {
  data: MessageRendererData;
}

export function useVirtualizedMessages(messages: Message[]) {
  const virtualizedItems = useMemo(() => {
    const groupedMessages = groupMessagesByDate(messages);
    const items: VirtualizedMessageItem[] = [];

    Object.entries(groupedMessages).forEach(([date, dateMessages]) => {
      // Add date header
      items.push({
        type: 'date_header' as const,
        content: date,
        date
      });

      // Add messages for this date
      dateMessages.forEach(message => {
        items.push({
          type: 'message' as const,
          content: message,
          date
        });
      });
    });

    return items;
  }, [messages]);

  const getItemHeight = (index: number): number => {
    const item = virtualizedItems[index];
    if (item.type === 'date_header') {
      return 40; // Height of date header
    }
    return getEstimatedMessageHeight(item.content as Message);
  };

  const getItemKey = (index: number): string => {
    const item = virtualizedItems[index];
    if (item.type === 'date_header') {
      return `header-${item.date}`;
    }
    return `message-${(item.content as Message).id}`;
  };

  const rowRenderer = ({ index, style, data }: CustomListChildProps): React.ReactElement | null => {
    const item = virtualizedItems[index];
    if (!item) return null;

    if (item.type === 'date_header') {
      return (
        <div 
          style={style}
          className="sticky top-0 bg-[#1e1e1e]/90 backdrop-blur-lg py-2 z-10"
        >
          <h3 className="text-sm font-medium text-white/50 tracking-wide text-center">
            {item.content as string}
          </h3>
        </div>
      );
    }

    return (
      <div style={style}>
        {data.renderMessage(item.content as Message)}
      </div>
    );
  };

  return {
    virtualizedItems,
    getItemHeight,
    getItemKey,
    rowRenderer,
    totalItems: virtualizedItems.length
  };
}