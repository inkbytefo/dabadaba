import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileIcon, AudioLines, Link } from 'lucide-react';
import { fetchLinkPreview } from '@/lib/link-preview';

interface MessageContentProps {
  content: string;
  type: 'text' | 'markdown' | 'image' | 'video' | 'file' | 'audio';
  className?: string;
  metadata?: {
    fileType?: string;
    fileSize?: number;
    fileName?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number;
  };
}

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const MessageContent: React.FC<MessageContentProps> = ({ content, type, className = '', metadata }) => {
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);

    if (urls && urls.length > 0) {
      setIsLink(true);
      fetchLinkPreview(urls[0]).then(previewData => {
        setLinkPreview(previewData);
      });
    } else {
      setIsLink(false);
      setLinkPreview(null);
    }
  }, [content]);

  if (type === 'markdown') {
    return (
      <div className={`prose prose-invert max-w-none ${className}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className={`space-y-2 ${className}`}>
        <img
          src={content}
          alt={metadata?.fileName || 'Image'}
          className="max-w-full rounded-xl"
          style={{
            maxHeight: '300px',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
        {metadata && (
          <div className="text-xs text-gray-400">
            {metadata.fileName && <div>{metadata.fileName}</div>}
            <div className="space-x-2">
              {metadata.dimensions && (
                <span>{metadata.dimensions.width}×{metadata.dimensions.height}</span>
              )}
              {metadata.fileSize && (
                <span>{formatFileSize(metadata.fileSize)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className={`space-y-2 ${className}`}>
        <video
          src={content}
          controls
          className="max-w-full rounded-xl"
          style={{
            maxHeight: '300px',
            width: 'auto'
          }}
        />
        {metadata && (
          <div className="text-xs text-gray-400">
            {metadata.fileName && <div>{metadata.fileName}</div>}
            <div className="space-x-2">
              {metadata.dimensions && (
                <span>{metadata.dimensions.width}×{metadata.dimensions.height}</span>
              )}
              {metadata.duration && (
                <span>{formatDuration(metadata.duration)}</span>
              )}
              {metadata.fileSize && (
                <span>{formatFileSize(metadata.fileSize)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'audio') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
          <AudioLines className="h-8 w-8 text-blue-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">
              {metadata?.fileName || 'Audio file'}
            </div>
            <div className="text-xs text-gray-400 space-x-2">
              {metadata?.duration && (
                <span>{formatDuration(metadata.duration)}</span>
              )}
              {metadata?.fileSize && (
                <span>{formatFileSize(metadata.fileSize)}</span>
              )}
            </div>
          </div>
        </div>
        <audio src={content} controls className="w-full" />
      </div>
    );
  }

  if (type === 'file') {
    return (
      <div className={`space-y-2 ${className}`}>
        <a
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <FileIcon className="h-8 w-8 text-blue-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">
              {metadata?.fileName || 'File'}
            </div>
            {metadata?.fileSize && (
              <div className="text-xs text-gray-400">
                {formatFileSize(metadata.fileSize)}
              </div>
            )}
          </div>
        </a>
      </div>
    );
  }

  if (isLink && linkPreview) {
    return (
      <div className={`space-y-2 ${className}`}>
        <a
          href={linkPreview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col rounded-xl border border-white/20 hover:border-white/30 transition-colors overflow-hidden"
        >
          {linkPreview.image && (
            <img src={linkPreview.image} alt={linkPreview.title} className="w-full h-auto object-cover aspect-video" />
          )}
          <div className="p-4">
            <div className="text-sm font-semibold group-hover:underline underline-offset-2">
              {linkPreview.title}
            </div>
            <div className="text-xs text-gray-400 line-clamp-2">
              {linkPreview.description}
            </div>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

export { MessageContent };
