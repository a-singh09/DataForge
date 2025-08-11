"use client";

import { useState, useEffect } from "react";
import { Download, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
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
  const [isDownloading, setIsDownloading] = useState(false);

  // Check access status on component mount and when dataset changes
  useEffect(() => {
    const checkLicenseStatus = async () => {
      if (!origin) {
        console.log("No origin SDK available");
        return;
      }

      try {
        // Try to get the wallet address from the provider
        let userAddress: string | undefined;

        try {
          // Get the current accounts from the provider
          if (window.ethereum) {
            console.log("Getting accounts from window.ethereum...");
            const accounts = await window.ethereum.request({
              method: "eth_accounts",
            });
            console.log("Accounts from provider:", accounts);
            if (accounts && accounts.length > 0) {
              userAddress = accounts[0];
              console.log("Using wallet address:", userAddress);
            } else {
              console.log("No accounts found in provider");
            }
          } else {
            console.log("window.ethereum not available");
          }
        } catch (error) {
          console.warn("Could not get wallet address from provider:", error);
        }

        if (!userAddress) {
          console.log("No wallet address available, cannot check access");
          setLicenseStatus({
            hasAccess: false,
            isExpired: true,
          });
          return;
        }

        console.log(
          `About to check access for token ${dataset.tokenId} with address ${userAddress}`,
        );
        const status = await checkAccess(dataset.tokenId, userAddress);
        console.log("License status check result:", status);
        setLicenseStatus(status);
      } catch (error) {
        console.error("Failed to check license status:", error);
      }
    };

    checkLicenseStatus();
  }, [dataset.tokenId, origin, checkAccess]);

  // Manual refresh function
  const refreshLicenseStatus = async () => {
    if (!origin) return;

    try {
      // Try to get the wallet address from the provider
      let userAddress: string | undefined;

      try {
        // Get the current accounts from the provider
        if (window.ethereum) {
          console.log(
            "Manual refresh: Getting accounts from window.ethereum...",
          );
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          console.log("Manual refresh: Accounts from provider:", accounts);
          if (accounts && accounts.length > 0) {
            userAddress = accounts[0];
            console.log("Manual refresh: Using wallet address:", userAddress);
          }
        }
      } catch (error) {
        console.warn("Could not get wallet address from provider:", error);
      }

      if (!userAddress) {
        console.log("Manual refresh: No wallet address available");
        toast({
          title: "Refresh Failed",
          description: "No wallet address available.",
          variant: "destructive",
        });
        return;
      }

      console.log(
        `Manual refresh: About to check access for token ${dataset.tokenId} with address ${userAddress}`,
      );
      const status = await checkAccess(dataset.tokenId, userAddress);
      console.log("Manual license status refresh result:", status);
      setLicenseStatus(status);
      toast({
        title: "Status Refreshed",
        description: "License status has been updated.",
      });
    } catch (error) {
      console.error("Failed to refresh license status:", error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh license status.",
        variant: "destructive",
      });
    }
  };

  /**
   * Download dataset directly (no access token needed)
   */
  const downloadDataset = async () => {
    if (!licenseStatus?.hasAccess) {
      toast({
        title: "Download Failed",
        description: "You need a valid license to download this dataset.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Get the actual content URL with multiple IPFS gateway fallbacks
      let contentUrl = "";
      let fileName = "";
      let mimeType = "application/octet-stream";

      // List of IPFS gateways to try (in order of preference)
      const ipfsGateways = [
        "https://gateway.pinata.cloud/ipfs/",
        "https://cloudflare-ipfs.com/ipfs/",
        "https://ipfs.io/ipfs/",
        "https://dweb.link/ipfs/",
        "https://gateway.ipfs.io/ipfs/",
      ];

      let contentHash = "";

      // Get content hash from various sources
      if (dataset.contentHash) {
        contentHash = dataset.contentHash.startsWith("ipfs://")
          ? dataset.contentHash.replace("ipfs://", "")
          : dataset.contentHash;
      } else if (dataset.uri) {
        contentHash = dataset.uri.startsWith("ipfs://")
          ? dataset.uri.replace("ipfs://", "")
          : dataset.uri.startsWith("http")
            ? dataset.uri
            : dataset.uri;
      }

      // If we have a content hash, construct URLs with different gateways
      if (
        contentHash &&
        (contentHash.startsWith("Qm") || contentHash.startsWith("bafy"))
      ) {
        contentUrl = ipfsGateways[0] + contentHash; // Start with the first gateway
      } else if (contentHash.startsWith("http")) {
        contentUrl = contentHash; // Already a full URL
      }

      // Determine file extension and MIME type based on content type
      switch (dataset.contentType) {
        case "image":
          fileName = `${dataset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_dataset.jpg`;
          mimeType = "image/jpeg";
          break;
        case "audio":
          fileName = `${dataset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_dataset.mp3`;
          mimeType = "audio/mpeg";
          break;
        case "video":
          fileName = `${dataset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_dataset.mp4`;
          mimeType = "video/mp4";
          break;
        case "code":
          fileName = `${dataset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_dataset.json`;
          mimeType = "application/json";
          break;
        case "social":
        case "text":
        default:
          fileName = `${dataset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_dataset.txt`;
          mimeType = "text/plain";
          break;
      }

      if (contentUrl) {
        toast({
          title: "Download Started",
          description: `Fetching ${dataset.title} from IPFS...`,
        });

        let success = false;
        let lastError = null;

        // Try multiple IPFS gateways if the first one fails
        for (let i = 0; i < ipfsGateways.length && !success; i++) {
          try {
            const gatewayUrl = contentHash.startsWith("http")
              ? contentUrl
              : ipfsGateways[i] + contentHash;

            console.log(
              `Trying gateway ${i + 1}/${ipfsGateways.length}: ${gatewayUrl}`,
            );

            const response = await fetch(gatewayUrl, {
              method: "GET",
              headers: {
                Accept: "*/*",
              },
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`,
              );
            }

            // Get the content as blob
            const contentBlob = await response.blob();

            // Use the actual content type from the response if available
            let actualMimeType =
              response.headers.get("content-type") || mimeType;

            // If we got a generic content type, try to infer from the blob type
            if (
              actualMimeType === "application/octet-stream" ||
              actualMimeType === "text/plain"
            ) {
              actualMimeType = contentBlob.type || mimeType;
            }

            // Update filename extension based on actual content type
            if (actualMimeType.startsWith("image/")) {
              const ext = actualMimeType.split("/")[1] || "jpg";
              fileName = fileName.replace(/\.[^.]+$/, `.${ext}`);
            } else if (actualMimeType.startsWith("audio/")) {
              const ext = actualMimeType.split("/")[1] || "mp3";
              fileName = fileName.replace(/\.[^.]+$/, `.${ext}`);
            } else if (actualMimeType.startsWith("video/")) {
              const ext = actualMimeType.split("/")[1] || "mp4";
              fileName = fileName.replace(/\.[^.]+$/, `.${ext}`);
            } else if (actualMimeType === "application/json") {
              fileName = fileName.replace(/\.[^.]+$/, ".json");
            }

            // Create a new blob with the correct MIME type
            const blob = new Blob([contentBlob], { type: actualMimeType });

            // Trigger download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
              title: "Download Complete",
              description: `Successfully downloaded ${dataset.title}`,
            });

            success = true;
          } catch (error: any) {
            console.warn(`Gateway ${i + 1} failed:`, error.message);
            lastError = error;

            // If this isn't the last gateway, continue to the next one
            if (i < ipfsGateways.length - 1) {
              continue;
            }
          }
        }

        // If all gateways failed, throw the last error
        if (!success && lastError) {
          throw lastError;
        }
      } else {
        // Fallback: create a metadata file if no content URL is available
        const metadataContent = JSON.stringify(
          {
            title: dataset.title,
            description: dataset.description,
            contentType: dataset.contentType,
            contentHash: dataset.contentHash,
            creator: dataset.creator,
            license: {
              ...dataset.license,
              price: dataset.license.price.toString(), // Convert BigInt to string for JSON
            },
            tags: dataset.tags,
            samples: dataset.samples,
            downloadedAt: new Date().toISOString(),
          },
          null,
          2,
        );

        const blob = new Blob([metadataContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${dataset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_metadata.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Metadata Downloaded",
          description:
            "Content not directly accessible. Downloaded metadata instead.",
          variant: "default",
        });
      }
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-orange-400" />
            Dataset Access
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshLicenseStatus}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
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
            {/* Direct Download */}
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
      </CardContent>
    </Card>
  );
}
