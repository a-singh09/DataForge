"use client";

import { useState } from "react";
import { formatEther } from "viem";
import {
  Loader2,
  RefreshCw,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IpNFTMetadata } from "@/types/marketplace";
import { useLicensing } from "@/hooks/useLicensing";

interface LicenseRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: IpNFTMetadata;
  currentExpiryDate?: Date;
  onSuccess?: (
    tokenId: bigint,
    transactionHash: string,
    periods: number,
  ) => void;
  onError?: (error: Error) => void;
}

export default function LicenseRenewalModal({
  isOpen,
  onClose,
  dataset,
  currentExpiryDate,
  onSuccess,
  onError,
}: LicenseRenewalModalProps) {
  const { renewAccess, isLoading } = useLicensing();
  const [periods, setPeriods] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = dataset.license.price * BigInt(periods);
  const formattedPrice = formatEther(totalPrice);
  const durationDays = Math.floor(dataset.license.duration / (24 * 60 * 60));
  const totalDurationDays = durationDays * periods;

  // Calculate new expiry date
  const newExpiryDate = currentExpiryDate
    ? new Date(
        currentExpiryDate.getTime() + dataset.license.duration * periods * 1000,
      )
    : new Date(Date.now() + dataset.license.duration * periods * 1000);

  const handleRenewal = async () => {
    if (periods < 1) {
      setError("Please select at least 1 renewal period.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await renewAccess(dataset.tokenId, periods);

      if (result.success) {
        const txHash = result.transactionHash || "unknown";
        setTransactionHash(txHash);

        // Call success callback
        onSuccess?.(dataset.tokenId, txHash, periods);

        // Close modal after a brief delay to show success state
        setTimeout(() => {
          onClose();
          setTransactionHash(null);
          setIsProcessing(false);
          setPeriods(1);
        }, 2000);
      } else {
        setError(result.error || "Failed to renew license. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("License renewal failed:", err);
      const errorMessage =
        err.message || "Failed to renew license. Please try again.";
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
      setPeriods(1);
    }
  };

  const handlePeriodsChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
      setPeriods(numValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-400" />
            Renew License
          </DialogTitle>
          <DialogDescription>
            Extend your access to this dataset
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dataset Info */}
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h3 className="font-semibold text-white mb-2">{dataset.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{dataset.contentType}</Badge>
            </div>

            {/* Current Expiry */}
            {currentExpiryDate && (
              <div className="text-sm text-gray-400">
                Current expiry: {currentExpiryDate.toLocaleDateString()}
              </div>
            )}
          </div>

          <Separator />

          {/* Renewal Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="periods" className="text-sm text-gray-300">
                Renewal Periods
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="periods"
                  type="number"
                  min="1"
                  max="12"
                  value={periods}
                  onChange={(e) => handlePeriodsChange(e.target.value)}
                  className="w-20"
                  disabled={isProcessing}
                />
                <span className="text-sm text-gray-400">
                  × {durationDays} days each
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Maximum 12 periods at once
              </p>
            </div>

            {/* Pricing Details */}
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
                  Total extension
                </span>
                <span className="font-semibold text-white">
                  {totalDurationDays} days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">New expiry date</span>
                <span className="font-semibold text-green-400">
                  {newExpiryDate.toLocaleDateString()}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-white">Total Cost</span>
                <span className="font-bold text-orange-400">
                  {formattedPrice} ETH
                </span>
              </div>
            </div>
          </div>

          {/* Warning for expired licenses */}
          {currentExpiryDate && currentExpiryDate <= new Date() && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-400">
                Your license has expired. Renewing will restore access
                immediately.
              </AlertDescription>
            </Alert>
          )}

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
                License renewed successfully! Transaction:{" "}
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
              onClick={handleRenewal}
              disabled={isProcessing || !!transactionHash || periods < 1}
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
                `Renew for ${formattedPrice} ETH`
              )}
            </Button>
          </div>

          {/* Terms Notice */}
          <p className="text-xs text-gray-500 text-center">
            Renewal extends your current license terms and conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
