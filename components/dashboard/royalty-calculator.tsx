"use client";

import { useState, useEffect } from "react";
import { formatEther, parseEther } from "viem";
import { Calculator, DollarSign, Users, Percent, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoyaltyBreakdown {
  totalRevenue: bigint;
  creatorShare: bigint;
  platformFee: bigint;
  creatorPercentage: number;
  platformPercentage: number;
}

interface MultiCreatorSplit {
  address: string;
  name?: string;
  percentage: number;
  amount: bigint;
}

interface RoyaltyCalculatorProps {
  totalRevenue: bigint;
  multiCreatorSplits?: MultiCreatorSplit[];
  className?: string;
}

export default function RoyaltyCalculator({
  totalRevenue,
  multiCreatorSplits = [],
  className = "",
}: RoyaltyCalculatorProps) {
  const [breakdown, setBreakdown] = useState<RoyaltyBreakdown | null>(null);

  useEffect(() => {
    calculateRoyalties();
  }, [totalRevenue]);

  const calculateRoyalties = () => {
    // Platform takes 5%, creators get 95%
    const platformPercentage = 5;
    const creatorPercentage = 95;

    const platformFee =
      (totalRevenue * BigInt(platformPercentage)) / BigInt(100);
    const creatorShare = totalRevenue - platformFee;

    setBreakdown({
      totalRevenue,
      creatorShare,
      platformFee,
      creatorPercentage,
      platformPercentage,
    });
  };

  const calculateMultiCreatorSplits = (): MultiCreatorSplit[] => {
    if (!breakdown || multiCreatorSplits.length === 0) return [];

    return multiCreatorSplits.map((split) => ({
      ...split,
      amount:
        (breakdown.creatorShare * BigInt(Math.floor(split.percentage * 100))) /
        BigInt(10000),
    }));
  };

  const splits = calculateMultiCreatorSplits();
  const hasMultipleCreators = splits.length > 1;

  if (!breakdown) return null;

  return (
    <TooltipProvider>
      <Card className={`glass border-gray-800 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-400" />
            Royalty Distribution
          </CardTitle>
          <CardDescription>
            Automated payment distribution with 95% creator share
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Total Revenue */}
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Revenue</span>
              <span className="text-2xl font-bold text-white">
                {formatEther(breakdown.totalRevenue)} ETH
              </span>
            </div>
          </div>

          <Separator />

          {/* Platform vs Creator Split */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Revenue Split
            </h3>

            {/* Creator Share */}
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium">
                  Creator Share
                </span>
                <Badge
                  variant="outline"
                  className="text-green-400 border-green-400"
                >
                  {breakdown.creatorPercentage}%
                </Badge>
              </div>
              <span className="text-xl font-bold text-green-400">
                {formatEther(breakdown.creatorShare)} ETH
              </span>
            </div>

            {/* Platform Fee */}
            <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-400" />
                <span className="text-orange-400 font-medium">
                  Platform Fee
                </span>
                <Badge
                  variant="outline"
                  className="text-orange-400 border-orange-400"
                >
                  {breakdown.platformPercentage}%
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Platform fee covers infrastructure, security, and
                      marketplace operations
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xl font-bold text-orange-400">
                {formatEther(breakdown.platformFee)} ETH
              </span>
            </div>
          </div>

          {/* Multi-Creator Splits */}
          {hasMultipleCreators && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Multi-Creator Distribution
                </h3>

                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-400">
                    Creator share ({formatEther(breakdown.creatorShare)} ETH)
                    will be automatically split among {splits.length} creators
                    based on their contribution percentages.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {splits.map((split, index) => (
                    <div
                      key={split.address}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
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
                            {split.address.slice(0, 6)}...
                            {split.address.slice(-4)}
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

                {/* Validation */}
                {splits.reduce((sum, split) => sum + split.percentage, 0) !==
                  100 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Warning: Creator percentages don't add up to 100%. Total:{" "}
                      {splits.reduce((sum, split) => sum + split.percentage, 0)}
                      %
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          {/* Payment Processing Info */}
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Payment Processing
            </h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>
                • Payments are processed automatically upon license purchase
              </li>
              <li>• Gas fees are optimized through batch processing</li>
              <li>• All transactions are recorded on BaseCAMP blockchain</li>
              <li>
                • Payment confirmations are generated for each distribution
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
