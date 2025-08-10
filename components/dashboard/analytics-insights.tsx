"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  Activity,
  DollarSign,
  Eye,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { formatEther } from "viem";
import { useState } from "react";

const COLORS = {
  primary: "#F97316",
  secondary: "#3B82F6",
  success: "#10B981",
  purple: "#8B5CF6",
  red: "#EF4444",
  yellow: "#F59E0B",
  pink: "#EC4899",
  indigo: "#6366F1",
};

export default function AnalyticsInsights() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");
  const {
    uploads,
    usageStats,
    revenueData,
    contentInsights,
    licensingActivity,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    refetchAll,
  } = useCreatorAnalytics();

  // Update timeframe when selection changes
  const handleTimeframeChange = (value: "7d" | "30d" | "90d" | "1y") => {
    setSelectedTimeframe(value);
    setTimeframe(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass border-gray-800 animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card className="glass border-red-800">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-400 mb-4">Failed to load analytics data</p>
              <Button onClick={refetchAll} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const contentTypeData =
    contentInsights?.contentTypeDistribution.map((item, index) => ({
      name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
      value: item.percentage,
      count: item.count,
      revenue: item.revenue,
      color: Object.values(COLORS)[index % Object.values(COLORS).length],
    })) || [];

  const licenseDurationData =
    contentInsights?.licenseDurationPreferences.map((item) => ({
      name:
        item.duration === 0
          ? "Lifetime"
          : `${Math.floor(item.duration / (24 * 60 * 60))} Days`,
      licenses: item.count,
      revenue: Number(formatEther(item.revenue || BigInt(0))) * 1000, // Convert to reasonable numbers for display
    })) || [];

  const revenueChartData =
    revenueData?.revenueByMonth.map((item) => ({
      month: item.month,
      revenue: Number(formatEther(item.revenue)) * 1000,
      licenses: item.licenses,
    })) || [];

  const popularContent = contentInsights?.popularContent.slice(0, 5) || [];

  // Calculate key metrics
  const totalEarnings = revenueData
    ? Number(formatEther(revenueData.totalEarnings))
    : 0;
  const monthlyEarnings = revenueData
    ? Number(formatEther(revenueData.monthlyEarnings))
    : 0;
  const activeLicenses = revenueData?.activeLicenses || 0;
  const totalContent = uploads?.length || 0;

  // Get most popular content type
  const mostPopularType =
    contentTypeData.length > 0
      ? contentTypeData.reduce((prev, current) =>
          prev.value > current.value ? prev : current,
        )
      : null;

  // Get top license duration
  const topLicenseDuration =
    licenseDurationData.length > 0
      ? licenseDurationData.reduce((prev, current) =>
          prev.licenses > current.licenses ? prev : current,
        )
      : null;

  return (
    <div className="space-y-8">
      {/* Header with timeframe selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Insights</h2>
          <p className="text-gray-400">Real-time data from Origin SDK</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeframe}
            onValueChange={handleTimeframeChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refetchAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Most Popular Type</p>
                <p className="text-xl font-bold text-blue-400">
                  {mostPopularType?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {mostPopularType?.value || 0}% of content
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Top License Duration</p>
                <p className="text-xl font-bold text-green-400">
                  {topLicenseDuration?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {topLicenseDuration?.licenses || 0} licenses
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Origin Multiplier</p>
                <p className="text-xl font-bold text-purple-400">
                  {usageStats?.user?.multiplier || 1}x
                </p>
                <p className="text-sm text-gray-500">
                  {usageStats?.user?.points || 0} points
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Status</p>
                <p className="text-xl font-bold text-orange-400">
                  {usageStats?.user?.active ? "Active" : "Inactive"}
                </p>
                <p className="text-sm text-gray-500">Origin account</p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Content Type Distribution */}
        <Card className="glass border-gray-800">
          <CardHeader>
            <CardTitle>Content Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {contentTypeData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {contentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {contentTypeData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center space-x-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-400">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No content data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* License Duration Performance */}
        <Card className="glass border-gray-800">
          <CardHeader>
            <CardTitle>License Duration Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {licenseDurationData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={licenseDurationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Bar
                      dataKey="licenses"
                      fill="#F97316"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No license data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Timeline */}
      {revenueChartData.length > 0 && (
        <Card className="glass border-gray-800">
          <CardHeader>
            <CardTitle>Revenue Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#F97316", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Content */}
      {popularContent.length > 0 && (
        <Card className="glass border-gray-800">
          <CardHeader>
            <CardTitle>Popular Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularContent.map((content, index) => (
                <div
                  key={content.tokenId}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{content.title}</p>
                      <p className="text-sm text-gray-400">
                        {content.contentType} • {content.licenseCount} licenses
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-400">
                      {Number(formatEther(content.totalRevenue)).toFixed(4)} ETH
                    </p>
                    <p className="text-sm text-gray-400">
                      {content.viewCount} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Licensing Activity */}
      {licensingActivity.length > 0 && (
        <Card className="glass border-gray-800">
          <CardHeader>
            <CardTitle>Recent Licensing Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {licensingActivity.slice(0, 10).map((activity, index) => (
                <div
                  key={`${activity.tokenId}-${index}`}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="font-medium text-white">
                        License purchased for Token #{activity.tokenId}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()} •
                        {activity.buyer.slice(0, 6)}...
                        {activity.buyer.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        activity.status === "active" ? "default" : "secondary"
                      }
                    >
                      {activity.status}
                    </Badge>
                    <p className="text-sm text-gray-400 mt-1">
                      {Number(formatEther(activity.price)).toFixed(4)} ETH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
