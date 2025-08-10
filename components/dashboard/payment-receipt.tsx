"use client";

import { useState } from "react";
import { formatEther } from "viem";
import {
  Receipt,
  Download,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  Hash,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export interface PaymentReceiptData {
  transactionHash: string;
  tokenId: bigint;
  contentTitle: string;
  totalAmount: bigint;
  creatorShare: bigint;
  platformFee: bigint;
  timestamp: Date;
  buyerAddress: string;
  creatorAddress: string;
  licenseDetails: {
    duration: number;
    periods: number;
    expiryDate: Date;
  };
  multiCreatorSplits?: {
    address: string;
    name?: string;
    amount: bigint;
    percentage: number;
  }[];
}

interface PaymentReceiptProps {
  receipt: PaymentReceiptData;
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export default function PaymentReceipt({
  receipt,
  isOpen,
  onClose,
  trigger,
}: PaymentReceiptProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadReceipt = () => {
    const receiptData = {
      transactionHash: receipt.transactionHash,
      tokenId: receipt.tokenId.toString(),
      contentTitle: receipt.contentTitle,
      totalAmount: formatEther(receipt.totalAmount),
      creatorShare: formatEther(receipt.creatorShare),
      platformFee: formatEther(receipt.platformFee),
      timestamp: receipt.timestamp.toISOString(),
      buyerAddress: receipt.buyerAddress,
      creatorAddress: receipt.creatorAddress,
      licenseDetails: {
        ...receipt.licenseDetails,
        expiryDate: receipt.licenseDetails.expiryDate.toISOString(),
      },
      multiCreatorSplits: receipt.multiCreatorSplits?.map((split) => ({
        ...split,
        amount: formatEther(split.amount),
      })),
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receipt.transactionHash.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt downloaded",
      description: "Payment receipt saved to your device",
    });
  };

  const shareReceipt = async () => {
    const shareData = {
      title: "CreatorVault Payment Receipt",
      text: `Payment receipt for ${receipt.contentTitle}`,
      url: `https://basescan.org/tx/${receipt.transactionHash}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(shareData.url, "Transaction URL");
      }
    } else {
      copyToClipboard(shareData.url, "Transaction URL");
    }
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days >= 365) {
      return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""}`;
    }
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  const ReceiptContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Payment Confirmed
        </h2>
        <p className="text-gray-400">
          License purchased successfully on{" "}
          {receipt.timestamp.toLocaleDateString()}
        </p>
      </div>

      {/* Transaction Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Transaction Details
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400">Transaction Hash</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm">
                {receipt.transactionHash.slice(0, 10)}...
                {receipt.transactionHash.slice(-8)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  copyToClipboard(receipt.transactionHash, "Transaction Hash")
                }
              >
                {copied === "Transaction Hash" ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  window.open(
                    `https://basescan.org/tx/${receipt.transactionHash}`,
                    "_blank",
                  )
                }
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400">Content</span>
            <span className="text-white font-medium">
              {receipt.contentTitle}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400">Token ID</span>
            <span className="text-white font-mono">
              #{receipt.tokenId.toString()}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Breakdown */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Payment Breakdown
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400">Total Payment</span>
            <span className="text-xl font-bold text-white">
              {formatEther(receipt.totalAmount)} ETH
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-400">Creator Share (95%)</span>
            </div>
            <span className="text-lg font-bold text-green-400">
              {formatEther(receipt.creatorShare)} ETH
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-orange-400">Platform Fee (5%)</span>
            </div>
            <span className="text-lg font-bold text-orange-400">
              {formatEther(receipt.platformFee)} ETH
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Creator Splits */}
      {receipt.multiCreatorSplits && receipt.multiCreatorSplits.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4" />
              Creator Distribution
            </h3>

            <div className="space-y-2">
              {receipt.multiCreatorSplits.map((split, index) => (
                <div
                  key={split.address}
                  className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {split.name
                        ? split.name.charAt(0).toUpperCase()
                        : index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {split.name || `Creator ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {split.address.slice(0, 6)}...{split.address.slice(-4)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-purple-400 border-purple-400"
                    >
                      {split.percentage}%
                    </Badge>
                  </div>
                  <span className="text-lg font-bold text-purple-400">
                    {formatEther(split.amount)} ETH
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* License Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          License Details
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400">Duration</span>
            <span className="text-white">
              {formatDuration(receipt.licenseDetails.duration)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400">Periods Purchased</span>
            <span className="text-white">{receipt.licenseDetails.periods}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400">Expires On</span>
            <span className="text-white">
              {receipt.licenseDetails.expiryDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={downloadReceipt} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" onClick={shareReceipt} className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-700">
        <p>This receipt is generated automatically by CreatorVault</p>
        <p>All transactions are recorded on the BaseCAMP blockchain</p>
      </div>
    </div>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-400" />
              Payment Receipt
            </DialogTitle>
            <DialogDescription>
              Detailed receipt for your license purchase
            </DialogDescription>
          </DialogHeader>
          <ReceiptContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-green-400" />
          Payment Receipt
        </CardTitle>
        <CardDescription>
          Detailed receipt for your license purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReceiptContent />
      </CardContent>
    </Card>
  );
}
