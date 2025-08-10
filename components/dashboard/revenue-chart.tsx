"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { formatEther } from "viem";
import { Badge } from "@/components/ui/badge";

interface RevenueChartProps {
  timeframe: string;
}

export default function RevenueChart({ timeframe }: RevenueChartProps) {
  const { revenueData, licensingActivity, isLoading, error } =
    useCreatorAnalytics();

  if (isLoading) {
    return (
      <Card className="glass border-gray-800 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !revenueData) {
    return (
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>Unable to load revenue data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            No revenue data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = revenueData.revenueByMonth.map((item) => ({
    name: item.month,
    revenue: Number(formatEther(item.revenue)) * 1000, // Convert to reasonable display numbers
    licenses: item.licenses,
    // Add cumulative data
    cumulativeRevenue: 0, // Will be calculated below
  }));

  // Calculate cumulative revenue
  let cumulative = 0;
  chartData.forEach((item) => {
    cumulative += item.revenue;
    item.cumulativeRevenue = cumulative;
  });

  // Calculate growth metrics
  const currentMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];
  const revenueGrowth = previousMonth
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) *
      100
    : 0;

  const totalRevenue = Number(formatEther(revenueData.totalEarnings));
  const monthlyRevenue = Number(formatEther(revenueData.monthlyEarnings));
  const averageLicensePrice = Number(
    formatEther(revenueData.averageLicensePrice),
  );

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Revenue Analytics
              <Badge variant="outline" className="text-xs">
                {timeframe.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time earnings from Origin SDK integration
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {revenueGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                revenueGrowth >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {revenueGrowth >= 0 ? "+" : ""}
              {revenueGrowth.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number, name: string) => [
                  name === "revenue" ? `$${value.toFixed(2)}` : value,
                  name === "revenue" ? "Revenue" : "Licenses",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#F97316"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#F97316", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
          <div>
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {revenueData.totalLicenses} total licenses
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Monthly Revenue</p>
            <p className="text-2xl font-bold text-orange-400">
              ${monthlyRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {revenueData.activeLicenses} active licenses
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Avg. per License</p>
            <p className="text-2xl font-bold text-blue-400">
              ${averageLicensePrice.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Based on {revenueData.totalLicenses} licenses
            </p>
          </div>
        </div>

        {/* Recent activity indicator */}
        {licensingActivity.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Activity className="h-4 w-4" />
              <span>
                Last activity:{" "}
                {new Date(licensingActivity[0].timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
