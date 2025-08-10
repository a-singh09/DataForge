"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  User,
  FileText,
  TrendingUp,
  RefreshCw,
  Bell,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { toast } from "@/components/ui/use-toast";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { formatEther } from "viem";
import { DateRange } from "react-day-picker";

interface Transaction {
  id: string;
  type: "license_purchase" | "royalty_payment" | "license_renewal" | "refund";
  tokenId: string;
  contentTitle: string;
  buyer: string;
  amount: bigint;
  currency: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
  txHash?: string;
  gasUsed?: bigint;
  gasFee?: bigint;
  duration?: number;
  royaltyRate?: number;
}

const transactionTypes = {
  license_purchase: {
    label: "License Purchase",
    icon: ArrowDownRight,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  royalty_payment: {
    label: "Royalty Payment",
    icon: DollarSign,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  license_renewal: {
    label: "License Renewal",
    icon: RefreshCw,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  refund: {
    label: "Refund",
    icon: ArrowUpRight,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
};

const statusConfig = {
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-400",
    variant: "default" as const,
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-400",
    variant: "secondary" as const,
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-400",
    variant: "destructive" as const,
  },
};

export default function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortBy, setSortBy] = useState<"timestamp" | "amount">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [notifications, setNotifications] = useState<Transaction[]>([]);

  const { licensingActivity, uploads, isLoading, error, refetchAll } =
    useCreatorAnalytics();

  // Generate mock transaction data based on licensing activity
  const generateTransactions = (): Transaction[] => {
    if (!licensingActivity || !uploads) return [];

    const transactions: Transaction[] = [];

    licensingActivity.forEach((activity, index) => {
      const upload = uploads.find((u) => u.tokenId === activity.tokenId);

      // Main license purchase transaction
      transactions.push({
        id: `tx-${activity.tokenId}-${activity.timestamp}-${index}`,
        type: "license_purchase",
        tokenId: activity.tokenId,
        contentTitle: upload?.title || `Token #${activity.tokenId}`,
        buyer: activity.buyer,
        amount: activity.price,
        currency: "ETH",
        timestamp: activity.timestamp,
        status: activity.status === "active" ? "completed" : "failed",
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gasUsed: BigInt(Math.floor(Math.random() * 100000) + 21000),
        gasFee: BigInt(
          Math.floor(Math.random() * 1000000000000000) + 1000000000000000,
        ),
        duration: activity.duration,
        royaltyRate: upload?.license.royaltyBps || 500,
      });

      // Add some royalty payments for older transactions
      if (activity.timestamp < Date.now() - 7 * 24 * 60 * 60 * 1000) {
        const royaltyAmount =
          (activity.price * BigInt(upload?.license.royaltyBps || 500)) /
          BigInt(10000);
        transactions.push({
          id: `royalty-${activity.tokenId}-${activity.timestamp}-${index}`,
          type: "royalty_payment",
          tokenId: activity.tokenId,
          contentTitle: upload?.title || `Token #${activity.tokenId}`,
          buyer: activity.buyer,
          amount: royaltyAmount,
          currency: "ETH",
          timestamp: activity.timestamp + 24 * 60 * 60 * 1000, // Next day
          status: "completed",
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          gasUsed: BigInt(Math.floor(Math.random() * 50000) + 21000),
          gasFee: BigInt(
            Math.floor(Math.random() * 500000000000000) + 500000000000000,
          ),
          royaltyRate: upload?.license.royaltyBps || 500,
        });
      }

      // Add some renewals for active licenses
      if (activity.status === "active" && Math.random() > 0.7) {
        transactions.push({
          id: `renewal-${activity.tokenId}-${activity.timestamp}-${index}`,
          type: "license_renewal",
          tokenId: activity.tokenId,
          contentTitle: upload?.title || `Token #${activity.tokenId}`,
          buyer: activity.buyer,
          amount: activity.price,
          currency: "ETH",
          timestamp: activity.timestamp + activity.duration * 1000,
          status: "completed",
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          gasUsed: BigInt(Math.floor(Math.random() * 80000) + 21000),
          gasFee: BigInt(
            Math.floor(Math.random() * 800000000000000) + 800000000000000,
          ),
          duration: activity.duration,
          royaltyRate: upload?.license.royaltyBps || 500,
        });
      }
    });

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  };

  const transactions = generateTransactions();

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.contentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;

    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const txDate = new Date(tx.timestamp);
      matchesDate = txDate >= dateRange.from && txDate <= dateRange.to;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "timestamp") {
      return sortOrder === "desc"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    } else {
      const aAmount = Number(formatEther(a.amount));
      const bAmount = Number(formatEther(b.amount));
      return sortOrder === "desc" ? bAmount - aAmount : aAmount - bAmount;
    }
  });

  // Real-time notifications simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new transactions
      if (Math.random() > 0.95 && transactions.length > 0) {
        const randomTx =
          transactions[
            Math.floor(Math.random() * Math.min(5, transactions.length))
          ];
        setNotifications((prev) => [randomTx, ...prev.slice(0, 4)]);

        toast({
          title: "New Transaction",
          description: `${transactionTypes[randomTx.type].label} for ${randomTx.contentTitle}`,
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [transactions]);

  const exportTransactions = (format: "csv" | "json") => {
    const dataToExport = sortedTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      content: tx.contentTitle,
      buyer: tx.buyer,
      amount: formatEther(tx.amount),
      currency: tx.currency,
      date: new Date(tx.timestamp).toISOString(),
      status: tx.status,
      txHash: tx.txHash,
      gasUsed: tx.gasUsed ? tx.gasUsed.toString() : "",
      gasFee: tx.gasFee ? formatEther(tx.gasFee) : "",
    }));

    if (format === "csv") {
      const headers = Object.keys(dataToExport[0] || {});
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers.map((header) => row[header as keyof typeof row]).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Export Complete",
      description: `Transactions exported as ${format.toUpperCase()}`,
    });
  };

  const getTotalVolume = () => {
    return filteredTransactions.reduce(
      (sum, tx) => sum + Number(formatEther(tx.amount)),
      0,
    );
  };

  const getTransactionCount = (type: string) => {
    return filteredTransactions.filter((tx) => tx.type === type).length;
  };

  if (isLoading) {
    return (
      <Card className="glass border-gray-800 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass border-red-800">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">
              Failed to load transaction history
            </p>
            <Button onClick={refetchAll} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-400" />
            <div>
              <CardTitle>Transaction History & Financial Records</CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Detailed transaction log with real-time notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                      {notifications.length}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 font-medium text-sm">
                    Recent Transactions
                  </div>
                  <DropdownMenuSeparator />
                  {notifications.map((tx, index) => (
                    <DropdownMenuItem key={index} className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1 rounded ${transactionTypes[tx.type].bgColor}`}
                        >
                          {React.createElement(transactionTypes[tx.type].icon, {
                            className: `h-3 w-3 ${transactionTypes[tx.type].color}`,
                          })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {tx.contentTitle}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatEther(tx.amount)} ETH •{" "}
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportTransactions("csv")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportTransactions("json")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={refetchAll} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-sm text-gray-400">Total Volume</p>
            <p className="text-lg font-bold text-green-400">
              {getTotalVolume().toFixed(4)} ETH
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-sm text-gray-400">Purchases</p>
            <p className="text-lg font-bold text-blue-400">
              {getTransactionCount("license_purchase")}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-sm text-gray-400">Royalties</p>
            <p className="text-lg font-bold text-purple-400">
              {getTransactionCount("royalty_payment")}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-sm text-gray-400">Renewals</p>
            <p className="text-lg font-bold text-orange-400">
              {getTransactionCount("license_renewal")}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="license_purchase">License Purchase</SelectItem>
              <SelectItem value="royalty_payment">Royalty Payment</SelectItem>
              <SelectItem value="license_renewal">License Renewal</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split("-") as [
                "timestamp" | "amount",
                "asc" | "desc",
              ];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp-desc">Newest First</SelectItem>
              <SelectItem value="timestamp-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No transactions found</p>
            <p className="text-sm text-gray-500">
              {transactions.length === 0
                ? "Transactions will appear here once your content gets licensed"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gas</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((tx) => {
                const typeConfig = transactionTypes[tx.type];
                const statusConf = statusConfig[tx.status];
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConf.icon;

                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                          <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {typeConfig.label}
                          </p>
                          <p className="text-sm text-gray-400 font-mono">
                            {tx.id.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">
                          {tx.contentTitle}
                        </p>
                        <p className="text-sm text-gray-400">
                          Token #{tx.tokenId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm">
                          {tx.buyer.slice(0, 6)}...{tx.buyer.slice(-4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-green-400">
                          {Number(formatEther(tx.amount)).toFixed(4)}{" "}
                          {tx.currency}
                        </p>
                        {tx.royaltyRate && (
                          <p className="text-xs text-gray-400">
                            {tx.royaltyRate / 100}% royalty
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusConf.variant}
                        className="flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConf.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.gasFee && (
                        <div>
                          <p className="text-sm">
                            {Number(formatEther(tx.gasFee)).toFixed(6)} ETH
                          </p>
                          <p className="text-xs text-gray-400">
                            {tx.gasUsed?.toString()} gas
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {tx.txHash && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
