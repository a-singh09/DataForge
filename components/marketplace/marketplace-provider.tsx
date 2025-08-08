"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { MarketplaceFilters } from "@/types/marketplace";
import {
  useMarketplaceData,
  useInfiniteMarketplaceData,
} from "@/hooks/useMarketplaceData";

interface MarketplaceContextType {
  // Filters
  filters: Partial<MarketplaceFilters>;
  updateFilters: (newFilters: Partial<MarketplaceFilters>) => void;
  clearFilters: () => void;

  // View mode
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Pagination mode
  paginationMode: "pages" | "infinite";
  setPaginationMode: (mode: "pages" | "infinite") => void;

  // Data
  data: any[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;

  // Infinite scroll specific
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(
  undefined,
);

interface MarketplaceProviderProps {
  children: ReactNode;
  initialFilters?: Partial<MarketplaceFilters>;
  initialViewMode?: "grid" | "list";
  initialPaginationMode?: "pages" | "infinite";
  itemsPerPage?: number;
}

export function MarketplaceProvider({
  children,
  initialFilters = {},
  initialViewMode = "grid",
  initialPaginationMode = "infinite",
  itemsPerPage = 20,
}: MarketplaceProviderProps) {
  const [filters, setFilters] =
    useState<Partial<MarketplaceFilters>>(initialFilters);
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);
  const [paginationMode, setPaginationMode] = useState<"pages" | "infinite">(
    initialPaginationMode,
  );

  // Regular pagination data
  const paginatedQuery = useMarketplaceData(filters, itemsPerPage);

  // Infinite scroll data
  const infiniteQuery = useInfiniteMarketplaceData(filters, itemsPerPage);

  const updateFilters = useCallback(
    (newFilters: Partial<MarketplaceFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Choose which query to use based on pagination mode
  const activeQuery =
    paginationMode === "infinite" ? infiniteQuery : paginatedQuery;

  const contextValue: MarketplaceContextType = {
    filters,
    updateFilters,
    clearFilters,
    viewMode,
    setViewMode,
    paginationMode,
    setPaginationMode,
    data: activeQuery.data,
    totalCount:
      paginationMode === "pages"
        ? paginatedQuery.totalCount
        : infiniteQuery.data.length,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
    hasNextPage: infiniteQuery.hasNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
  };

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplaceContext() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error(
      "useMarketplaceContext must be used within a MarketplaceProvider",
    );
  }
  return context;
}
