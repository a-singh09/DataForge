"use client";

import {
  Calendar,
  Hash,
  FileText,
  Database,
  Shield,
  Star,
  Download,
  Eye,
  Clock,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IpNFTMetadata } from "@/types/marketplace";

interface DatasetMetadataProps {
  dataset: IpNFTMetadata;
}

export default function DatasetMetadata({ dataset }: DatasetMetadataProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    }
    const hours = Math.floor(seconds / (60 * 60));
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  const formatPrice = (price: bigint) => {
    return `${(Number(price) / 1e18).toFixed(6)} ETH`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "audio":
        return "🎵";
      case "text":
        return "📝";
      case "code":
        return "💻";
      case "social":
        return "📱";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Token ID</span>
                <span className="text-white font-mono">
                  #{dataset.tokenId.toString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Content Type</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getContentTypeIcon(dataset.contentType)}
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {dataset.contentType}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Created</span>
                <span className="text-white text-sm">
                  {formatDate(dataset.createdAt)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Samples</span>
                <span className="text-white font-semibold">
                  {dataset.samples?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Downloads</span>
                <span className="text-white">
                  {dataset.downloads?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white">
                    {dataset.rating?.toFixed(1) || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License Terms */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            License Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Price</span>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {formatPrice(dataset.license.price)}
                  </div>
                  <div className="text-xs text-gray-500">per license</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Duration</span>
                <span className="text-white">
                  {formatDuration(dataset.license.duration)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Royalty</span>
                <span className="text-white">
                  {dataset.license.royaltyBps / 100}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Payment Token</span>
                <span className="text-white font-mono text-sm">
                  {dataset.license.paymentToken ===
                  "0x0000000000000000000000000000000000000000"
                    ? "ETH"
                    : formatAddress(dataset.license.paymentToken)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creator Information */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Creator Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Wallet Address</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm">
                {formatAddress(dataset.creator.address)}
              </span>
              {dataset.creator.verified && (
                <Shield className="h-4 w-4 text-blue-400" />
              )}
            </div>
          </div>

          {/* Social Profiles */}
          {Object.keys(dataset.creator.socialProfiles).length > 0 && (
            <>
              <Separator className="bg-gray-700" />
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">
                  Social Profiles
                </div>
                <div className="space-y-2">
                  {dataset.creator.socialProfiles.twitter && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Twitter</span>
                      <span className="text-blue-400">
                        @{dataset.creator.socialProfiles.twitter}
                      </span>
                    </div>
                  )}
                  {dataset.creator.socialProfiles.spotify && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Spotify</span>
                      <span className="text-green-400">Connected</span>
                    </div>
                  )}
                  {dataset.creator.socialProfiles.tiktok && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">TikTok</span>
                      <span className="text-pink-400">
                        @{dataset.creator.socialProfiles.tiktok}
                      </span>
                    </div>
                  )}
                  {dataset.creator.socialProfiles.telegram && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Telegram</span>
                      <span className="text-blue-300">Connected</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Technical Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Content Hash</span>
              <span className="text-white font-mono text-xs">
                {dataset.contentHash.slice(0, 10)}...
                {dataset.contentHash.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Metadata URI</span>
              <span className="text-white font-mono text-xs">
                {dataset.uri.slice(0, 20)}...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {dataset.tags.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dataset.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-gray-300 border-gray-600 hover:bg-gray-700 transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
