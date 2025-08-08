export interface IpNFTMetadata {
  tokenId: bigint;
  title: string;
  description: string;
  contentType: "image" | "text" | "audio" | "video" | "code" | "social";
  creator: {
    address: string;
    socialProfiles: {
      twitter?: string;
      spotify?: string;
      tiktok?: string;
      telegram?: string;
    };
    verified?: boolean;
  };
  license: {
    price: bigint;
    duration: number;
    royaltyBps: number;
    paymentToken: string;
  };
  contentHash: string;
  uri: string;
  createdAt: number;
  tags: string[];
  previewUrl?: string;
  samples?: number;
  downloads?: number;
  rating?: number;
}

export interface MarketplaceFilters {
  contentTypes: string[];
  priceRange: [number, number];
  verifiedOnly: boolean;
  licenseDurations: string[];
  uploadTimeframe: string;
  searchQuery: string;
  sortBy:
    | "newest"
    | "oldest"
    | "price_low"
    | "price_high"
    | "popular"
    | "rating";
}

export interface PaginationParams {
  page: number;
  limit: number;
  cursor?: string;
}

export interface MarketplaceResponse {
  items: IpNFTMetadata[];
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

export interface MarketplaceQueryParams extends PaginationParams {
  filters: Partial<MarketplaceFilters>;
}
