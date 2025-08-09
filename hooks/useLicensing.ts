"use client";

import { useState, useCallback } from "react";
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
  const { origin } = useAuth();
  const { authenticated } = useAuthState();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Purchase a license for a dataset using Origin SDK's buyAccessSmart method
   */
  const purchaseLicense = useCallback(
    async (
      tokenId: bigint,
      periods: number = 1,
    ): Promise<LicensePurchaseResult> => {
      if (!authenticated || !origin) {
        return {
          success: false,
          error: "Authentication required. Please connect your wallet.",
        };
      }

      setIsLoading(true);

      try {
        // Use Origin SDK's buyAccessSmart method for automated payment handling
        const result = await origin.buyAccessSmart(tokenId, periods);

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
    [authenticated, origin],
  );

  /**
   * Check if user has access to a specific dataset
   */
  const checkAccess = useCallback(
    async (tokenId: bigint, userAddress?: string): Promise<LicenseStatus> => {
      if (!origin || !authenticated) {
        return {
          hasAccess: false,
          isExpired: true,
        };
      }

      try {
        // For now, we'll use a placeholder address since walletAddress isn't available
        // In a real implementation, this would come from the auth context
        const address =
          userAddress || "0x0000000000000000000000000000000000000000";

        // Check access using Origin SDK
        const hasAccess = await origin.hasAccess(
          tokenId,
          address as `0x${string}`,
        );

        if (!hasAccess) {
          return {
            hasAccess: false,
            isExpired: true,
          };
        }

        // Get subscription expiry
        const expiryTimestamp = await origin.subscriptionExpiry(
          tokenId,
          address,
        );
        const expiryDate = new Date(Number(expiryTimestamp) * 1000);
        const now = new Date();
        const isExpired = expiryDate <= now;

        const daysRemaining = isExpired
          ? 0
          : Math.ceil(
              (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            );

        return {
          hasAccess: !isExpired,
          expiryDate,
          isExpired,
          daysRemaining,
        };
      } catch (error) {
        console.error("Access check failed:", error);
        return {
          hasAccess: false,
          isExpired: true,
        };
      }
    },
    [origin],
  );

  /**
   * Renew access to a dataset
   */
  const renewAccess = useCallback(
    async (
      tokenId: bigint,
      periods: number = 1,
    ): Promise<LicensePurchaseResult> => {
      if (!authenticated || !origin) {
        return {
          success: false,
          error: "Authentication required. Please connect your wallet.",
        };
      }

      setIsLoading(true);

      try {
        // Use Origin SDK's renewAccess method
        // Note: The actual method signature may require additional parameters
        const result = await origin.renewAccess(
          tokenId,
          "0x0000000000000000000000000000000000000000" as `0x${string}`,
          periods,
        );

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
    [authenticated, origin],
  );

  /**
   * Get license terms for a dataset
   */
  const getLicenseTerms = useCallback(
    async (tokenId: bigint) => {
      if (!origin) {
        throw new Error("Origin SDK not available");
      }

      try {
        return await origin.getTerms(tokenId);
      } catch (error) {
        console.error("Failed to get license terms:", error);
        throw error;
      }
    },
    [origin],
  );

  return {
    // State
    isLoading,
    authenticated,

    // Methods
    purchaseLicense,
    checkAccess,
    renewAccess,
    getLicenseTerms,
  };
}
