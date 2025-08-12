"use client";

import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RevenueChart from "@/components/dashboard/revenue-chart";
import ContentTable from "@/components/dashboard/content-table";
import ActivityFeed from "@/components/dashboard/activity-feed";
import AnalyticsInsights from "@/components/dashboard/analytics-insights";
import LicensingTimeline from "@/components/dashboard/licensing-timeline";
import PopularContent from "@/components/dashboard/popular-content";
import TransactionHistory from "@/components/dashboard/transaction-history";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { formatEther } from "viem";

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("30D");
  const {
    revenueData,
    uploads,
    usageStats,
    isLoading: analyticsLoading,
    getTotalEarnings,
    getActiveLicenses,
    getTotalContent,
  } = useCreatorAnalytics();

  // Calculate dynamic key metrics from real Origin SDK data
  const keyMetrics = [
    {
      title: "Total Earnings",
      value: analyticsLoading
        ? "..."
        : `${Number(formatEther(getTotalEarnings())).toFixed(4)} ETH`,
      change: revenueData ? `${revenueData.totalLicenses} licenses` : "No data",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      title: "Active Licenses",
      value: analyticsLoading ? "..." : getActiveLicenses().toString(),
      change: revenueData ? `${revenueData.totalLicenses} total` : "No data",
      changeType: "positive" as const,
      icon: FileText,
      color: "text-blue-400",
    },
    {
      title: "Content Minted",
      value: analyticsLoading ? "..." : getTotalContent().toString(),
      change: uploads ? `${uploads.length} IpNFTs` : "No uploads",
      changeType: "positive" as const,
      icon: Eye,
      color: "text-purple-400",
    },
    {
      title: "Origin Multiplier",
      value: analyticsLoading ? "..." : `${usageStats?.user?.multiplier || 1}x`,
      change: usageStats?.user?.active ? "Active" : "Inactive",
      changeType: usageStats?.user?.active
        ? ("positive" as const)
        : ("neutral" as const),
      icon: TrendingUp,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Creator <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-xl text-gray-300">
                Track your content performance and earnings with Origin SDK
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7D">7 Days</SelectItem>
                  <SelectItem value="30D">30 Days</SelectItem>
                  <SelectItem value="90D">90 Days</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-orange-500 hover:bg-orange-600">
                <FileText className="h-4 w-4 mr-2" />
                Upload Content
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.title}
                className="glass border-gray-800 hover:bg-white/5 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {metric.value}
                      </p>
                      <div
                        className={`flex items-center mt-2 text-sm ${
                          metric.changeType === "positive"
                            ? "text-green-400"
                            : metric.changeType === "neutral"
                              ? "text-gray-400"
                              : "text-red-400"
                        }`}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {metric.change}
                      </div>
                    </div>
                    <div
                      className={`h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2">
                <RevenueChart timeframe={timeframe} />
              </div>

              {/* Activity Feed */}
              <div>
                <ActivityFeed />
              </div>
            </div>

            {/* Popular Content Overview */}
            <div className="grid lg:grid-cols-2 gap-8">
              <PopularContent />
              <LicensingTimeline />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsInsights />
          </TabsContent>

          <TabsContent value="content">
            <ContentTable />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="activity">
            <div className="max-w-4xl">
              <ActivityFeed detailed />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <div className="grid gap-8">
              <PopularContent />
              <LicensingTimeline />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
