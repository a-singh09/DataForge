"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useAuthState } from "@campnetwork/origin/react";

export interface LicenseStatus {
  hasAccess: boolean;
  expiryDate?: Date;
  isExpired: boolean;
  daysRemaining?: number;
}

export interface LicensePurchaseResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Hook for managing licensing operations including purchase, access verification, and renewals
 */
export function useLicensing() {
  const auth = useAuth();
  const { authenticated } = useAuthState();
  const [isLoading, setIsLoading] = useState(false);

  // Cache for access checks to prevent repeated API calls
  const [accessCache, setAccessCache] = useState<
    Map<string, { result: LicenseStatus; timestamp: number }>
  >(new Map());
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

  // Cleanup old cache entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setAccessCache((prev) => {
        const newCache = new Map();
        prev.forEach((value, key) => {
          if (now - value.timestamp < CACHE_DURATION) {
            newCache.set(key, value);
          }
        });
        return newCache;
      });
    };

    const interval = setInterval(cleanup, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [CACHE_DURATION]);

  /**
   * Purchase a license for a dataset using Origin SDK's buyAccessSmart method
   */
  const purchaseLicense = useCallback(
    async (
      tokenId: bigint,
      periods: number = 1,
    ): Promise<LicensePurchaseResult> => {
      if (!authenticated || !auth?.origin) {
        return {
          success: false,
          error: "Authentication required. Please connect your wallet.",
        };
      }

      setIsLoading(true);

      try {
        // Use Origin SDK's buyAccessSmart method for automated payment handling
        const result = await auth.origin.buyAccessSmart(tokenId, periods);

        // Extract transaction hash from result
        const transactionHash =
          typeof result === "string" ? result : result?.hash;

        setIsLoading(false);
        return {
          success: true,
          transactionHash,
        };
      } catch (error: any) {
        console.error("License purchase failed:", error);
        setIsLoading(false);

        // Parse common error messages
        let errorMessage = "Failed to purchase license. Please try again.";

        if (error.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to complete the purchase.";
        } else if (error.message?.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user.";
        } else if (error.message?.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [authenticated, auth?.origin],
  );

  /**
   * Check if user has access to a specific dataset
   * Uses subscriptionExpiry method directly since hasAccess has parameter issues
   */
  const checkAccess = useCallback(
    async (tokenId: bigint, userAddress?: string): Promise<LicenseStatus> => {
      if (!auth?.origin || !authenticated) {
        return {
          hasAccess: false,
          isExpired: true,
        };
      }

      if (!userAddress) {
        console.error("No wallet address provided for access check");
        return {
          hasAccess: false,
          isExpired: true,
        };
      }

      // Check cache first
      const cacheKey = `${tokenId.toString()}-${userAddress}`;
      const cached = accessCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        console.log(`Using cached access result for token ${tokenId}`);
        return cached.result;
      }

      try {
        console.log(
          `Checking access for token ${tokenId} and address ${userAddress}`,
        );

        // Skip hasAccess method due to parameter issues, use subscriptionExpiry directly
        console.log("Getting subscription expiry to determine access...");

        let expiryTimestamp: bigint | number = 0;
        try {
          expiryTimestamp = await auth.origin.subscriptionExpiry(
            tokenId,
            userAddress as `0x${string}`,
          );
          console.log("Expiry timestamp:", expiryTimestamp);
        } catch (error: any) {
          console.error("Failed to get subscription expiry:", error.message);
          // If the call fails, it likely means no subscription exists
          const result = {
            hasAccess: false,
            isExpired: true,
          };

          // Cache negative results for shorter duration
          setAccessCache((prev) =>
            new Map(prev).set(cacheKey, { result, timestamp: now }),
          );
          return result;
        }

        // Convert timestamp to date and check if it's valid and not expired
        const expiryTimestampNumber = Number(expiryTimestamp);
        console.log("Expiry timestamp as number:", expiryTimestampNumber);

        // If timestamp is 0 or very small, it means no subscription
        if (expiryTimestampNumber <= 0) {
          console.log("No valid subscription found (timestamp is 0)");
          const result = {
            hasAccess: false,
            isExpired: true,
          };

          // Cache negative results
          setAccessCache((prev) =>
            new Map(prev).set(cacheKey, { result, timestamp: now }),
          );
          return result;
        }

        const expiryDate = new Date(expiryTimestampNumber * 1000);
        const currentTime = new Date();
        const isExpired = expiryDate <= currentTime;

        console.log(`Expiry date: ${expiryDate}`);
        console.log(`Current date: ${currentTime}`);
        console.log(`Is expired: ${isExpired}`);

        const hasAccess = !isExpired;
        const daysRemaining = isExpired
          ? 0
          : Math.ceil(
              (expiryDate.getTime() - currentTime.getTime()) /
                (1000 * 60 * 60 * 24),
            );

        console.log(
          `Final access result: hasAccess=${hasAccess}, daysRemaining=${daysRemaining}`,
        );

        const result = {
          hasAccess,
          expiryDate,
          isExpired,
          daysRemaining,
        };

        // Cache the result
        setAccessCache((prev) =>
          new Map(prev).set(cacheKey, { result, timestamp: now }),
        );

        return result;
      } catch (error) {
        console.error("Access check failed:", error);
        const result = {
          hasAccess: false,
          isExpired: true,
        };

        // Cache error results for shorter duration
        setAccessCache((prev) =>
          new Map(prev).set(cacheKey, { result, timestamp: now }),
        );
        return result;
      }
    },
    [auth?.origin, authenticated, accessCache, CACHE_DURATION],
  );

  /**
   * Renew access to a dataset
   */
  const renewAccess = useCallback(
    async (
      tokenId: bigint,
      periods: number = 1,
    ): Promise<LicensePurchaseResult> => {
      if (!authenticated || !auth?.origin) {
        return {
          success: false,
          error: "Authentication required. Please connect your wallet.",
        };
      }

      setIsLoading(true);

      try {
        // Use Origin SDK's renewAccess method
        const result = await auth.origin.renewAccess(tokenId, periods);

        const transactionHash =
          typeof result === "string" ? result : result?.hash;

        setIsLoading(false);
        return {
          success: true,
          transactionHash,
        };
      } catch (error: any) {
        console.error("License renewal failed:", error);
        setIsLoading(false);

        let errorMessage = "Failed to renew license. Please try again.";

        if (error.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to renew the license.";
        } else if (error.message?.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [authenticated, auth?.origin],
  );

  /**
   * Get license terms for a dataset
   */
  const getLicenseTerms = useCallback(
    async (tokenId: bigint) => {
      if (!auth?.origin) {
        throw new Error("Origin SDK not available");
      }

      try {
        return await auth.origin.getTerms(tokenId);
      } catch (error) {
        console.error("Failed to get license terms:", error);
        throw error;
      }
    },
    [auth?.origin],
  );

  /**
   * Get content URL for a dataset (requires valid license)
   */
  const getContentUrl = useCallback(
    async (tokenId: bigint): Promise<string | null> => {
      if (!auth?.origin) {
        throw new Error("Origin SDK not available");
      }

      try {
        // Get the content hash from the blockchain
        const contentHash = await auth.origin.contentHash(tokenId);

        if (!contentHash) {
          return null;
        }

        // Convert IPFS hash to HTTP URL
        if (contentHash.startsWith("ipfs://")) {
          return contentHash.replace("ipfs://", "https://ipfs.io/ipfs/");
        } else if (
          contentHash.startsWith("Qm") ||
          contentHash.startsWith("bafy")
        ) {
          return `https://ipfs.io/ipfs/${contentHash}`;
        } else if (contentHash.startsWith("http")) {
          return contentHash;
        }

        return contentHash;
      } catch (error) {
        console.error("Failed to get content URL:", error);
        return null;
      }
    },
    [auth?.origin],
  );

  /**
   * Clear the access cache (useful after purchases/renewals)
   */
  const clearAccessCache = useCallback(() => {
    setAccessCache(new Map());
  }, []);

  return {
    // State
    isLoading,
    authenticated,

    // Methods
    purchaseLicense,
    checkAccess,
    renewAccess,
    getLicenseTerms,
    getContentUrl,
    clearAccessCache,
  };
}
