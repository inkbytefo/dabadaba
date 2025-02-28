import { useRef, useCallback, useEffect } from 'react';

interface BatchOperation<T> {
  execute: (items: T[]) => Promise<void>;
  batchSize?: number;
  delay?: number;
}

export function useBatchedUpdates<T>({ execute, batchSize = 10, delay = 1000 }: BatchOperation<T>) {
  const batchQueue = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const processBatch = useCallback(async () => {
    const items = [...batchQueue.current];
    if (items.length === 0) return;

    // Clear the queue before processing to prevent duplicate processing
    batchQueue.current = [];

    try {
      await execute(items);
    } catch (error) {
      // If the batch operation fails, add items back to the queue
      batchQueue.current = [...batchQueue.current, ...items];
      console.error('Error processing batch:', error);
    }
  }, [execute]);

  const queueItem = useCallback((item: T) => {
    batchQueue.current.push(item);

    // If we've reached the batch size, process immediately
    if (batchQueue.current.length >= batchSize) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      processBatch();
      return;
    }

    // Otherwise, set a timeout to process the batch
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(processBatch, delay);
  }, [batchSize, delay, processBatch]);

  // Clean up any pending timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Process any remaining items in the queue
      if (batchQueue.current.length > 0) {
        processBatch();
      }
    };
  }, [processBatch]);

  return {
    queueItem,
    processBatch,
    currentQueue: batchQueue.current
  };
}