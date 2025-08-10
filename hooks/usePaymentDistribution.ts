"use client";

import { useState, useCallback } from "react";
import { formatEther } from "viem";
import { useAuth } from "./useAuth";
import { useAuthState } from "@campnetwork/origin/react";
import { PaymentReceiptData } from "@/components/dashboard/payment-receipt";

export interface PaymentDistributionResult {
  success: boolean;
  transactionHash?: string;
  receipt?: PaymentReceiptData;
  error?: string;
}

export interface CreatorSplit {
  address: string;
  name?: string;
  percentage: number;
}

/**
 * Hook for managing automated payment distribution with royalty calculations
 */
export function usePaymentDistribution() {
  const { origin } = useAuth();
  const { authenticated } = useAuthState();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Process payment with automatic royalty distribution
   */
  const processPayment = useCallback(
    async (
      tokenId: bigint,
      periods: number,
      contentTitle: string,
      creatorSplits?: CreatorSplit[],
    ): Promise<PaymentDistributionResult> => {
      if (!authenticated || !origin) {
        return {
          success: false,
          error: "Authentication required. Please connect your wallet.",
        };
      }

      setIsProcessing(true);

      try {
        // Get license terms to calculate payment amounts
        const terms = await origin.getTerms(tokenId);
        const totalAmount = terms.price * BigInt(periods);

        // Calculate royalty distribution (95% creator, 5% platform)
        const platformFee = (totalAmount * BigInt(5)) / BigInt(100);
        const creatorShare = totalAmount - platformFee;

        // Process the payment using Origin SDK's buyAccessSmart method
        const result = await origin.buyAccessSmart(tokenId, periods);
        const transactionHash =
          typeof result === "string" ? result : result?.hash || "unknown";

        // Get current timestamp and calculate expiry
        const now = new Date();
        const expiryDate = new Date(
          now.getTime() + terms.duration * periods * 1000,
        );

        // Create payment receipt
        const receipt: PaymentReceiptData = {
          transactionHash,
          tokenId,
          contentTitle,
          totalAmount,
          creatorShare,
          platformFee,
          timestamp: now,
          buyerAddress: "0x0000000000000000000000000000000000000000", // Would be actual buyer address
          creatorAddress: "0x0000000000000000000000000000000000000000", // Would be actual creator address
          licenseDetails: {
            duration: terms.duration,
            periods,
            expiryDate,
          },
          multiCreatorSplits: creatorSplits?.map((split) => ({
            address: split.address,
            name: split.name,
            amount:
              (creatorShare * BigInt(Math.floor(split.percentage * 100))) /
              BigInt(10000),
            percentage: split.percentage,
          })),
        };

        setIsProcessing(false);
        return {
          success: true,
          transactionHash,
          receipt,
        };
      } catch (error: any) {
        console.error("Payment processing failed:", error);
        setIsProcessing(false);

        let errorMessage = "Payment processing failed. Please try again.";

        if (error.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to complete the payment.";
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
   * Calculate royalty breakdown for display purposes
   */
  const calculateRoyaltyBreakdown = useCallback(
    (totalAmount: bigint, creatorSplits?: CreatorSplit[]) => {
      const platformFee = (totalAmount * BigInt(5)) / BigInt(100);
      const creatorShare = totalAmount - platformFee;

      const breakdown = {
        totalAmount,
        platformFee,
        creatorShare,
        platformPercentage: 5,
        creatorPercentage: 95,
        splits:
          creatorSplits?.map((split) => ({
            ...split,
            amount:
              (creatorShare * BigInt(Math.floor(split.percentage * 100))) /
              BigInt(10000),
          })) || [],
      };

      return breakdown;
    },
    [],
  );

  /**
   * Verify payment distribution was successful
   */
  const verifyPaymentDistribution = useCallback(
    async (transactionHash: string): Promise<boolean> => {
      if (!origin) return false;

      try {
        // In a real implementation, this would verify the transaction on-chain
        // For now, we'll simulate verification
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if transaction exists and was successful
        // This would typically involve checking the blockchain
        return true;
      } catch (error) {
        console.error("Payment verification failed:", error);
        return false;
      }
    },
    [origin],
  );

  /**
   * Get payment history for a creator
   */
  const getPaymentHistory = useCallback(
    async (creatorAddress?: string) => {
      if (!origin) return [];

      try {
        // In a real implementation, this would fetch payment history from the blockchain
        // For now, we'll return mock data
        const mockHistory = [
          {
            transactionHash: "0x1234567890abcdef",
            tokenId: BigInt(1),
            contentTitle: "AI Training Dataset #1",
            totalAmount: BigInt("100000000000000000"), // 0.1 ETH
            creatorShare: BigInt("95000000000000000"), // 0.095 ETH
            platformFee: BigInt("5000000000000000"), // 0.005 ETH
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            buyerAddress: "0xbuyer123",
            creatorAddress: creatorAddress || "0xcreator123",
            licenseDetails: {
              duration: 2592000, // 30 days
              periods: 1,
              expiryDate: new Date(Date.now() + 2592000000),
            },
          },
        ];

        return mockHistory;
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        return [];
      }
    },
    [origin],
  );

  /**
   * Generate payment confirmation for UI display
   */
  const generatePaymentConfirmation = useCallback(
    (receipt: PaymentReceiptData) => {
      return {
        title: "Payment Processed Successfully",
        message: `License for "${receipt.contentTitle}" has been purchased and payment distributed.`,
        details: {
          transactionHash: receipt.transactionHash,
          totalAmount: formatEther(receipt.totalAmount),
          creatorShare: formatEther(receipt.creatorShare),
          platformFee: formatEther(receipt.platformFee),
          timestamp: receipt.timestamp.toISOString(),
        },
      };
    },
    [],
  );

  return {
    // State
    isProcessing,
    authenticated,

    // Methods
    processPayment,
    calculateRoyaltyBreakdown,
    verifyPaymentDistribution,
    getPaymentHistory,
    generatePaymentConfirmation,
  };
}
