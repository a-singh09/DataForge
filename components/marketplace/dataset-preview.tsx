"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  FileText,
  Code,
  Image as ImageIcon,
  Music,
  Video,
  Hash,
  Eye,
  EyeOff,
  Download,
  Shield,
  Star,
  Calendar,
  Tag,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IpNFTMetadata } from "@/types/marketplace";
import {
  ImagePreview,
  VideoPreview,
  AudioPreview,
  TextPreview,
  CodePreview,
  SocialPreview,
  GenericPreview,
} from "./content-previews";
import DatasetMetadata from "./dataset-metadata";
import SampleContentDisplay from "./sample-content-display";
import DatasetAccess from "./dataset-access";
import LicenseRenewalModal from "./license-renewal-modal";
import { useLicensing } from "@/hooks/useLicensing";
import { useAuthState } from "@campnetwork/origin/react";
import { toast } from "@/hooks/use-toast";

interface DatasetPreviewProps {
  dataset: IpNFTMetadata;
  onLicense?: () => void;
  onClose?: () => void;
}

const typeIcons = {
  image: ImageIcon,
  text: FileText,
  audio: Music,
  video: Video,
  code: Code,
  social: Hash,
};

const typeColors = {
  image: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  text: "bg-green-500/20 text-green-400 border-green-500/30",
  audio: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  video: "bg-red-500/20 text-red-400 border-red-500/30",
  code: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  social: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function DatasetPreview({
  dataset,
  onLicense,
  onClose,
}: DatasetPreviewProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const { authenticated } = useAuthState();
  const { checkAccess } = useLicensing();

  const TypeIcon = typeIcons[dataset.contentType];
  const formatPrice = (price: bigint) => {
    return `${(Number(price) / 1e18).toFixed(3)} ETH`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const handleRenewalSuccess = (
    tokenId: bigint,
    transactionHash: string,
    periods: number,
  ) => {
    toast({
      title: "License Renewed Successfully!",
      description: `Extended access for ${periods} period${periods > 1 ? "s" : ""}. Transaction: ${transactionHash.slice(0, 10)}...`,
    });
    setShowRenewalModal(false);
  };

  const handleRenewalError = (error: Error) => {
    toast({
      title: "License Renewal Failed",
      description: error.message,
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-800">
            <TypeIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{dataset.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={typeColors[dataset.contentType]}>
                {dataset.contentType}
              </Badge>
              {dataset.creator.verified && (
                <Shield className="h-4 w-4 text-blue-400" />
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-400">
            {formatPrice(dataset.license.price)}
          </div>
          <div className="text-sm text-gray-400">per license</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Preview */}
        <div className="lg:col-span-2 space-y-6">
          <ContentPreview
            dataset={dataset}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />

          {/* Description */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-gray-300 ${!showFullDescription ? "line-clamp-3" : ""}`}
              >
                {dataset.description}
              </p>
              {dataset.description.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 p-0 h-auto text-orange-400 hover:text-orange-300"
                >
                  {showFullDescription ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show more
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Sample Content Display */}
          <SampleContentDisplay dataset={dataset} />

          {/* Tags */}
          {dataset.tags.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dataset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creator Profile */}
          <CreatorProfile creator={dataset.creator} />

          {/* Access Control - Show if authenticated */}
          {authenticated && (
            <DatasetAccess
              dataset={dataset}
              onRenewLicense={() => setShowRenewalModal(true)}
            />
          )}

          {/* License Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">License Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price</span>
                <span className="text-white font-semibold">
                  {formatPrice(dataset.license.price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">
                  {formatDuration(dataset.license.duration)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Royalty</span>
                <span className="text-white">
                  {dataset.license.royaltyBps / 100}%
                </span>
              </div>
              {/* <Separator className="bg-gray-700" />
              <Button
                onClick={onLicense}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                License Dataset
              </Button> */}
            </CardContent>
          </Card>

          {/* Dataset Stats */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">Dataset Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Samples</span>
                <span className="text-white font-semibold">
                  {dataset.samples?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Downloads</span>
                <span className="text-white">
                  {dataset.downloads?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white">
                    {dataset.rating?.toFixed(1) || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Created</span>
                <span className="text-white">
                  {formatDate(dataset.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width metadata section */}
      <div className="mt-8">
        <DatasetMetadata dataset={dataset} />
      </div>

      {/* License Renewal Modal */}
      <LicenseRenewalModal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        dataset={dataset}
        onSuccess={handleRenewalSuccess}
        onError={handleRenewalError}
      />
    </div>
  );
}

// Content Preview Component
function ContentPreview({
  dataset,
  isPlaying,
  setIsPlaying,
}: {
  dataset: IpNFTMetadata;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}) {
  const renderPreview = () => {
    switch (dataset.contentType) {
      case "image":
        return <ImagePreview dataset={dataset} />;
      case "video":
        return (
          <VideoPreview
            dataset={dataset}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        );
      case "audio":
        return (
          <AudioPreview
            dataset={dataset}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        );
      case "text":
        return <TextPreview dataset={dataset} />;
      case "code":
        return <CodePreview dataset={dataset} />;
      case "social":
        return <SocialPreview dataset={dataset} />;
      default:
        return <GenericPreview dataset={dataset} />;
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Content Preview
        </CardTitle>
      </CardHeader>
      <CardContent>{renderPreview()}</CardContent>
    </Card>
  );
}

// Creator Profile Component
function CreatorProfile({ creator }: { creator: IpNFTMetadata["creator"] }) {
  const getInitials = (address: string) => {
    return `${address.slice(2, 4).toUpperCase()}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gray-700 text-white">
              {getInitials(creator.address)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                {formatAddress(creator.address)}
              </span>
              {creator.verified && <Shield className="h-4 w-4 text-blue-400" />}
            </div>
            <div className="text-sm text-gray-400">Creator</div>
          </div>
        </div>

        {/* Social Links */}
        {Object.keys(creator.socialProfiles).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-300">
              Social Profiles
            </div>
            <div className="space-y-1">
              {creator.socialProfiles.twitter && (
                <a
                  href={`https://twitter.com/${creator.socialProfiles.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />@
                  {creator.socialProfiles.twitter}
                </a>
              )}
              {creator.socialProfiles.spotify && (
                <a
                  href={`https://open.spotify.com/user/${creator.socialProfiles.spotify}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Spotify Profile
                </a>
              )}
              {creator.socialProfiles.tiktok && (
                <a
                  href={`https://tiktok.com/@${creator.socialProfiles.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />@
                  {creator.socialProfiles.tiktok}
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
