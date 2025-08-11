"use client";

import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { MarketplaceService } from "@/lib/marketplace-service";
import {
  MarketplaceQueryParams,
  IpNFTMetadata,
  MarketplaceFilters,
} from "@/types/marketplace";
import { useEffect, useMemo } from "react";

/**
 * Hook for fetching marketplace data with caching and pagination
 */
export function useMarketplaceData(
  filters: Partial<MarketplaceFilters> = {},
  limit: number = 20,
  options?: { enabled?: boolean },
) {
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const marketplaceService = useMemo(() => {
    return auth ? new MarketplaceService(auth) : null;
  }, [auth]);

  const queryKey = ["marketplace", filters, limit];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!marketplaceService) throw new Error("Authentication required");

      return marketplaceService.getMarketplaceData({
        page: 1,
        limit,
        filters,
      });
    },
    enabled: !!marketplaceService && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Avoid repeated background refetches to fetch only once per mount unless manually refetched
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
    keepPreviousData: true,
  });

  // Set up real-time updates
  useEffect(() => {
    if (!marketplaceService) return;

    const unsubscribe = marketplaceService.subscribeToMarketplaceUpdates(
      (update) => {
        // Invalidate and refetch marketplace data when updates occur
        queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      },
    );

    return unsubscribe;
  }, [marketplaceService, queryClient]);

  return {
    data: query.data?.items || [],
    totalCount: query.data?.totalCount || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for infinite scrolling marketplace data
 */
export function useInfiniteMarketplaceData(
  filters: Partial<MarketplaceFilters> = {},
  limit: number = 20,
  options?: { enabled?: boolean },
) {
  const { auth } = useAuth();

  const marketplaceService = useMemo(() => {
    return auth ? new MarketplaceService(auth) : null;
  }, [auth]);

  const query = useInfiniteQuery({
    queryKey: ["marketplace-infinite", filters, limit],
    queryFn: async ({ pageParam = 1 }) => {
      if (!marketplaceService) throw new Error("Authentication required");

      return marketplaceService.getMarketplaceData({
        page: pageParam as number,
        limit,
        filters,
      });
    },
    enabled: !!marketplaceService && (options?.enabled ?? true),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const allItems = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.items) || [];
  }, [query.data]);

  return {
    data: allItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching individual IpNFT metadata
 */
export function useIpNFTMetadata(tokenId: bigint | null) {
  const { auth } = useAuth();

  const marketplaceService = useMemo(() => {
    return auth ? new MarketplaceService(auth) : null;
  }, [auth]);

  return useQuery({
    queryKey: ["ipnft-metadata", tokenId?.toString()],
    queryFn: async () => {
      if (!marketplaceService || !tokenId)
        throw new Error("Invalid parameters");
      return marketplaceService.getIpNFTMetadata(tokenId);
    },
    enabled: !!marketplaceService && !!tokenId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for searching IpNFTs
 */
export function useSearchIpNFTs(query: string, limit: number = 20) {
  const { auth } = useAuth();

  const marketplaceService = useMemo(() => {
    return auth ? new MarketplaceService(auth) : null;
  }, [auth]);

  return useQuery({
    queryKey: ["search-ipnfts", query, limit],
    queryFn: async () => {
      if (!marketplaceService) throw new Error("Authentication required");
      return marketplaceService.searchIpNFTs(query, limit);
    },
    enabled: !!marketplaceService && query.length > 2, // Only search with 3+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching trending IpNFTs
 */
export function useTrendingIpNFTs(limit: number = 10) {
  const { auth } = useAuth();

  const marketplaceService = useMemo(() => {
    return auth ? new MarketplaceService(auth) : null;
  }, [auth]);

  return useQuery({
    queryKey: ["trending-ipnfts", limit],
    queryFn: async () => {
      if (!marketplaceService) throw new Error("Authentication required");
      return marketplaceService.getTrendingIpNFTs(limit);
    },
    enabled: !!marketplaceService,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook for prefetching marketplace data
 */
export function usePrefetchMarketplaceData() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  const marketplaceService = useMemo(() => {
    return auth ? new MarketplaceService(auth) : null;
  }, [auth]);

  const prefetchPage = async (
    filters: Partial<MarketplaceFilters>,
    page: number,
    limit: number = 20,
  ) => {
    if (!marketplaceService) return;

    await queryClient.prefetchQuery({
      queryKey: ["marketplace", filters, limit, page],
      queryFn: () =>
        marketplaceService.getMarketplaceData({
          page,
          limit,
          filters,
        }),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchIpNFT = async (tokenId: bigint) => {
    if (!marketplaceService) return;

    await queryClient.prefetchQuery({
      queryKey: ["ipnft-metadata", tokenId.toString()],
      queryFn: () => marketplaceService.getIpNFTMetadata(tokenId),
      staleTime: 10 * 60 * 1000,
    });
  };

  return {
    prefetchPage,
    prefetchIpNFT,
  };
}
