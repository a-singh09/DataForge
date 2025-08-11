"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { IpNFTMetadata } from "@/types/marketplace";

interface RealTimeUpdatesProps {
  onRefresh?: () => void;
}

interface UpdateNotification {
  id: string;
  type: "new_mint" | "price_update" | "new_license";
  data: Partial<IpNFTMetadata>;
  timestamp: number;
}

export default function RealTimeUpdates({ onRefresh }: RealTimeUpdatesProps) {
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();

  // Simulate real-time updates (in production, this would be WebSocket or SSE)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate update notifications for demo
      if (Math.random() > 0.7) {
        // 30% chance every 10 seconds
        const mockUpdate: UpdateNotification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? "new_mint" : "price_update",
          data: {
            title: "New AI Training Dataset",
            contentType: "image",
            creator: { address: "0x...", socialProfiles: {} },
          },
          timestamp: Date.now(),
        };

        setNotifications((prev) => [mockUpdate, ...prev.slice(0, 4)]); // Keep only 5 notifications
        setIsVisible(true);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Invalidate all marketplace queries to fetch fresh data
    queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    queryClient.invalidateQueries({ queryKey: ["marketplace-infinite"] });

    // Clear notifications
    setNotifications([]);
    setIsVisible(false);

    // Call parent refresh handler
    onRefresh?.();
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const getNotificationMessage = (notification: UpdateNotification) => {
    switch (notification.type) {
      case "new_mint":
        return `New dataset: ${notification.data.title}`;
      case "price_update":
        return `Price updated: ${notification.data.title}`;
      case "new_license":
        return `New license purchased: ${notification.data.title}`;
      default:
        return "Marketplace update";
    }
  };

  const getNotificationColor = (type: UpdateNotification["type"]) => {
    switch (type) {
      case "new_mint":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "price_update":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "new_license":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-white">
              Marketplace Updates
            </span>
            <Badge variant="secondary" className="text-xs">
              {notifications.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2 mb-3">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between p-2 rounded-lg bg-white/5"
            >
              <div className="flex-1 min-w-0">
                <Badge
                  className={`text-xs mb-1 ${getNotificationColor(notification.type)}`}
                >
                  {notification.type.replace("_", " ")}
                </Badge>
                <p className="text-xs text-gray-300 line-clamp-2">
                  {getNotificationMessage(notification)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-5 w-5 p-0 ml-2 hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={handleRefresh}
          size="sm"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Marketplace
        </Button>
      </div>
    </div>
  );
}
