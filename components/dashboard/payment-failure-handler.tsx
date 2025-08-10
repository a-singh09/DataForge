"use client";

import { useState } from "react";
import { formatEther } from "viem";
import {
  AlertTriangle,
  RefreshCw,
  Clock,
  XCircle,
  CheckCircle,
  Settings,
  Play,
  Trash2,
  Info,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FailedPayment {
  id: string;
  tokenId: bigint;
  contentTitle: string;
  amount: bigint;
  recipient: string;
  recipientName?: string;
  originalAttempt: Date;
  lastRetry?: Date;
  nextRetry?: Date;
  retryCount: number;
  maxRetries: number;
  failureReason: string;
  errorCode?: string;
  status: "failed" | "retrying" | "abandoned" | "manual_review";
  priority: "high" | "medium" | "low";
}

export interface RetrySettings {
  enabled: boolean;
  maxRetries: number;
  baseDelay: number; // minutes
  backoffMultiplier: number;
  maxDelay: number; // minutes
  retryOnGasPrice: boolean;
  maxGasPrice: bigint; // gwei
  retryOnNetworkError: boolean;
  retryOnInsufficientFunds: boolean;
}

interface PaymentFailureHandlerProps {
  failedPayments: FailedPayment[];
  retrySettings: RetrySettings;
  onRetryPayment?: (paymentId: string) => Promise<void>;
  onAbandonPayment?: (paymentId: string) => void;
  onUpdateSettings?: (settings: RetrySettings) => void;
  onManualReview?: (paymentId: string) => void;
  className?: string;
}

export default function PaymentFailureHandler({
  failedPayments,
  retrySettings,
  onRetryPayment,
  onAbandonPayment,
  onUpdateSettings,
  onManualReview,
  className = "",
}: PaymentFailureHandlerProps) {
  const [retryingPayments, setRetryingPayments] = useState<Set<string>>(
    new Set(),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] =
    useState<RetrySettings>(retrySettings);

  const handleRetryPayment = async (paymentId: string) => {
    if (!onRetryPayment) return;

    setRetryingPayments((prev) => new Set(prev).add(paymentId));
    try {
      await onRetryPayment(paymentId);
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setRetryingPayments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  };

  const handleSaveSettings = () => {
    onUpdateSettings?.(localSettings);
    setSettingsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "failed":
        return "text-red-400 border-red-400";
      case "retrying":
        return "text-yellow-400 border-yellow-400";
      case "abandoned":
        return "text-gray-400 border-gray-400";
      case "manual_review":
        return "text-purple-400 border-purple-400";
      default:
        return "text-gray-400 border-gray-400";
    }
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

  const getFailureReasonIcon = (reason: string) => {
    if (reason.includes("gas"))
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    if (reason.includes("network"))
      return <XCircle className="h-4 w-4 text-red-400" />;
    if (reason.includes("funds"))
      return <AlertTriangle className="h-4 w-4 text-orange-400" />;
    return <AlertTriangle className="h-4 w-4 text-gray-400" />;
  };

  const calculateRetryProgress = (payment: FailedPayment) => {
    return (payment.retryCount / payment.maxRetries) * 100;
  };

  const formatNextRetry = (nextRetry?: Date) => {
    if (!nextRetry) return "N/A";
    const now = new Date();
    const diff = nextRetry.getTime() - now.getTime();
    if (diff <= 0) return "Ready";

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const activeFailures = failedPayments.filter(
    (p) => p.status === "failed" || p.status === "retrying",
  );
  const reviewRequired = failedPayments.filter(
    (p) => p.status === "manual_review",
  );
  const abandoned = failedPayments.filter((p) => p.status === "abandoned");

  return (
    <TooltipProvider>
      <Card className={`glass border-gray-800 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Payment Failure Handling
            </div>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Retry Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Retry Configuration</DialogTitle>
                  <DialogDescription>
                    Configure automatic retry behavior for failed payments
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="retry-enabled">Enable Auto Retry</Label>
                    <Switch
                      id="retry-enabled"
                      checked={localSettings.enabled}
                      onCheckedChange={(checked) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          enabled: checked,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-retries">Maximum Retries</Label>
                    <Input
                      id="max-retries"
                      type="number"
                      min="1"
                      max="10"
                      value={localSettings.maxRetries}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          maxRetries: parseInt(e.target.value) || 3,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="base-delay">Base Delay (minutes)</Label>
                    <Input
                      id="base-delay"
                      type="number"
                      min="1"
                      value={localSettings.baseDelay}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          baseDelay: parseInt(e.target.value) || 5,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="backoff-multiplier">
                      Backoff Multiplier
                    </Label>
                    <Input
                      id="backoff-multiplier"
                      type="number"
                      step="0.1"
                      min="1"
                      value={localSettings.backoffMultiplier}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          backoffMultiplier: parseFloat(e.target.value) || 2,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-delay">Maximum Delay (minutes)</Label>
                    <Input
                      id="max-delay"
                      type="number"
                      min="1"
                      value={localSettings.maxDelay}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          maxDelay: parseInt(e.target.value) || 60,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-gas-price">
                      Max Gas Price for Retry (Gwei)
                    </Label>
                    <Input
                      id="max-gas-price"
                      type="number"
                      min="1"
                      value={Number(localSettings.maxGasPrice) / 1e9}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          maxGasPrice: BigInt(
                            (parseFloat(e.target.value) || 50) * 1e9,
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="retry-gas">Retry on High Gas</Label>
                      <Switch
                        id="retry-gas"
                        checked={localSettings.retryOnGasPrice}
                        onCheckedChange={(checked) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            retryOnGasPrice: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="retry-network">
                        Retry on Network Error
                      </Label>
                      <Switch
                        id="retry-network"
                        checked={localSettings.retryOnNetworkError}
                        onCheckedChange={(checked) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            retryOnNetworkError: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="retry-funds">
                        Retry on Insufficient Funds
                      </Label>
                      <Switch
                        id="retry-funds"
                        checked={localSettings.retryOnInsufficientFunds}
                        onCheckedChange={(checked) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            retryOnInsufficientFunds: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings} className="w-full">
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Automatic retry logic and failure recovery for payment processing
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">Active Failures</span>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {activeFailures.length}
              </p>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Retrying</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                {failedPayments.filter((p) => p.status === "retrying").length}
              </p>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-400">Manual Review</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {reviewRequired.length}
              </p>
            </div>

            <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Abandoned</span>
              </div>
              <p className="text-2xl font-bold text-gray-400">
                {abandoned.length}
              </p>
            </div>
          </div>

          {/* Settings Status */}
          {!retrySettings.enabled && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-400">
                Automatic retry is disabled. Failed payments will require manual
                intervention.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Failed Payments List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Failed Payments</h3>

            {failedPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No failed payments</p>
                <p className="text-sm">
                  All payments are processing successfully
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {failedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getFailureReasonIcon(payment.failureReason)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white">
                              {payment.contentTitle}
                            </h4>
                            <Badge
                              variant="outline"
                              className={getStatusColor(payment.status)}
                            >
                              {payment.status.replace("_", " ")}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getPriorityColor(payment.priority)}
                            >
                              {payment.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            To:{" "}
                            {payment.recipientName ||
                              payment.recipient.slice(0, 8) + "..."}
                          </p>
                          <p className="text-sm text-red-400 mb-2">
                            {payment.failureReason}
                            {payment.errorCode && (
                              <span className="text-gray-500">
                                {" "}
                                ({payment.errorCode})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-white mb-1">
                          {formatEther(payment.amount)} ETH
                        </p>
                        <p className="text-xs text-gray-400">
                          Failed: {payment.originalAttempt.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Retry Progress */}
                    {payment.status === "retrying" && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-400">
                            Retry Progress
                          </span>
                          <span className="text-sm text-gray-400">
                            {payment.retryCount} / {payment.maxRetries}
                          </span>
                        </div>
                        <Progress
                          value={calculateRetryProgress(payment)}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Retry Info */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-gray-400">Retry Count</p>
                        <p className="text-white">
                          {payment.retryCount} / {payment.maxRetries}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Next Retry</p>
                        <p className="text-white">
                          {formatNextRetry(payment.nextRetry)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Last Attempt</p>
                        <p className="text-white">
                          {payment.lastRetry?.toLocaleTimeString() || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-white capitalize">
                          {payment.status.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRetryPayment(payment.id)}
                        disabled={
                          retryingPayments.has(payment.id) ||
                          payment.status === "abandoned"
                        }
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        {retryingPayments.has(payment.id) ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Retry Now
                          </>
                        )}
                      </Button>

                      {payment.status !== "manual_review" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onManualReview?.(payment.id)}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAbandonPayment?.(payment.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Abandon
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Retry Strategy Info */}
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Current Retry Strategy
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-400">
              <div>
                <p>Max Retries: {retrySettings.maxRetries}</p>
                <p>Base Delay: {retrySettings.baseDelay}m</p>
              </div>
              <div>
                <p>Backoff: {retrySettings.backoffMultiplier}x</p>
                <p>Max Delay: {retrySettings.maxDelay}m</p>
              </div>
              <div>
                <p>Gas Retry: {retrySettings.retryOnGasPrice ? "Yes" : "No"}</p>
                <p>
                  Network Retry:{" "}
                  {retrySettings.retryOnNetworkError ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p>
                  Funds Retry:{" "}
                  {retrySettings.retryOnInsufficientFunds ? "Yes" : "No"}
                </p>
                <p>Max Gas: {Number(retrySettings.maxGasPrice) / 1e9} gwei</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
