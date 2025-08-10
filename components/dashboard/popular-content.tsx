"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Eye,
  DollarSign,
  FileText,
  Star,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { formatEther } from "viem";

export default function PopularContent() {
  const { contentInsights, isLoading, error, refetchAll } =
    useCreatorAnalytics();

  if (isLoading) {
    return (
      <Card className="glass border-gray-800 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !contentInsights) {
    return (
      <Card className="glass border-red-800">
        <CardHeader>
          <CardTitle>Popular Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Failed to load content insights</p>
            <Button onClick={refetchAll} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const popularContent = contentInsights.popularContent;

  const getContentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "image":
        return "bg-blue-500";
      case "text":
        return "bg-green-500";
      case "audio":
        return "bg-purple-500";
      case "video":
        return "bg-red-500";
      case "code":
        return "bg-yellow-500";
      case "social":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "image":
        return "🖼️";
      case "text":
        return "📝";
      case "audio":
        return "🎵";
      case "video":
        return "🎥";
      case "code":
        return "💻";
      case "social":
        return "📱";
      default:
        return "📄";
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${index + 1}`;
    }
  };

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <CardTitle>Popular Content & Recommendations</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Top {popularContent.length}
            </Badge>
            <Button onClick={refetchAll} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {popularContent.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              No content performance data yet
            </p>
            <p className="text-sm text-gray-500">
              Upload and license your content to see performance insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {popularContent.map((content, index) => (
              <div
                key={content.tokenId}
                className="relative flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors group"
              >
                {/* Rank indicator */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-sm font-bold">
                    {typeof getRankIcon(index) === "string" &&
                    getRankIcon(index).startsWith("#") ? (
                      <span className="text-orange-400">
                        {getRankIcon(index)}
                      </span>
                    ) : (
                      <span className="text-lg">{getRankIcon(index)}</span>
                    )}
                  </div>
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-white truncate">
                          {content.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">
                            {getContentTypeIcon(content.contentType)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {content.contentType}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-400">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">
                            {Number(formatEther(content.totalRevenue)).toFixed(
                              4,
                            )}{" "}
                            ETH
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400">
                          <FileText className="h-3 w-3" />
                          <span>{content.licenseCount} licenses</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-400">
                          <Eye className="h-3 w-3" />
                          <span>
                            {content.viewCount.toLocaleString()} views
                          </span>
                        </div>
                      </div>

                      {/* Performance indicators */}
                      <div className="flex items-center gap-2 mt-2">
                        {content.licenseCount > 10 && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                        {content.viewCount > 1000 && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Viral
                          </Badge>
                        )}
                        {Number(formatEther(content.totalRevenue)) > 0.1 && (
                          <Badge variant="default" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Top Earner
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Edit Pricing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

            {/* Recommendations section */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                Content Recommendations
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 font-medium mb-1">
                    💡 Optimize your top performer
                  </p>
                  <p className="text-xs text-gray-400">
                    "{popularContent[0]?.title}" is performing well. Consider
                    creating similar content or adjusting pricing.
                  </p>
                </div>

                {contentInsights.contentTypeDistribution.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400 font-medium mb-1">
                      📈 Content type insight
                    </p>
                    <p className="text-xs text-gray-400">
                      {contentInsights.contentTypeDistribution[0].type} content
                      makes up{" "}
                      {contentInsights.contentTypeDistribution[0].percentage}%
                      of your portfolio and generates strong revenue.
                    </p>
                  </div>
                )}

                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-400 font-medium mb-1">
                    🎯 Engagement tip
                  </p>
                  <p className="text-xs text-gray-400">
                    Content with higher view counts tend to get more licenses.
                    Focus on discoverability and quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
