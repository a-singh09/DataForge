"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, DollarSign, Upload, Star, Eye, Clock } from "lucide-react";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { formatEther } from "viem";

// Activities will be generated from real data
// Removed hardcoded activities array

interface ActivityFeedProps {
  detailed?: boolean;
}

export default function ActivityFeed({ detailed = false }: ActivityFeedProps) {
  const { uploads, licensingActivity, isLoading } = useCreatorAnalytics();

  // Generate activities from real data
  const activities = [
    // Upload activities
    ...(uploads || []).map((upload, index) => ({
      id: `upload-${upload.tokenId}`,
      type: "content_upload",
      title: "Content uploaded",
      description: upload.title,
      timestamp: new Date(upload.createdAt).toLocaleDateString(),
      icon: Upload,
      color: "text-blue-400",
    })),
    // Licensing activities
    ...(licensingActivity || []).map((activity, index) => ({
      id: `license-${activity.tokenId}-${index}`,
      type: "license_purchase",
      title: "License purchased",
      description: `Token #${activity.tokenId}`,
      amount: Number(formatEther(activity.price)),
      currency: "ETH",
      timestamp: new Date(activity.timestamp).toLocaleDateString(),
      icon: Download,
      color: "text-green-400",
    })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const displayActivities = detailed ? activities : activities.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div
                  className={`h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{activity.title}</p>
                    <span className="text-xs text-gray-500">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  {activity.amount && (
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className="text-green-400 border-green-400/30"
                      >
                        +{activity.amount} {activity.currency}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!detailed && (
          <div className="text-center mt-6">
            <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
              View all activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
