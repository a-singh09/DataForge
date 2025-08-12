"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatEther } from "viem";

interface ContentOwnershipProps {
  tokenId: bigint;
}

interface OwnershipData {
  owner: string;
  approved: string | null;
  balance: number;
  terms: {
    price: bigint;
    duration: number;
    royaltyBps: number;
    paymentToken: string;
  } | null;
  contentHash: string | null;
  tokenURI: string | null;
}

export default function ContentOwnership({ tokenId }: ContentOwnershipProps) {
  const { auth } = useAuth();
  const [ownershipData, setOwnershipData] = useState<OwnershipData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOwnershipData = async () => {
    if (!auth?.origin) {
      setError("Origin SDK not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching ownership data for token ${tokenId}`);

      const [owner, approved, terms, contentHash, tokenURI] = await Promise.all(
        [
          auth.origin.ownerOf(tokenId),
          auth.origin.getApproved(tokenId),
          auth.origin.getTerms(tokenId),
          auth.origin.contentHash(tokenId),
          auth.origin.tokenURI(tokenId),
        ],
      );

      // Get balance for the owner
      const balance = await auth.origin.balanceOf(owner);

      setOwnershipData({
        owner,
        approved:
          approved === "0x0000000000000000000000000000000000000000"
            ? null
            : approved,
        balance: Number(balance),
        terms,
        contentHash,
        tokenURI,
      });

      console.log(`Ownership data for token ${tokenId}:`, {
        owner,
        approved,
        balance: Number(balance),
        terms,
        contentHash,
        tokenURI,
      });
    } catch (err: any) {
      console.error(
        `Failed to fetch ownership data for token ${tokenId}:`,
        err,
      );
      setError(err.message || "Failed to fetch ownership data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnershipData();
  }, [tokenId, auth?.origin]);

  if (isLoading) {
    return (
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            Content Ownership
            <RefreshCw className="h-4 w-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Content Ownership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Button onClick={fetchOwnershipData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!ownershipData) {
    return null;
  }

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            Content Ownership
          </CardTitle>
          <Button onClick={fetchOwnershipData} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner Information */}
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Owner</span>
            <Badge variant="outline">Verified</Badge>
          </div>
          <p className="font-mono text-sm text-white">
            {ownershipData.owner.slice(0, 6)}...{ownershipData.owner.slice(-4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Balance: {ownershipData.balance} IpNFTs
          </p>
        </div>

        {/* License Terms */}
        {ownershipData.terms && (
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">
              License Terms
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Price:</span>
                <p className="text-green-400 font-medium">
                  {Number(formatEther(ownershipData.terms.price)).toFixed(4)}{" "}
                  ETH
                </p>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <p className="text-white">
                  {ownershipData.terms.duration === 0
                    ? "Lifetime"
                    : `${Math.floor(ownershipData.terms.duration / (24 * 60 * 60))} days`}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Royalty:</span>
                <p className="text-white">
                  {ownershipData.terms.royaltyBps / 100}%
                </p>
              </div>
              <div>
                <span className="text-gray-400">Token:</span>
                <p className="text-white">
                  {ownershipData.terms.paymentToken ===
                  "0x0000000000000000000000000000000000000000"
                    ? "ETH"
                    : "ERC20"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approved Address */}
        {ownershipData.approved && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-yellow-400">Approved Address</span>
              <Badge
                variant="outline"
                className="text-yellow-400 border-yellow-400/30"
              >
                Active
              </Badge>
            </div>
            <p className="font-mono text-sm text-white">
              {ownershipData.approved.slice(0, 6)}...
              {ownershipData.approved.slice(-4)}
            </p>
          </div>
        )}

        {/* Content Hash */}
        {ownershipData.contentHash && (
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Content Hash</span>
              {ownershipData.tokenURI && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={
                      ownershipData.tokenURI.startsWith("ipfs://")
                        ? ownershipData.tokenURI.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/",
                          )
                        : ownershipData.tokenURI
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
            <p className="font-mono text-xs text-white break-all">
              {ownershipData.contentHash}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
