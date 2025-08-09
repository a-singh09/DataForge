"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { Loader2, Shield, Clock, DollarSign, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IpNFTMetadata } from "@/types/marketplace";
import { useAuth } from "@/hooks/useAuth";

interface LicensePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: IpNFTMetadata;
  periods?: number;
  onSuccess?: (tokenId: bigint, transactionHash: string) => void;
  onError?: (error: Error) => void;
}

export default function LicensePurchaseModal({
  isOpen,
  onClose,
  dataset,
  periods = 1,
  onSuccess,
  onError,
}: LicensePurchaseModalProps) {
  const { origin } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = dataset.license.price * BigInt(periods);
  const formattedPrice = formatEther(totalPrice);
  const durationDays = Math.floor(dataset.license.duration / (24 * 60 * 60));

  const handlePurchase = async () => {
    if (!origin) {
      setError("Authentication required. Please connect your wallet.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Use Origin SDK's buyAccessSmart method
      const result = await origin.buyAccessSmart(dataset.tokenId, periods);

      // The result should contain transaction information
      const txHash =
        typeof result === "string" ? result : result?.hash || "unknown";
      setTransactionHash(txHash);

      // Call success callback
      onSuccess?.(dataset.tokenId, txHash);

      // Close modal after a brief delay to show success state
      setTimeout(() => {
        onClose();
        setTransactionHash(null);
        setIsProcessing(false);
      }, 2000);
    } catch (err: any) {
      console.error("License purchase failed:", err);
      const errorMessage =
        err.message || "Failed to purchase license. Please try again.";
      setError(errorMessage);
      onError?.(err);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setError(null);
      setTransactionHash(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            License Purchase
          </DialogTitle>
          <DialogDescription>
            Purchase a license to access and download this dataset
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dataset Info */}
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h3 className="font-semibold text-white mb-2">{dataset.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{dataset.contentType}</Badge>
              {dataset.creator.verified && (
                <Shield className="h-4 w-4 text-blue-400" />
              )}
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">
              {dataset.description}
            </p>
          </div>

          <Separator />

          {/* License Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <DollarSign className="h-4 w-4" />
                Price per period
              </span>
              <span className="font-semibold text-white">
                {formatEther(dataset.license.price)} ETH
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                Duration per period
              </span>
              <span className="font-semibold text-white">
                {durationDays} days
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <Download className="h-4 w-4" />
                Periods
              </span>
              <span className="font-semibold text-white">{periods}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-white">Total Cost</span>
              <span className="font-bold text-orange-400">
                {formattedPrice} ETH
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {transactionHash && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <AlertDescription className="text-green-400">
                License purchased successfully! Transaction:{" "}
                {transactionHash.slice(0, 10)}...
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing || !!transactionHash}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : transactionHash ? (
                "Success!"
              ) : (
                "Purchase License"
              )}
            </Button>
          </div>

          {/* Terms Notice */}
          <p className="text-xs text-gray-500 text-center">
            By purchasing this license, you agree to the dataset's terms of use
            and licensing conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
