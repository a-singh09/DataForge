import { Auth } from "@campnetwork/origin";
import {
  IpNFTMetadata,
  MarketplaceResponse,
  MarketplaceQueryParams,
} from "@/types/marketplace";

export class MarketplaceService {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  /**
   * Fetch IpNFT metadata for a specific token using real Origin SDK methods
   */
  async getIpNFTMetadata(tokenId: bigint): Promise<IpNFTMetadata | null> {
    try {
      console.log(`Fetching real metadata for token ${tokenId}`);

      // Use Origin SDK methods to get real blockchain data
      const [tokenURI, owner, terms, contentHash] = await Promise.all([
        this.auth.origin.tokenURI(tokenId),
        this.auth.origin.ownerOf(tokenId),
        this.auth.origin.getTerms(tokenId),
        this.auth.origin.contentHash(tokenId),
      ]);

      console.log(`Token ${tokenId} data:`, {
        tokenURI,
        owner,
        terms,
        contentHash,
      });

      let metadata: any = {};

      // Fetch metadata from the tokenURI
      try {
        if (tokenURI) {
          // Handle IPFS URLs
          const metadataUrl = tokenURI.startsWith("ipfs://")
            ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            : tokenURI;

          console.log(`Fetching metadata from: ${metadataUrl}`);
          const metadataResponse = await fetch(metadataUrl);

          if (metadataResponse.ok) {
            metadata = await metadataResponse.json();
            console.log(`Metadata for token ${tokenId}:`, metadata);
          } else {
            console.warn(
              `Failed to fetch metadata: ${metadataResponse.status} ${metadataResponse.statusText}`,
            );
          }
        }
      } catch (metadataError) {
        console.warn(
          `Failed to fetch metadata from URI ${tokenURI}:`,
          metadataError,
        );
      }

      // Use fallback data if metadata is empty
      if (!metadata.name && !metadata.title) {
        metadata = {
          name: `IpNFT #${tokenId}`,
          description: "AI training dataset",
          image: "/api/placeholder/400/300",
        };
      }

      // Transform to our interface
      const ipnftData: IpNFTMetadata = {
        tokenId,
        title: metadata.name || metadata.title || `IpNFT #${tokenId}`,
        description:
          metadata.description || "AI training dataset from blockchain",
        contentType: this.inferContentType(metadata),
        creator: {
          address: owner,
          socialProfiles: {},
          verified: false, // This would need to be determined from additional data
        },
        license: {
          price: terms.price,
          duration: terms.duration,
          royaltyBps: terms.royaltyBps,
          paymentToken: terms.paymentToken,
        },
        contentHash,
        uri: tokenURI,
        createdAt: metadata.createdAt || Date.now(),
        tags: metadata.tags || [],
        previewUrl: metadata.image || "/api/placeholder/400/300",
        samples: metadata.samples || 0,
        downloads: 0, // This would need to be tracked separately
        rating: 0, // This would need to be calculated from reviews
      };

      return ipnftData;
    } catch (error) {
      console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * Fetch marketplace data with filtering and pagination
   * This fetches real user uploads and tries to discover other IpNFTs
   */
  async getMarketplaceData(
    params: MarketplaceQueryParams,
  ): Promise<MarketplaceResponse> {
    try {
      console.log("Fetching real marketplace data from Origin SDK...");

      // if (!this.auth.origin) {
      //   console.warn("Origin SDK not available");
      //   return await this.getMockMarketplaceData(params);
      // }

      // Step 1: Get current user's uploads (real data)
      const userUploads = await this.auth.origin.getOriginUploads();
      console.log("User uploads found:", userUploads?.length || 0);

      const allIpNFTs: IpNFTMetadata[] = [];

      // Step 2: Process user uploads
      if (userUploads && userUploads.length > 0) {
        for (const upload of userUploads) {
          try {
            const tokenId = BigInt(upload.tokenId || upload.id || 1);
            const metadata = await this.getIpNFTMetadata(tokenId);
            if (metadata) {
              allIpNFTs.push(metadata);
            }
          } catch (error) {
            console.warn("Failed to fetch upload metadata:", error);
          }
        }
      }

      // Step 3: Try to discover other IpNFTs by checking token IDs in small batches
      // This reduces rate limiting and is more efficient
      console.log("Attempting to discover other IpNFTs in batches...");

      const startTokenId = 1;
      const batchSize = 3; // Fetch 3 tokens at a time
      const maxBatches = 5; // Maximum 5 batches (15 tokens total)

      for (let batch = 0; batch < maxBatches; batch++) {
        const batchPromises: Promise<IpNFTMetadata | null>[] = [];

        // Create batch of token IDs to check
        for (let i = 0; i < batchSize; i++) {
          const tokenId = startTokenId + batch * batchSize + i;
          batchPromises.push(
            this.getIpNFTMetadata(BigInt(tokenId)).catch(() => null),
          );
        }

        try {
          console.log(
            `Fetching batch ${batch + 1}/${maxBatches} (tokens ${startTokenId + batch * batchSize}-${startTokenId + batch * batchSize + batchSize - 1})`,
          );

          const batchResults = await Promise.all(batchPromises);
          const validTokensInBatch = batchResults.filter(
            Boolean,
          ) as IpNFTMetadata[];

          console.log(
            `Batch ${batch + 1}: Found ${validTokensInBatch.length} valid IpNFTs`,
          );
          allIpNFTs.push(...validTokensInBatch);

          // Small delay between batches to be respectful to the RPC
          if (batch < maxBatches - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
          }
        } catch (batchError) {
          console.warn(`Batch ${batch + 1} failed:`, batchError);
          // Continue with next batch even if this one fails
        }
      }

      console.log(
        `Discovery complete: Found ${allIpNFTs.length - (userUploads?.length || 0)} additional IpNFTs`,
      );

      // Remove duplicates based on tokenId
      const uniqueTokens = allIpNFTs.filter(
        (token, index, self) =>
          index === self.findIndex((t) => t.tokenId === token.tokenId),
      );

      console.log(`Total unique IpNFTs found: ${uniqueTokens.length}`);

      // If we don't have enough real data, supplement with mock data
      // if (uniqueTokens.length < 10) {
      //   console.log("Supplementing with mock data for better UX...");
      //   const mockData = await this.getMockMarketplaceData({
      //     page: 1,
      //     limit: 10,
      //     filters: {},
      //   });

      //   // Add mock data with different token IDs to avoid conflicts
      //   const mockWithDifferentIds = mockData.items.map((item, index) => ({
      //     ...item,
      //     tokenId: BigInt(1000 + index), // Use high token IDs for mock data
      //   }));

      //   uniqueTokens.push(...mockWithDifferentIds);
      // }

      // Apply filters and sorting
      return this.applyFiltersAndPagination(uniqueTokens, params);
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error);
      console.warn("Falling back to mock data");
      // return await this.getMockMarketplaceData(params);
    }
  }

  /**
   * Check if user has access to a specific IpNFT
   */
  async hasAccess(tokenId: bigint, userAddress?: string): Promise<boolean> {
    try {
      if (!userAddress || !this.auth.origin) {
        return false;
      }

      return await this.auth.origin.hasAccess(tokenId, userAddress);
    } catch (error) {
      console.error(`Failed to check access for token ${tokenId}:`, error);
      return false;
    }
  }

  /**
   * Purchase access to an IpNFT
   */
  async purchaseAccess(tokenId: bigint, periods: number = 1): Promise<string> {
    try {
      if (!this.auth.origin) {
        throw new Error("Origin SDK not available");
      }

      const result = await this.auth.origin.buyAccessSmart(tokenId, periods);
      return result.hash || result.transactionHash || "success";
    } catch (error) {
      console.error(`Failed to purchase access for token ${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Get real-time updates for marketplace data
   */
  subscribeToMarketplaceUpdates(
    callback: (update: IpNFTMetadata) => void,
  ): () => void {
    // In a real implementation, this would set up WebSocket or polling
    // For now, we'll simulate periodic updates
    const interval = setInterval(async () => {
      // Check for new mints or updates
      // This is a placeholder for real-time functionality
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }

  /**
   * Search IpNFTs by text query
   */
  async searchIpNFTs(
    query: string,
    limit: number = 20,
  ): Promise<IpNFTMetadata[]> {
    try {
      // Use the marketplace data with search filter
      const data = await this.getMarketplaceData({
        page: 1,
        limit,
        filters: { searchQuery: query },
      });

      return data.items;
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  }

  /**
   * Get trending/popular IpNFTs
   */
  async getTrendingIpNFTs(limit: number = 10): Promise<IpNFTMetadata[]> {
    try {
      // Get marketplace data sorted by popularity
      const data = await this.getMarketplaceData({
        page: 1,
        limit,
        filters: { sortBy: "popular" },
      });
      return data.items;
    } catch (error) {
      console.error("Failed to fetch trending data:", error);
      return [];
    }
  }

  private inferContentType(metadata: any): IpNFTMetadata["contentType"] {
    const mimeType = metadata.mimeType || "";
    const category = metadata.category || "";

    if (mimeType.startsWith("image/") || category === "image") return "image";
    if (mimeType.startsWith("audio/") || category === "audio") return "audio";
    if (mimeType.startsWith("video/") || category === "video") return "video";
    if (mimeType.startsWith("text/") || category === "text") return "text";
    if (category === "code" || mimeType === "application/json") return "code";
    if (category === "social") return "social";

    return "text"; // Default fallback
  }

  private applyFiltersAndPagination(
    items: IpNFTMetadata[],
    params: MarketplaceQueryParams,
  ): MarketplaceResponse {
    let filteredItems = items;

    // Apply content type filter
    if (params.filters.contentTypes?.length) {
      filteredItems = filteredItems.filter((item) =>
        params.filters.contentTypes!.includes(item.contentType),
      );
    }

    // Apply search query filter
    if (params.filters.searchQuery) {
      const query = params.filters.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply verified creators filter
    if (params.filters.verifiedOnly) {
      filteredItems = filteredItems.filter((item) => item.creator.verified);
    }

    // Apply sorting
    switch (params.filters.sortBy) {
      case "newest":
        filteredItems.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        filteredItems.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "price_low":
        filteredItems.sort((a, b) => Number(a.license.price - b.license.price));
        break;
      case "price_high":
        filteredItems.sort((a, b) => Number(b.license.price - a.license.price));
        break;
      case "rating":
        filteredItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
      default:
        filteredItems.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
    }

    // Apply pagination
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalCount: filteredItems.length,
      hasNextPage: endIndex < filteredItems.length,
      nextCursor:
        endIndex < filteredItems.length ? endIndex.toString() : undefined,
    };
  }

  private async getMockMarketplaceData(
    params: MarketplaceQueryParams,
  ): Promise<MarketplaceResponse> {
    // Enhanced mock data as fallback
    const mockItems: IpNFTMetadata[] = [
      {
        tokenId: BigInt(1001),
        title: "High-Quality Portrait Dataset",
        description:
          "Professional portrait photos for AI training with diverse demographics",
        contentType: "image",
        creator: {
          address: "0x1234567890123456789012345678901234567890",
          socialProfiles: { twitter: "@ai_photographer" },
          verified: true,
        },
        license: {
          price: BigInt("150000000000000000"), // 0.15 ETH
          duration: 365 * 24 * 60 * 60, // 1 year
          royaltyBps: 500, // 5%
          paymentToken: "0x0000000000000000000000000000000000000000",
        },
        contentHash: "QmHash1001",
        uri: "ipfs://QmHash1001",
        createdAt: Date.now() - 86400000,
        tags: ["portraits", "photography", "faces", "diversity"],
        previewUrl: "/api/placeholder/400/300",
        samples: 15420,
        downloads: 89,
        rating: 4.8,
      },
      {
        tokenId: BigInt(1002),
        title: "Social Media Sentiment Dataset",
        description:
          "Curated social media posts with sentiment analysis labels from Twitter and Reddit",
        contentType: "text",
        creator: {
          address: "0x2345678901234567890123456789012345678901",
          socialProfiles: { twitter: "@nlp_researcher" },
          verified: true,
        },
        license: {
          price: BigInt("80000000000000000"), // 0.08 ETH
          duration: 180 * 24 * 60 * 60, // 6 months
          royaltyBps: 300, // 3%
          paymentToken: "0x0000000000000000000000000000000000000000",
        },
        contentHash: "QmHash1002",
        uri: "ipfs://QmHash1002",
        createdAt: Date.now() - 172800000,
        tags: ["social", "nlp", "sentiment", "twitter", "reddit"],
        previewUrl: "/api/placeholder/400/300",
        samples: 50000,
        downloads: 156,
        rating: 4.6,
      },
    ];

    // Apply filters and pagination using the helper method
    return this.applyFiltersAndPagination(mockItems, params);
  }
}
