import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface VirtualizedGridProps<T> {
  items: T[];
  itemHeight: number;
  columns: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  overscan?: number;
  loading?: boolean;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function VirtualizedGrid<T>({
  items,
  itemHeight,
  columns = 3,
  gap = 12,
  renderItem,
  keyExtractor,
  overscan = 5,
  loading = false,
  emptyMessage = "No items found",
  onLoadMore,
  hasMore = false,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const rowCount = Math.ceil(items.length / columns);
  const rowHeight = itemHeight + gap;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
    paddingStart: 0,
    paddingEnd: 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleScroll = () => {
    if (!hasMore || loading || !onLoadMore) return;
    const scrollElement = parentRef.current;
    if (!scrollElement) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      onLoadMore();
    }
  };

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll, hasMore, loading, onLoadMore]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Loader2 className="w-8 h-8 mx-auto mb-4 opacity-50 animate-spin" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="relative"
      style={{ 
        height: "auto",
        minHeight: "400px",
        width: "100%",
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${rowCount * rowHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <AnimatePresence mode="popLayout">
          {virtualItems.map((virtualRow) => {
            const rowIndex = virtualRow.index;
            const startIdx = rowIndex * columns;
            const endIdx = Math.min(startIdx + columns, items.length);
            const rowItems = items.slice(startIdx, endIdx);
            
            return (
              <motion.div
                key={rowIndex}
                style={{
                  position: "absolute",
                  top: `${virtualRow.start}px`,
                  left: 0,
                  right: 0,
                  height: `${virtualRow.size}px`,
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: `${gap}px`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {rowItems.map((item, colIdx) => (
                  <div key={keyExtractor(item)}>
                    {renderItem(item, startIdx + colIdx)}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {hasMore && !loading && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-muted/50 text-sm text-muted-foreground hover:bg-muted/70 transition-colors"
          >
            Load more items
          </button>
        </div>
      )}
      {loading && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  overscan?: number;
  loading?: boolean;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  gap = 8,
  renderItem,
  keyExtractor,
  overscan = 5,
  loading = false,
  emptyMessage = "No items found",
  onLoadMore,
  hasMore = false,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan,
    paddingStart: 0,
    paddingEnd: 0,
  });

  const handleScroll = () => {
    if (!hasMore || loading || !onLoadMore) return;
    const scrollElement = parentRef.current;
    if (!scrollElement) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      onLoadMore();
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Loader2 className="w-8 h-8 mx-auto mb-4 opacity-50 animate-spin" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="relative"
      style={{ 
        height: "auto",
        minHeight: "400px",
        width: "100%",
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${items.length * (itemHeight + gap)}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <AnimatePresence mode="popLayout">
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <motion.div
              key={virtualItem.index}
              style={{
                position: "absolute",
                top: `${virtualItem.start}px`,
                left: 0,
                right: 0,
                height: `${virtualItem.size}px`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderItem(items[virtualItem.index], virtualItem.index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {hasMore && !loading && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-muted/50 text-sm text-muted-foreground hover:bg-muted/70 transition-colors"
          >
            Load more items
          </button>
        </div>
      )}
      {loading && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}