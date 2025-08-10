"use client";

import { useState, useEffect } from "react";
import { formatEther } from "viem";
import {
  Zap,
  Clock,
  DollarSign,
  TrendingDown,
  Play,
  Pause,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export interface PendingPayment {
  id: string;
  tokenId: bigint;
  contentTitle: string;
  amount: bigint;
  recipient: string;
  recipientName?: string;
  timestamp: Date;
  priority: "high" | "medium" | "low";
}

export interface BatchProcessingStats {
  totalPending: number;
  totalValue: bigint;
  estimatedGasSavings: bigint;
  nextBatchTime: Date;
  averageGasPrice: bigint;
  batchSize: number;
}

interface BatchPaymentProcessorProps {
  pendingPayments: PendingPayment[];
  stats: BatchProcessingStats;
  onProcessBatch?: (paymentIds: string[]) => Promise<void>;
  onUpdateSettings?: (settings: BatchSettings) => void;
  className?: string;
}

export interface BatchSettings {
  enabled: boolean;
  batchSize: number;
  maxWaitTime: number; // minutes
  gasThreshold: bigint; // max gas price in gwei
  autoProcess: boolean;
}

export default function BatchPaymentProcessor({
  pendingPayments,
  stats,
  onProcessBatch,
  onUpdateSettings,
  className = "",
}: BatchPaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [settings, setSettings] = useState<BatchSettings>({
    enabled: true,
    batchSize: 10,
    maxWaitTime: 30,
    gasThreshold: BigInt("20000000000"), // 20 gwei
    autoProcess: true,
  });
  const [timeUntilBatch, setTimeUntilBatch] = useState<number>(0);

  useEffect(() => {
    // Update countdown timer
    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = stats.nextBatchTime.getTime() - now.getTime();
      setTimeUntilBatch(Math.max(0, Math.floor(timeDiff / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.nextBatchTime]);

  const handleProcessBatch = async () => {
    if (!onProcessBatch || selectedPayments.length === 0) return;

    setIsProcessing(true);
    try {
      await onProcessBatch(selectedPayments);
      setSelectedPayments([]);
    } catch (error) {
      console.error("Batch processing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === pendingPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(pendingPayments.map((p) => p.id));
    }
  };

  const handlePaymentToggle = (paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId],
    );
  };

  const selectedValue = selectedPayments.reduce((sum, id) => {
    const payment = pendingPayments.find((p) => p.id === id);
    return sum + (payment?.amount || BigInt(0));
  }, BigInt(0));

  const estimatedGasSavings =
    selectedPayments.length > 1
      ? BigInt(selectedPayments.length - 1) *
        BigInt("21000") *
        stats.averageGasPrice
      : BigInt(0);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 border-red-400";
      case "medium":
        return "text-yellow-400 border-yellow-400";
      case "low":
        return "text-green-400 border-green-400";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  return (
    <Card className={`glass border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Gas-Optimized Batch Processing
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batch Processing Settings</DialogTitle>
                <DialogDescription>
                  Configure automatic payment batching for gas optimization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="batch-enabled">Enable Batch Processing</Label>
                  <Switch
                    id="batch-enabled"
                    checked={settings.enabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    min="2"
                    max="50"
                    value={settings.batchSize}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        batchSize: parseInt(e.target.value) || 10,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="max-wait">Max Wait Time (minutes)</Label>
                  <Input
                    id="max-wait"
                    type="number"
                    min="5"
                    max="120"
                    value={settings.maxWaitTime}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maxWaitTime: parseInt(e.target.value) || 30,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-process">Auto Process</Label>
                  <Switch
                    id="auto-process"
                    checked={settings.autoProcess}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, autoProcess: checked }))
                    }
                  />
                </div>
                <Button
                  onClick={() => onUpdateSettings?.(settings)}
                  className="w-full"
                >
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Automatically batch payments to reduce gas costs and optimize
          efficiency
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Next Batch</span>
            </div>
            <p className="text-lg font-bold text-blue-400">
              {formatTime(timeUntilBatch)}
            </p>
          </div>

          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Pending Value</span>
            </div>
            <p className="text-lg font-bold text-green-400">
              {formatEther(stats.totalValue)} ETH
            </p>
          </div>

          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Gas Savings</span>
            </div>
            <p className="text-lg font-bold text-yellow-400">
              {formatEther(stats.estimatedGasSavings)} ETH
            </p>
          </div>

          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-400">Batch Size</span>
            </div>
            <p className="text-lg font-bold text-orange-400">
              {stats.batchSize}
            </p>
          </div>
        </div>

        {/* Batch Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Batch Progress</span>
            <span className="text-sm text-gray-400">
              {pendingPayments.length} / {stats.batchSize} payments
            </span>
          </div>
          <Progress
            value={(pendingPayments.length / stats.batchSize) * 100}
            className="h-2"
          />
        </div>

        <Separator />

        {/* Pending Payments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Pending Payments</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                {selectedPayments.length === pendingPayments.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button
                size="sm"
                onClick={handleProcessBatch}
                disabled={selectedPayments.length === 0 || isProcessing}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Process Selected ({selectedPayments.length})
                  </>
                )}
              </Button>
            </div>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending payments</p>
              <p className="text-sm">
                Payments will appear here when ready for batching
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPayments.includes(payment.id)
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-gray-800/30 border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => handlePaymentToggle(payment.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment.id)}
                    onChange={() => handlePaymentToggle(payment.id)}
                    className="rounded"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white text-sm">
                        {payment.contentTitle}
                      </p>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(payment.priority)}
                      >
                        {payment.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      To:{" "}
                      {payment.recipientName ||
                        payment.recipient.slice(0, 8) + "..."}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-white">
                      {formatEther(payment.amount)} ETH
                    </p>
                    <p className="text-xs text-gray-400">
                      {payment.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Batch Summary */}
        {selectedPayments.length > 0 && (
          <>
            <Separator />
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-medium text-yellow-400 mb-3">
                Selected Batch Summary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total Payments</p>
                  <p className="text-lg font-bold text-white">
                    {selectedPayments.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-lg font-bold text-white">
                    {formatEther(selectedValue)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estimated Gas Savings</p>
                  <p className="text-lg font-bold text-green-400">
                    {formatEther(estimatedGasSavings)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Processing Time</p>
                  <p className="text-lg font-bold text-white">~30s</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Status Alerts */}
        {!settings.enabled && (
          <Alert className="border-orange-500/50 bg-orange-500/10">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-400">
              Batch processing is disabled. Payments will be processed
              individually.
            </AlertDescription>
          </Alert>
        )}

        {stats.averageGasPrice > settings.gasThreshold && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              Gas prices are high ({formatEther(stats.averageGasPrice)} gwei).
              Consider waiting for lower prices.
            </AlertDescription>
          </Alert>
        )}

        {pendingPayments.length >= stats.batchSize && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Batch is ready for processing! Maximum gas savings available.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
