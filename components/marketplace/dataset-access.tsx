"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Key,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLicensing, LicenseStatus } from "@/hooks/useLicensing";
import { useAuth } from "@/hooks/useAuth";
import { IpNFTMetadata } from "@/types/marketplace";
import { toast } from "@/hooks/use-toast";

interface DatasetAccessProps {
  dataset: IpNFTMetadata;
  onRenewLicense?: () => void;
}

export default function DatasetAccess({
  dataset,
  onRenewLicense,
}: DatasetAccessProps) {
  const { origin } = useAuth();
  const { checkAccess, isLoading } = useLicensing();
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(
    null,
  );
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check access status on component mount and when dataset changes
  useEffect(() => {
    const checkLicenseStatus = async () => {
      if (!origin) return;

      try {
        const status = await checkAccess(dataset.tokenId);
        setLicenseStatus(status);
      } catch (error) {
        console.error("Failed to check license status:", error);
      }
    };

    checkLicenseStatus();
  }, [dataset.tokenId, origin, checkAccess]);

  /**
   * Generate access token for authenticated downloads
   */
  const generateAccessToken = async () => {
    if (!origin || !licenseStatus?.hasAccess) {
      toast({
        title: "Access Denied",
        description: "You need a valid license to generate an access token.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingToken(true);

    try {
      // In a real implementation, this would call a backend API to generate a JWT token
      // For now, we'll simulate token generation using the user's wallet signature
      const message = `Generate access token for dataset ${dataset.tokenId} at ${Date.now()}`;

      // This would typically be handled by a backend service that verifies the license
      // and generates a secure JWT token with appropriate claims
      const mockToken = btoa(
        JSON.stringify({
          tokenId: dataset.tokenId.toString(),
          userAddress: "authenticated_user",
          timestamp: Date.now(),
          expiresAt: licenseStatus.expiryDate?.getTime(),
        }),
      );

      setAccessToken(mockToken);

      toast({
        title: "Access Token Generated",
        description: "You can now download the dataset using this token.",
      });
    } catch (error: any) {
      console.error("Failed to generate access token:", error);
      toast({
        title: "Token Generation Failed",
        description: error.message || "Failed to generate access token.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  /**
   * Download dataset using access token
   */
  const downloadDataset = async () => {
    if (!accessToken || !licenseStatus?.hasAccess) {
      toast({
        title: "Download Failed",
        description: "Valid access token required for download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      // In a real implementation, this would make an authenticated request to download the dataset
      // The backend would verify the access token and serve the content

      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, we'll create a mock download
      const blob = new Blob(
        [
          `Dataset: ${dataset.title}\nContent Hash: ${dataset.contentHash}\nAccess Token: ${accessToken}`,
        ],
        {
          type: "text/plain",
        },
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dataset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_dataset.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${dataset.title}...`,
      });
    } catch (error: any) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download dataset.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-400">Checking access...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!licenseStatus) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to verify access status. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-orange-400" />
          Dataset Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Access Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Access Status</span>
          {licenseStatus.hasAccess ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              No Access
            </Badge>
          )}
        </div>

        {/* Expiry Information */}
        {licenseStatus.expiryDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">License Expires</span>
            <span className="text-sm text-white">
              {licenseStatus.expiryDate.toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Days Remaining */}
        {licenseStatus.daysRemaining !== undefined &&
          licenseStatus.daysRemaining > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Days Remaining</span>
              <span
                className={`text-sm font-medium ${
                  licenseStatus.daysRemaining <= 7
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {licenseStatus.daysRemaining}
              </span>
            </div>
          )}

        <Separator />

        {/* Access Actions */}
        {licenseStatus.hasAccess ? (
          <div className="space-y-3">
            {/* Generate Access Token */}
            <Button
              onClick={generateAccessToken}
              disabled={isGeneratingToken}
              className="w-full"
              variant="outline"
            >
              {isGeneratingToken ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Token...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Generate Access Token
                </>
              )}
            </Button>

            {/* Download Dataset */}
            {accessToken && (
              <Button
                onClick={downloadDataset}
                disabled={isDownloading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Dataset
                  </>
                )}
              </Button>
            )}

            {/* Renewal Warning */}
            {licenseStatus.daysRemaining !== undefined &&
              licenseStatus.daysRemaining <= 7 &&
              licenseStatus.daysRemaining > 0 && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-400">
                    Your license expires in {licenseStatus.daysRemaining} day
                    {licenseStatus.daysRemaining !== 1 ? "s" : ""}.
                    {onRenewLicense && (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-yellow-400 underline ml-1"
                        onClick={onRenewLicense}
                      >
                        Renew now
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need a valid license to access this dataset.
              {licenseStatus.isExpired && " Your previous license has expired."}
            </AlertDescription>
          </Alert>
        )}

        {/* Access Token Display */}
        {accessToken && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Access Token</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(accessToken);
                  toast({ title: "Token copied to clipboard" });
                }}
                className="h-6 text-xs"
              >
                Copy
              </Button>
            </div>
            <code className="text-xs text-gray-300 break-all">
              {accessToken.slice(0, 50)}...
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
