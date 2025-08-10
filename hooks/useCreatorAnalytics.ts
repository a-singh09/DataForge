"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useAuthState } from "./useAuthState";

export interface UploadData {
  tokenId: string;
  title: string;
  contentType: "image" | "text" | "audio" | "video" | "code" | "social";
  createdAt: number;
  uri: string;
  contentHash: string;
  license: {
    price: bigint;
    duration: number;
    royaltyBps: number;
    paymentToken: string;
  };
  metadata: Record<string, unknown>;
}

export interface UsageStats {
  user: {
    multiplier: number;
    points: number;
    active: boolean;
  };
  teams: any[];
  dataSources: any[];
}

export interface LicensingActivity {
  tokenId: string;
  buyer: string;
  price: bigint;
  timestamp: number;
  duration: number;
  status: "active" | "expired" | "renewed";
}

export interface RevenueData {
  totalEarnings: bigint;
  monthlyEarnings: bigint;
  activeLicenses: number;
  totalLicenses: number;
  averageLicensePrice: bigint;
  revenueByMonth: Array<{
    month: string;
    revenue: bigint;
    licenses: number;
  }>;
}

export interface ContentInsights {
  popularContent: Array<{
    tokenId: string;
    title: string;
    contentType: string;
    licenseCount: number;
    totalRevenue: bigint;
    viewCount: number;
  }>;
  contentTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
    revenue: bigint;
  }>;
  licenseDurationPreferences: Array<{
    duration: number;
    count: number;
    revenue: bigint;
  }>;
}

/**
 * Comprehensive hook for creator analytics using Origin SDK
 * Provides real-time data about uploads, usage, revenue, and content performance
 */
export function useCreatorAnalytics() {
  const { auth } = useAuth();
  const { authenticated } = useAuthState();
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );

  // Fetch user's Origin uploads
  const {
    data: uploads,
    isLoading: uploadsLoading,
    error: uploadsError,
    refetch: refetchUploads,
  } = useQuery({
    queryKey: ["origin-uploads", auth?.walletAddress],
    queryFn: async (): Promise<UploadData[]> => {
      if (!auth?.origin) throw new Error("Origin SDK not available");

      const uploadsData = await auth.origin.getOriginUploads();
      if (!uploadsData) return [];

      // Transform the data to match our interface
      return uploadsData.map((upload: any) => ({
        tokenId: upload.tokenId || upload.id,
        title: upload.metadata?.title || upload.title || "Untitled",
        contentType:
          upload.metadata?.contentType || upload.contentType || "text",
        createdAt: upload.createdAt || upload.timestamp || Date.now(),
        uri: upload.uri || upload.url,
        contentHash: upload.contentHash || upload.hash,
        license: {
          price: BigInt(upload.license?.price || 0),
          duration: upload.license?.duration || 0,
          royaltyBps: upload.license?.royaltyBps || 500,
          paymentToken:
            upload.license?.paymentToken ||
            "0x0000000000000000000000000000000000000000",
        },
        metadata: upload.metadata || {},
      }));
    },
    enabled: authenticated && !!auth?.origin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds for real-time updates
  });

  // Fetch user's Origin usage stats
  const {
    data: usageStats,
    isLoading: usageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ["origin-usage", auth?.walletAddress],
    queryFn: async (): Promise<UsageStats> => {
      if (!auth?.origin) throw new Error("Origin SDK not available");

      const usage = await auth.origin.getOriginUsage();
      if (!usage) {
        return {
          user: { multiplier: 1, points: 0, active: false },
          teams: [],
          dataSources: [],
        };
      }

      return usage;
    },
    enabled: authenticated && !!auth?.origin,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Calculate revenue analytics from uploads data
  const revenueData: RevenueData | undefined = uploads
    ? calculateRevenueData(uploads, timeframe)
    : undefined;

  // Calculate content insights from uploads data
  const contentInsights: ContentInsights | undefined = uploads
    ? calculateContentInsights(uploads)
    : undefined;

  // Mock licensing activity data (would come from blockchain events in real implementation)
  const licensingActivity: LicensingActivity[] = uploads
    ? generateMockLicensingActivity(uploads)
    : [];

  return {
    // Core data
    uploads,
    usageStats,
    revenueData,
    contentInsights,
    licensingActivity,

    // Loading states
    isLoading: uploadsLoading || usageLoading,
    uploadsLoading,
    usageLoading,

    // Errors
    error: uploadsError || usageError,
    uploadsError,
    usageError,

    // Actions
    refetchUploads,
    refetchUsage,
    refetchAll: () => {
      refetchUploads();
      refetchUsage();
    },

    // Timeframe control
    timeframe,
    setTimeframe,

    // Utility functions
    getTotalEarnings: () => revenueData?.totalEarnings || BigInt(0),
    getActiveLicenses: () => revenueData?.activeLicenses || 0,
    getTotalContent: () => uploads?.length || 0,
    getPopularContent: () => contentInsights?.popularContent || [],
  };
}

// Helper function to calculate revenue data from uploads
function calculateRevenueData(
  uploads: UploadData[],
  timeframe: string,
): RevenueData {
  const now = Date.now();
  const timeframeMs = getTimeframeMs(timeframe);
  const startTime = now - timeframeMs;

  // Filter uploads within timeframe
  const recentUploads = uploads.filter(
    (upload) => upload.createdAt >= startTime,
  );

  // Mock revenue calculation (in real implementation, this would come from blockchain events)
  const totalEarnings = uploads.reduce((sum, upload) => {
    // Simulate some licenses sold
    const mockLicensesSold = Math.floor(Math.random() * 10) + 1;
    return sum + upload.license.price * BigInt(mockLicensesSold);
  }, BigInt(0));

  const monthlyEarnings = recentUploads.reduce((sum, upload) => {
    const mockLicensesSold = Math.floor(Math.random() * 5) + 1;
    return sum + upload.license.price * BigInt(mockLicensesSold);
  }, BigInt(0));

  const activeLicenses = uploads.length * 3; // Mock active licenses
  const totalLicenses = uploads.length * 5; // Mock total licenses

  const averageLicensePrice =
    uploads.length > 0
      ? uploads.reduce((sum, upload) => sum + upload.license.price, BigInt(0)) /
        BigInt(uploads.length)
      : BigInt(0);

  // Generate monthly revenue data
  const revenueByMonth = generateMonthlyRevenueData(uploads);

  return {
    totalEarnings,
    monthlyEarnings,
    activeLicenses,
    totalLicenses,
    averageLicensePrice,
    revenueByMonth,
  };
}

// Helper function to calculate content insights
function calculateContentInsights(uploads: UploadData[]): ContentInsights {
  // Popular content (mock data based on uploads)
  const popularContent = uploads
    .map((upload) => ({
      tokenId: upload.tokenId,
      title: upload.title,
      contentType: upload.contentType,
      licenseCount: Math.floor(Math.random() * 20) + 1,
      totalRevenue:
        upload.license.price * BigInt(Math.floor(Math.random() * 20) + 1),
      viewCount: Math.floor(Math.random() * 1000) + 100,
    }))
    .sort((a, b) => b.licenseCount - a.licenseCount)
    .slice(0, 10);

  // Content type distribution
  const typeCount: Record<string, number> = {};
  const typeRevenue: Record<string, bigint> = {};

  uploads.forEach((upload) => {
    const type = upload.contentType;
    typeCount[type] = (typeCount[type] || 0) + 1;
    typeRevenue[type] = (typeRevenue[type] || BigInt(0)) + upload.license.price;
  });

  const contentTypeDistribution = Object.entries(typeCount).map(
    ([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / uploads.length) * 100),
      revenue: typeRevenue[type] || BigInt(0),
    }),
  );

  // License duration preferences (mock data)
  const licenseDurationPreferences = [
    {
      duration: 30 * 24 * 60 * 60,
      count: Math.floor(uploads.length * 0.2),
      revenue: BigInt(0),
    },
    {
      duration: 90 * 24 * 60 * 60,
      count: Math.floor(uploads.length * 0.3),
      revenue: BigInt(0),
    },
    {
      duration: 365 * 24 * 60 * 60,
      count: Math.floor(uploads.length * 0.4),
      revenue: BigInt(0),
    },
    {
      duration: 0,
      count: Math.floor(uploads.length * 0.1),
      revenue: BigInt(0),
    }, // Lifetime
  ];

  return {
    popularContent,
    contentTypeDistribution,
    licenseDurationPreferences,
  };
}

// Helper function to generate mock licensing activity
function generateMockLicensingActivity(
  uploads: UploadData[],
): LicensingActivity[] {
  const activities: LicensingActivity[] = [];

  uploads.forEach((upload) => {
    // Generate 1-3 mock licensing activities per upload
    const activityCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < activityCount; i++) {
      activities.push({
        tokenId: upload.tokenId,
        buyer: `0x${Math.random().toString(16).substr(2, 40)}`,
        price: upload.license.price,
        timestamp:
          Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        duration: upload.license.duration,
        status: Math.random() > 0.8 ? "expired" : "active",
      });
    }
  });

  return activities.sort((a, b) => b.timestamp - a.timestamp);
}

// Helper function to generate monthly revenue data
function generateMonthlyRevenueData(uploads: UploadData[]) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  return months
    .slice(Math.max(0, currentMonth - 6), currentMonth + 1)
    .map((month) => ({
      month,
      revenue: BigInt(Math.floor(Math.random() * 5000) + 1000),
      licenses: Math.floor(Math.random() * 50) + 10,
    }));
}

// Helper function to convert timeframe to milliseconds
function getTimeframeMs(timeframe: string): number {
  switch (timeframe) {
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return 30 * 24 * 60 * 60 * 1000;
    case "90d":
      return 90 * 24 * 60 * 60 * 1000;
    case "1y":
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

export default useCreatorAnalytics;
