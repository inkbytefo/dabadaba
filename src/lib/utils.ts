import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday } from "date-fns"
import { Timestamp } from "firebase/firestore"
import type { Message } from "@/types/models"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Message grouping with memoization support
export interface GroupedMessages {
  [key: string]: Message[]
}

export function groupMessagesByDate(messages: Message[]): GroupedMessages {
  return messages.reduce((groups: GroupedMessages, message) => {
    if (!message.timestamp) return groups;
    
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
    
    return groups;
  }, {});
}

// Format message date for display
export function formatMessageDate(timestamp: Timestamp | undefined | null): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate();
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, 'HH:mm')}`;
  }
  return format(date, 'MMM d, HH:mm');
}

// Message preview generator
export function getMessagePreview(message: Message): string {
  if (!message.content) return "No content";
  
  switch (message.type) {
    case 'image':
      return '🖼️ Shared an image';
    case 'video':
      return '🎥 Shared a video';
    case 'file':
      return '📎 Shared a file';
    case 'audio':
      return '🎵 Shared audio';
    case 'markdown':
      return message.content;
    default:
      return message.content;
  }
}

// Helper to get estimated row height for virtualization
export function getEstimatedMessageHeight(message: Message): number {
  const baseHeight = 72; // Base height for a simple message
  const contentLength = message.content?.length || 0;
  const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;
  
  return baseHeight + Math.floor(contentLength / 50) * 20 + (hasReactions ? 32 : 0);
}
