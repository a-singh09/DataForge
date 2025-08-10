"use client";

import { useState, useEffect } from "react";
import { formatEther } from "viem";
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Settings,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Timer,
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

export interface PaymentSchedule {
  id: string;
  name: string;
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  enabled: boolean;
  nextRun: Date;
  lastRun?: Date;
  conditions: {
    minBatchSize: number;
    maxGasPrice: bigint; // in gwei
    minValue: bigint; // minimum total value to process
  };
  stats: {
    totalRuns: number;
    totalProcessed: bigint;
    gasSaved: bigint;
    successRate: number;
  };
}

export interface ScheduledPayment {
  id: string;
  scheduleId: string;
  amount: bigint;
  recipient: string;
  contentTitle: string;
  scheduledFor: Date;
  status: "pending" | "processing" | "completed" | "failed";
  retryCount: number;
}

interface PaymentSchedulerProps {
  schedules: PaymentSchedule[];
  scheduledPayments: ScheduledPayment[];
  onCreateSchedule?: (schedule: Omit<PaymentSchedule, "id" | "stats">) => void;
  onUpdateSchedule?: (id: string, updates: Partial<PaymentSchedule>) => void;
  onDeleteSchedule?: (id: string) => void;
  onRunSchedule?: (id: string) => Promise<void>;
  className?: string;
}

export default function PaymentScheduler({
  schedules,
  scheduledPayments,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onRunSchedule,
  className = "",
}: PaymentSchedulerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [runningSchedules, setRunningSchedules] = useState<Set<string>>(
    new Set(),
  );
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    frequency: "daily" as const,
    enabled: true,
    conditions: {
      minBatchSize: 5,
      maxGasPrice: BigInt("30000000000"), // 30 gwei
      minValue: BigInt("10000000000000000"), // 0.01 ETH
    },
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !onCreateSchedule) return;

    const schedule = {
      ...newSchedule,
      nextRun: calculateNextRun(newSchedule.frequency),
    };

    onCreateSchedule(schedule);
    setNewSchedule({
      name: "",
      frequency: "daily",
      enabled: true,
      conditions: {
        minBatchSize: 5,
        maxGasPrice: BigInt("30000000000"), // 30 gwei
        minValue: BigInt("10000000000000000"), // 0.01 ETH
      },
    });
    setIsCreating(false);
  };

  const handleRunSchedule = async (scheduleId: string) => {
    if (!onRunSchedule) return;

    setRunningSchedules((prev) => new Set(prev).add(scheduleId));
    try {
      await onRunSchedule(scheduleId);
    } catch (error) {
      console.error("Schedule run failed:", error);
    } finally {
      setRunningSchedules((prev) => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }
  };

  const calculateNextRun = (frequency: string): Date => {
    const now = new Date();
    switch (frequency) {
      case "hourly":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "monthly":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "hourly":
        return "text-red-400 border-red-400";
      case "daily":
        return "text-blue-400 border-blue-400";
      case "weekly":
        return "text-green-400 border-green-400";
      case "monthly":
        return "text-purple-400 border-purple-400";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 border-yellow-400";
      case "processing":
        return "text-blue-400 border-blue-400";
      case "completed":
        return "text-green-400 border-green-400";
      case "failed":
        return "text-red-400 border-red-400";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  const upcomingPayments = scheduledPayments
    .filter((p) => p.status === "pending")
    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
    .slice(0, 5);

  return (
    <Card className={`glass border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Payment Scheduling & Automation
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Payment Schedule</DialogTitle>
                <DialogDescription>
                  Set up automated payment processing with custom conditions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schedule-name">Schedule Name</Label>
                  <Input
                    id="schedule-name"
                    placeholder="e.g., Daily Batch Processing"
                    value={newSchedule.name}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newSchedule.frequency}
                    onValueChange={(value: any) =>
                      setNewSchedule((prev) => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="min-batch">Minimum Batch Size</Label>
                  <Input
                    id="min-batch"
                    type="number"
                    min="1"
                    value={newSchedule.conditions.minBatchSize}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          minBatchSize: parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="max-gas">Max Gas Price (Gwei)</Label>
                  <Input
                    id="max-gas"
                    type="number"
                    min="1"
                    value={Number(newSchedule.conditions.maxGasPrice) / 1e9}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          maxGasPrice: BigInt(
                            (parseFloat(e.target.value) || 30) * 1e9,
                          ),
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="min-value">Minimum Total Value (ETH)</Label>
                  <Input
                    id="min-value"
                    type="number"
                    step="0.001"
                    min="0"
                    value={Number(formatEther(newSchedule.conditions.minValue))}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          minValue: BigInt(
                            (parseFloat(e.target.value) || 0.01) * 1e18,
                          ),
                        },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">Enable Schedule</Label>
                  <Switch
                    id="enabled"
                    checked={newSchedule.enabled}
                    onCheckedChange={(checked) =>
                      setNewSchedule((prev) => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSchedule}
                    disabled={!newSchedule.name}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    Create Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Automate payment processing with intelligent scheduling and conditions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Schedules */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Active Schedules</h3>

          {schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment schedules configured</p>
              <p className="text-sm">
                Create a schedule to automate payment processing
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-white">
                        {schedule.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className={getFrequencyColor(schedule.frequency)}
                      >
                        {schedule.frequency}
                      </Badge>
                      {schedule.enabled ? (
                        <Badge
                          variant="outline"
                          className="text-green-400 border-green-400"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-gray-400 border-gray-400"
                        >
                          Paused
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRunSchedule(schedule.id)}
                        disabled={runningSchedules.has(schedule.id)}
                      >
                        {runningSchedules.has(schedule.id) ? (
                          <Timer className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onUpdateSchedule?.(schedule.id, {
                            enabled: !schedule.enabled,
                          })
                        }
                      >
                        {schedule.enabled ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(schedule.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteSchedule?.(schedule.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Next Run</p>
                      <p className="text-sm font-medium text-white">
                        {schedule.nextRun.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Runs</p>
                      <p className="text-sm font-medium text-white">
                        {schedule.stats.totalRuns}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Processed</p>
                      <p className="text-sm font-medium text-white">
                        {formatEther(schedule.stats.totalProcessed)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Success Rate</p>
                      <p className="text-sm font-medium text-white">
                        {schedule.stats.successRate}%
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    Conditions: Min {schedule.conditions.minBatchSize} payments,
                    Max {Number(schedule.conditions.maxGasPrice) / 1e9} gwei,
                    Min {formatEther(schedule.conditions.minValue)} ETH
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Upcoming Payments */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">
            Upcoming Scheduled Payments
          </h3>

          {upcomingPayments.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming scheduled payments</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-white text-sm">
                        {payment.contentTitle}
                      </p>
                      <p className="text-xs text-gray-400">
                        To: {payment.recipient.slice(0, 8)}...
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(payment.status)}
                    >
                      {payment.status}
                    </Badge>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-white text-sm">
                      {formatEther(payment.amount)} ETH
                    </p>
                    <p className="text-xs text-gray-400">
                      {payment.scheduledFor.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="p-3 bg-gray-800/30 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Automation Status
          </h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">
                {schedules.filter((s) => s.enabled).length} Active Schedules
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">
                {scheduledPayments.filter((p) => p.status === "pending").length}{" "}
                Pending Payments
              </span>
            </div>
            {scheduledPayments.some((p) => p.status === "failed") && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">
                  {
                    scheduledPayments.filter((p) => p.status === "failed")
                      .length
                  }{" "}
                  Failed Payments
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
