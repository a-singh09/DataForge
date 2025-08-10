"use client";

import { useState, useEffect } from "react";
import { formatEther } from "viem";
import {
  Plus,
  Trash2,
  Users,
  Edit3,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export interface CreatorSplit {
  id: string;
  address: string;
  name?: string;
  percentage: number;
  verified?: boolean;
}

interface MultiCreatorSplitsProps {
  tokenId?: bigint;
  currentSplits: CreatorSplit[];
  onSplitsChange: (splits: CreatorSplit[]) => void;
  totalRevenue?: bigint;
  isEditable?: boolean;
  className?: string;
}

export default function MultiCreatorSplits({
  tokenId,
  currentSplits,
  onSplitsChange,
  totalRevenue = BigInt(0),
  isEditable = true,
  className = "",
}: MultiCreatorSplitsProps) {
  const [splits, setSplits] = useState<CreatorSplit[]>(currentSplits);
  const [isAddingCreator, setIsAddingCreator] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCreator, setNewCreator] = useState({
    address: "",
    name: "",
    percentage: 0,
  });

  useEffect(() => {
    setSplits(currentSplits);
  }, [currentSplits]);

  const totalPercentage = splits.reduce(
    (sum, split) => sum + split.percentage,
    0,
  );
  const isValidSplit = totalPercentage === 100;
  const remainingPercentage = 100 - totalPercentage;

  const handleAddCreator = () => {
    if (!newCreator.address || newCreator.percentage <= 0) return;

    const creator: CreatorSplit = {
      id: Date.now().toString(),
      address: newCreator.address,
      name: newCreator.name || undefined,
      percentage: newCreator.percentage,
    };

    const updatedSplits = [...splits, creator];
    setSplits(updatedSplits);
    onSplitsChange(updatedSplits);

    // Reset form
    setNewCreator({ address: "", name: "", percentage: 0 });
    setIsAddingCreator(false);
  };

  const handleRemoveCreator = (id: string) => {
    const updatedSplits = splits.filter((split) => split.id !== id);
    setSplits(updatedSplits);
    onSplitsChange(updatedSplits);
  };

  const handleUpdateCreator = (id: string, updates: Partial<CreatorSplit>) => {
    const updatedSplits = splits.map((split) =>
      split.id === id ? { ...split, ...updates } : split,
    );
    setSplits(updatedSplits);
    onSplitsChange(updatedSplits);
    setEditingId(null);
  };

  const calculateCreatorAmount = (percentage: number): bigint => {
    if (totalRevenue === BigInt(0)) return BigInt(0);
    // 95% goes to creators, 5% to platform
    const creatorShare = (totalRevenue * BigInt(95)) / BigInt(100);
    return (
      (creatorShare * BigInt(Math.floor(percentage * 100))) / BigInt(10000)
    );
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 50) return "text-green-400 border-green-400";
    if (percentage >= 25) return "text-yellow-400 border-yellow-400";
    return "text-blue-400 border-blue-400";
  };

  return (
    <Card className={`glass border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Multi-Creator Revenue Splits
          </div>
          {isEditable && (
            <Dialog open={isAddingCreator} onOpenChange={setIsAddingCreator}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Creator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Creator to Revenue Split</DialogTitle>
                  <DialogDescription>
                    Add a new creator to share revenue from this content
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="creator-address">Wallet Address *</Label>
                    <Input
                      id="creator-address"
                      placeholder="0x..."
                      value={newCreator.address}
                      onChange={(e) =>
                        setNewCreator({
                          ...newCreator,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="creator-name">
                      Display Name (Optional)
                    </Label>
                    <Input
                      id="creator-name"
                      placeholder="Creator name"
                      value={newCreator.name}
                      onChange={(e) =>
                        setNewCreator({ ...newCreator, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="creator-percentage">
                      Percentage Share * (Remaining: {remainingPercentage}%)
                    </Label>
                    <Input
                      id="creator-percentage"
                      type="number"
                      min="0"
                      max={remainingPercentage}
                      placeholder="0"
                      value={newCreator.percentage || ""}
                      onChange={(e) =>
                        setNewCreator({
                          ...newCreator,
                          percentage: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingCreator(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddCreator}
                      disabled={
                        !newCreator.address ||
                        newCreator.percentage <= 0 ||
                        newCreator.percentage > remainingPercentage
                      }
                      className="flex-1 bg-purple-500 hover:bg-purple-600"
                    >
                      Add Creator
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
        <CardDescription>
          Configure revenue sharing between multiple creators
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Validation Alert */}
        {!isValidSplit && splits.length > 0 && (
          <Alert variant={totalPercentage > 100 ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {totalPercentage > 100
                ? `Total percentage exceeds 100% (currently ${totalPercentage}%)`
                : `Total percentage is ${totalPercentage}%. Remaining: ${remainingPercentage}%`}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Splits */}
        {splits.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No creators added yet</p>
            <p className="text-sm">
              Add creators to split revenue automatically
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {splits.map((split) => (
              <div
                key={split.id}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {split.name ? split.name.charAt(0).toUpperCase() : "?"}
                  </div>

                  <div className="flex-1">
                    {editingId === split.id ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Display name"
                          defaultValue={split.name || ""}
                          className="h-8"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateCreator(split.id, {
                                name: e.currentTarget.value,
                              });
                            }
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Percentage"
                          defaultValue={split.percentage}
                          className="h-8 w-24"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateCreator(split.id, {
                                percentage:
                                  parseInt(e.currentTarget.value) || 0,
                              });
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">
                            {split.name || "Unnamed Creator"}
                          </p>
                          {split.verified && (
                            <Badge
                              variant="outline"
                              className="text-green-400 border-green-400"
                            >
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {split.address.slice(0, 8)}...
                          {split.address.slice(-6)}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={getPercentageColor(split.percentage)}
                    >
                      {split.percentage}%
                    </Badge>
                    {totalRevenue > BigInt(0) && (
                      <p className="text-sm text-gray-400 mt-1">
                        {formatEther(calculateCreatorAmount(split.percentage))}{" "}
                        ETH
                      </p>
                    )}
                  </div>

                  {isEditable && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(split.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveCreator(split.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {splits.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="font-medium text-gray-300">
                Total Distribution
              </span>
              <div className="text-right">
                <Badge
                  variant="outline"
                  className={
                    isValidSplit
                      ? "text-green-400 border-green-400"
                      : "text-red-400 border-red-400"
                  }
                >
                  {totalPercentage}%
                </Badge>
                {totalRevenue > BigInt(0) && (
                  <p className="text-sm text-gray-400 mt-1">
                    {formatEther((totalRevenue * BigInt(95)) / BigInt(100))} ETH
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="p-3 bg-gray-800/30 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            How it works
          </h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Revenue is automatically split based on percentages</li>
            <li>• Payments are processed when licenses are purchased</li>
            <li>• All creators receive payments simultaneously</li>
            <li>• Splits can be updated before content goes live</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
