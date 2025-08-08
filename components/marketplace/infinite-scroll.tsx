"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  children: React.ReactNode;
  threshold?: number;
}

export default function InfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  children,
  threshold = 100,
}: InfiniteScrollProps) {
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    });

    const currentRef = loadingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleIntersection, threshold]);

  return (
    <div>
      {children}

      {/* Loading indicator */}
      <div ref={loadingRef} className="flex items-center justify-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center space-x-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading more datasets...</span>
          </div>
        )}

        {!hasNextPage && !isFetchingNextPage && (
          <div className="text-gray-500 text-sm">No more datasets to load</div>
        )}
      </div>
    </div>
  );
}
