"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLicensing, LicenseStatus } from "@/hooks/useLicensing";

interface LicenseStatusProps {
  tokenId: bigint;
  userAddress?: string;
  onRenewClick?: () => void;
  showRenewButton?: boolean;
  className?: string;
}

export default function LicenseStatusComponent({
  tokenId,
  userAddress,
  onRenewClick,
  showRenewButton = true,
  className = "",
}: LicenseStatusProps) {
  const { checkAccess, isLoading } = useLicensing();
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const status = await checkAccess(tokenId, userAddress);
      setLicenseStatus(status);
    } catch (error) {
      console.error("Failed to refresh license status:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [tokenId, userAddress]);

  if (isLoading || isRefreshing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Checking access...</span>
      </div>
    );
  }

  if (!licenseStatus) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <XCircle className="h-4 w-4 text-red-400" />
        <span className="text-sm text-red-400">Unable to check access</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshStatus}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const getStatusDisplay = () => {
    if (licenseStatus.hasAccess && !licenseStatus.isExpired) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-400" />,
        badge: (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Active
          </Badge>
        ),
        message: licenseStatus.expiryDate
          ? `Expires ${formatDistanceToNow(licenseStatus.expiryDate, { addSuffix: true })}`
          : "Access granted",
        variant: "success" as const,
      };
    }

    if (licenseStatus.isExpired && licenseStatus.expiryDate) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
        badge: (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Expired
          </Badge>
        ),
        message: `Expired ${formatDistanceToNow(licenseStatus.expiryDate, { addSuffix: true })}`,
        variant: "warning" as const,
      };
    }

    return {
      icon: <XCircle className="h-4 w-4 text-red-400" />,
      badge: (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          No Access
        </Badge>
      ),
      message: "License required to access this dataset",
      variant: "error" as const,
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-white">License Status</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshStatus}
            className="h-6 w-6 p-0"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        {statusDisplay.badge}
      </div>

      {/* Status Details */}
      <Alert
        className={`
          ${statusDisplay.variant === "success" ? "border-green-500/50 bg-green-500/10" : ""}
          ${statusDisplay.variant === "warning" ? "border-yellow-500/50 bg-yellow-500/10" : ""}
          ${statusDisplay.variant === "error" ? "border-red-500/50 bg-red-500/10" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          {statusDisplay.icon}
          <AlertDescription
            className={`
              ${statusDisplay.variant === "success" ? "text-green-400" : ""}
              ${statusDisplay.variant === "warning" ? "text-yellow-400" : ""}
              ${statusDisplay.variant === "error" ? "text-red-400" : ""}
            `}
          >
            {statusDisplay.message}
          </AlertDescription>
        </div>
      </Alert>

      {/* Days Remaining Warning */}
      {licenseStatus.hasAccess &&
        licenseStatus.daysRemaining !== undefined &&
        licenseStatus.daysRemaining <= 7 &&
        licenseStatus.daysRemaining > 0 && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <Clock className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              Your license expires in {licenseStatus.daysRemaining} day
              {licenseStatus.daysRemaining !== 1 ? "s" : ""}. Consider renewing
              to maintain access.
            </AlertDescription>
          </Alert>
        )}

      {/* Renew Button */}
      {showRenewButton &&
        (licenseStatus.isExpired ||
          (licenseStatus.daysRemaining && licenseStatus.daysRemaining <= 7)) &&
        onRenewClick && (
          <Button
            onClick={onRenewClick}
            className="w-full bg-orange-500 hover:bg-orange-600"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Renew License
          </Button>
        )}
    </div>
  );
}
