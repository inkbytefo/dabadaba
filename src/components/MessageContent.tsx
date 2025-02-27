import React from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, FileText, Video, Music } from 'lucide-react';
import { Message } from '@/types/models';
import Markdown from 'react-markdown';

interface MessageContentProps {
  content: string;
  type: Message['type'];
  className?: string;
  metadata?: Message['metadata'];
}

const getFileIcon = (fileType: string | undefined) => {
  if (!fileType) return <FileText className="h-5 w-5" />;
  
  if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
  if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />;
  if (fileType.startsWith('audio/')) return <Music className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
};

const formatFileSize = (bytes: number | undefined) => {
  if (!bytes) return '';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  type,
  className,
  metadata
}) => {
  switch (type) {
    case 'markdown':
      return (
        <div className={cn("prose prose-invert max-w-none", className)}>
          <Markdown>{content}</Markdown>
        </div>
      );

    case 'image':
      return (
        <div className={cn("max-w-lg", className)}>
          <img
            src={content}
            alt={metadata?.fileName || "Image"}
            className="rounded-lg border border-white/10 w-full h-auto"
            loading="lazy"
            style={
              metadata?.dimensions
                ? {
                    aspectRatio: `${metadata.dimensions.width}/${metadata.dimensions.height}`,
                  }
                : undefined
            }
          />
        </div>
      );

    case 'video':
      return (
        <div className={cn("max-w-lg", className)}>
          <video
            src={content}
            controls
            className="rounded-lg border border-white/10 w-full"
            preload="metadata"
          >
            <source src={content} type={metadata?.fileType} />
            Your browser does not support the video element.
          </video>
        </div>
      );

    case 'audio':
      return (
        <div className={cn("max-w-lg", className)}>
          <audio
            src={content}
            controls
            className="w-full"
            preload="metadata"
          >
            <source src={content} type={metadata?.fileType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );

    case 'file':
      return (
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          "bg-white/5 hover:bg-white/8 border border-white/10",
          "transition-colors duration-200",
          className
        )}>
          {getFileIcon(metadata?.fileType)}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white/90 truncate">
              {metadata?.fileName || 'File'}
            </span>
            {metadata?.fileSize && (
              <span className="text-xs text-white/50">
                {formatFileSize(metadata.fileSize)}
              </span>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className={className}>
          {content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      );
  }
};
