"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  DollarSign,
  User,
  FileText,
  TrendingUp,
  Calendar,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { formatEther } from "viem";
import { useState } from "react";

export default function LicensingTimeline() {
  const { licensingActivity, uploads, isLoading, error, refetchAll } =
    useCreatorAnalytics();
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card className="glass border-gray-800 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
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
          <CardTitle>Licensing Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">
              Failed to load licensing activity
            </p>
            <Button onClick={refetchAll} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedActivity = showAll
    ? licensingActivity
    : licensingActivity.slice(0, 10);

  // Get content title for each activity
  const getContentTitle = (tokenId: string) => {
    const upload = uploads?.find((u) => u.tokenId === tokenId);
    return upload?.title || `Token #${tokenId}`;
  };

  const getContentType = (tokenId: string) => {
    const upload = uploads?.find((u) => u.tokenId === tokenId);
    return upload?.contentType || "unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "expired":
        return "bg-red-500";
      case "renewed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
        return "destructive";
      case "renewed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-400" />
            <CardTitle>Licensing Activity Timeline</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {licensingActivity.length} total
            </Badge>
            <Button onClick={refetchAll} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {licensingActivity.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No licensing activity yet</p>
            <p className="text-sm text-gray-500">
              License activity will appear here once your content starts getting
              licensed
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {displayedActivity.map((activity, index) => (
                  <div
                    key={`${activity.tokenId}-${activity.timestamp}-${index}`}
                    className="relative flex items-start space-x-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Timeline dot */}
                    <div className="relative">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)} mt-2`}
                      ></div>
                      {index < displayedActivity.length - 1 && (
                        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gray-700"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white truncate">
                              {getContentTitle(activity.tokenId)}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {getContentType(activity.tokenId)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="font-mono">
                                {activity.buyer.slice(0, 6)}...
                                {activity.buyer.slice(-4)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  activity.timestamp,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {activity.duration === 0
                                  ? "Lifetime"
                                  : `${Math.floor(activity.duration / (24 * 60 * 60))} days`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getStatusBadgeVariant(activity.status)}
                            >
                              {activity.status}
                            </Badge>
                            <div className="flex items-center gap-1 text-green-400">
                              <DollarSign className="h-3 w-3" />
                              <span className="font-medium">
                                {Number(formatEther(activity.price)).toFixed(4)}{" "}
                                ETH
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Show more/less button */}
            {licensingActivity.length > 10 && (
              <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll
                    ? "Show Less"
                    : `Show All ${licensingActivity.length} Activities`}
                  <TrendingUp className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Summary stats */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {
                      licensingActivity.filter((a) => a.status === "active")
                        .length
                    }
                  </p>
                  <p className="text-xs text-gray-400">Active Licenses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-400">
                    {
                      licensingActivity.filter((a) => a.status === "expired")
                        .length
                    }
                  </p>
                  <p className="text-xs text-gray-400">Expired</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    $
                    {licensingActivity
                      .reduce((sum, a) => sum + Number(formatEther(a.price)), 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">Total Value</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
