"use client";

import { useState } from "react";
import { formatEther } from "viem";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Zap,
  Clock,
  Target,
  Download,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export interface PaymentAnalyticsData {
  totalPayments: number;
  totalVolume: bigint;
  totalGasCosts: bigint;
  totalGasSaved: bigint;
  averageGasPrice: bigint;
  successRate: number;
  averageProcessingTime: number; // seconds
  batchEfficiency: number; // percentage
  costOptimization: {
    batchSavings: bigint;
    timingSavings: bigint;
    totalSavings: bigint;
    optimizationRate: number;
  };
  timeSeriesData: {
    date: string;
    payments: number;
    volume: number;
    gasCosts: number;
    gasSaved: number;
    avgGasPrice: number;
  }[];
  gasDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  paymentMethods: {
    method: string;
    count: number;
    volume: number;
    avgCost: number;
  }[];
}

interface PaymentAnalyticsProps {
  data: PaymentAnalyticsData;
  timeframe: "24h" | "7d" | "30d" | "90d";
  onTimeframeChange: (timeframe: "24h" | "7d" | "30d" | "90d") => void;
  onExportData?: () => void;
  className?: string;
}

export default function PaymentAnalytics({
  data,
  timeframe,
  onTimeframeChange,
  onExportData,
  className = "",
}: PaymentAnalyticsProps) {
  const [activeChart, setActiveChart] = useState<
    "volume" | "gas" | "efficiency"
  >("volume");

  const formatTimeframe = (tf: string) => {
    switch (tf) {
      case "24h":
        return "Last 24 Hours";
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      default:
        return "Last 7 Days";
    }
  };

  const formatGasPrice = (gasPrice: bigint) => {
    return `${Number(gasPrice) / 1e9} gwei`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getEfficiencyColor = (rate: number) => {
    if (rate >= 90) return "text-green-400";
    if (rate >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getSavingsColor = (savings: bigint) => {
    const savingsEth = Number(formatEther(savings));
    if (savingsEth >= 1) return "text-green-400";
    if (savingsEth >= 0.1) return "text-yellow-400";
    return "text-blue-400";
  };

  return (
    <Card className={`glass border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Payment Analytics & Cost Tracking
          </div>
          <div className="flex gap-2">
            <Select value={timeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            {onExportData && (
              <Button size="sm" variant="outline" onClick={onExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Comprehensive payment processing analytics for{" "}
          {formatTimeframe(timeframe)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-blue-400">Total Volume</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {formatEther(data.totalVolume)} ETH
            </p>
            <p className="text-sm text-gray-400">
              {data.totalPayments} payments
            </p>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-green-400" />
              <span className="text-sm text-green-400">Gas Saved</span>
            </div>
            <p
              className={`text-2xl font-bold mb-1 ${getSavingsColor(data.totalGasSaved)}`}
            >
              {formatEther(data.totalGasSaved)} ETH
            </p>
            <p className="text-sm text-gray-400">
              {data.costOptimization.optimizationRate}% optimization
            </p>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-yellow-400">Avg Gas Price</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {formatGasPrice(data.averageGasPrice)}
            </p>
            <p className="text-sm text-gray-400">
              {data.batchEfficiency}% batch efficiency
            </p>
          </div>

          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-purple-400">Success Rate</span>
            </div>
            <p
              className={`text-2xl font-bold mb-1 ${getEfficiencyColor(data.successRate)}`}
            >
              {data.successRate}%
            </p>
            <p className="text-sm text-gray-400">
              Avg: {formatDuration(data.averageProcessingTime)}
            </p>
          </div>
        </div>

        {/* Cost Optimization Summary */}
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-400" />
            Cost Optimization Impact
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Batch Savings</p>
              <p className="text-lg font-bold text-green-400">
                {formatEther(data.costOptimization.batchSavings)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Timing Savings</p>
              <p className="text-lg font-bold text-green-400">
                {formatEther(data.costOptimization.timingSavings)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Savings</p>
              <p className="text-lg font-bold text-green-400">
                {formatEther(data.costOptimization.totalSavings)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Optimization Rate</p>
              <p className="text-lg font-bold text-green-400">
                {data.costOptimization.optimizationRate}%
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Chart Selection */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeChart === "volume" ? "default" : "outline"}
            onClick={() => setActiveChart("volume")}
          >
            Volume Trends
          </Button>
          <Button
            size="sm"
            variant={activeChart === "gas" ? "default" : "outline"}
            onClick={() => setActiveChart("gas")}
          >
            Gas Analytics
          </Button>
          <Button
            size="sm"
            variant={activeChart === "efficiency" ? "default" : "outline"}
            onClick={() => setActiveChart("efficiency")}
          >
            Efficiency Metrics
          </Button>
        </div>

        {/* Charts */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === "volume" ? (
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
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
                  dataKey="volume"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="payments"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            ) : activeChart === "gas" ? (
              <BarChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="gasCosts" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gasSaved" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : activeChart === "efficiency" ? (
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
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
                  dataKey="avgGasPrice"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
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
                  dataKey="volume"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Gas Distribution */}
          <Card className="glass border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Gas Cost Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.gasDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.gasDistribution.map((entry, index) => (
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
              <div className="grid grid-cols-2 gap-2 mt-4">
                {data.gasDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-400">{item.name}</span>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Performance */}
          <Card className="glass border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.paymentMethods.map((method) => (
                  <div
                    key={method.method}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">{method.method}</p>
                      <p className="text-sm text-gray-400">
                        {method.count} payments
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        {method.volume.toFixed(3)} ETH
                      </p>
                      <p className="text-sm text-gray-400">
                        Avg: {method.avgCost.toFixed(6)} ETH
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            Performance Insights
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Cost Efficiency</p>
              <ul className="text-gray-300 space-y-1">
                <li>
                  • Batch processing saves{" "}
                  {formatEther(data.costOptimization.batchSavings)} ETH
                </li>
                <li>
                  • Optimal timing reduces costs by{" "}
                  {data.costOptimization.optimizationRate}%
                </li>
                <li>
                  • Average gas price: {formatGasPrice(data.averageGasPrice)}
                </li>
              </ul>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Processing Speed</p>
              <ul className="text-gray-300 space-y-1">
                <li>
                  • Average processing:{" "}
                  {formatDuration(data.averageProcessingTime)}
                </li>
                <li>• Batch efficiency: {data.batchEfficiency}%</li>
                <li>• Success rate: {data.successRate}%</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Volume Trends</p>
              <ul className="text-gray-300 space-y-1">
                <li>• Total volume: {formatEther(data.totalVolume)} ETH</li>
                <li>• Total payments: {data.totalPayments}</li>
                <li>• Gas costs: {formatEther(data.totalGasCosts)} ETH</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
