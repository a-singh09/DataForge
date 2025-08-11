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
  const auth = useAuth();
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

      try {
        if (!userAddress) {
          console.error("No wallet address provided for access check");
          return {
            hasAccess: false,
            isExpired: true,
          };
        }

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
          return {
            hasAccess: false,
            isExpired: true,
          };
        }

        // Convert timestamp to date and check if it's valid and not expired
        const expiryTimestampNumber = Number(expiryTimestamp);
        console.log("Expiry timestamp as number:", expiryTimestampNumber);

        // If timestamp is 0 or very small, it means no subscription
        if (expiryTimestampNumber <= 0) {
          console.log("No valid subscription found (timestamp is 0)");
          return {
            hasAccess: false,
            isExpired: true,
          };
        }

        const expiryDate = new Date(expiryTimestampNumber * 1000);
        const now = new Date();
        const isExpired = expiryDate <= now;

        console.log(`Expiry date: ${expiryDate}`);
        console.log(`Current date: ${now}`);
        console.log(`Is expired: ${isExpired}`);

        const hasAccess = !isExpired;
        const daysRemaining = isExpired
          ? 0
          : Math.ceil(
              (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            );

        console.log(
          `Final access result: hasAccess=${hasAccess}, daysRemaining=${daysRemaining}`,
        );

        return {
          hasAccess,
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
    [auth?.origin, authenticated],
  );

  /**
   * Renew access to a dataset
   */
  const renewAccess = useCallback(
    async (
      tokenId: bigint,
      periods: number = 1,
      userAddress?: string,
    ): Promise<LicensePurchaseResult> => {
      if (!authenticated || !auth?.origin) {
        return {
          success: false,
          error: "Authentication required. Please connect your wallet.",
        };
      }

      if (!userAddress) {
        return {
          success: false,
          error: "User address required for renewal.",
        };
      }

      setIsLoading(true);

      try {
        // Use Origin SDK's renewAccess method
        const result = await auth.origin.renewAccess(
          tokenId,
          userAddress as `0x${string}`,
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
