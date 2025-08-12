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
   * Download dataset using Origin SDK getData method
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

    if (!origin) {
      toast({
        title: "Download Failed",
        description: "Origin SDK not available.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      toast({
        title: "Download Started",
        description: `Fetching ${dataset.title} using Origin SDK...`,
      });

      console.log(`Getting data for token ${dataset.tokenId}`);

      // Use Origin SDK's getData method to fetch the actual file content
      const tokenData = await origin.getData(dataset.tokenId);
      console.log("Token data received:", tokenData);

      if (!tokenData) {
        throw new Error("No data returned from Origin SDK");
      }

      // Check if the response contains file URLs (AWS S3 signed URLs)
      // Handle the structure: { isError: false, data: [{ file: ['url'] }], message: '' }
      let fileUrls: string[] = [];

      if (tokenData && typeof tokenData === "object") {
        // Check for the new structure with data array
        if (tokenData.data && Array.isArray(tokenData.data)) {
          for (const item of tokenData.data) {
            if (item.file && Array.isArray(item.file)) {
              fileUrls.push(...item.file);
            }
          }
        }
        // Also check for the old direct structure as fallback
        else if (tokenData.file && Array.isArray(tokenData.file)) {
          fileUrls = tokenData.file;
        }
      }

      if (fileUrls.length > 0) {
        console.log("Found file URLs in response:", fileUrls);

        // Try to fetch the actual file content from the URLs
        for (let i = 0; i < fileUrls.length; i++) {
          const fileUrl = fileUrls[i];

          try {
            console.log(`Fetching file ${i + 1}: ${fileUrl}`);

            // Try to fetch the actual file content with proper headers
            const response = await fetch(fileUrl, {
              method: "GET",
              headers: {
                Accept: "*/*",
                "Cache-Control": "no-cache",
              },
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`,
              );
            }

            // Check the content type
            const contentType =
              response.headers.get("content-type") ||
              "application/octet-stream";
            console.log(`File ${i + 1} content type:`, contentType);

            // Get the content as text first to see what we're getting
            const content = await response.text();
            console.log(
              `File ${i + 1} content preview:`,
              content.substring(0, 200),
            );

            // Try to determine if this is JSON metadata or actual file content
            let isMetadata = false;
            try {
              const parsed = JSON.parse(content);
              if (parsed.name && parsed.size && parsed.type) {
                isMetadata = true;
                console.log(`File ${i + 1} appears to be metadata:`, parsed);
              }
            } catch (e) {
              // Not JSON, probably actual file content
            }

            if (isMetadata) {
              toast({
                title: "Metadata Detected",
                description: `File ${i + 1} returned metadata instead of content. This might be a URL configuration issue.`,
                variant: "destructive",
              });
              continue;
            }

            // Create blob and download
            const blob = new Blob([content], { type: contentType });

            // Try to extract filename from URL or use default
            let fileName = `dataset_file_${i + 1}`;
            try {
              const urlObj = new URL(fileUrl);
              const pathParts = urlObj.pathname.split("/");
              const urlFileName = pathParts[pathParts.length - 1];
              if (urlFileName && !urlFileName.includes("?")) {
                fileName = urlFileName;
              }
            } catch (urlError) {
              console.warn("Could not extract filename from URL:", urlError);
            }

            // Add appropriate extension if missing
            if (!fileName.includes(".")) {
              if (contentType.includes("text")) {
                fileName += ".txt";
              } else if (contentType.includes("json")) {
                fileName += ".json";
              } else {
                fileName += ".bin";
              }
            }

            // Trigger download
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            console.log(`Successfully downloaded file ${i + 1}: ${fileName}`);

            // Small delay between downloads
            if (i < fileUrls.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } catch (fileError) {
            console.error(`Failed to download file ${i + 1}:`, fileError);

            // Fallback: try opening in new tab
            try {
              console.log(`Fallback: Opening file ${i + 1} in new tab`);
              window.open(fileUrl, "_blank");
            } catch (fallbackError) {
              toast({
                title: "Download Failed",
                description: `Failed to download file ${i + 1}: ${fileError.message}`,
                variant: "destructive",
              });
            }
          }
        }

        toast({
          title: "Download Started",
          description: `Opened ${fileUrls.length} file(s) from ${dataset.title} in new tabs`,
        });
        return;
      }

      // Fallback: Handle other data formats (original logic)
      let fileName = `${dataset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_dataset`;
      let mimeType = "application/octet-stream";

      // Set file extension and MIME type based on content type
      switch (dataset.contentType) {
        case "image":
          fileName += ".jpg";
          mimeType = "image/jpeg";
          break;
        case "audio":
          fileName += ".mp3";
          mimeType = "audio/mpeg";
          break;
        case "video":
          fileName += ".mp4";
          mimeType = "video/mp4";
          break;
        case "code":
          fileName += ".json";
          mimeType = "application/json";
          break;
        case "social":
        case "text":
        default:
          fileName += ".txt";
          mimeType = "text/plain";
          break;
      }

      let blob: Blob;

      // Handle different data formats that might be returned
      if (tokenData instanceof Blob) {
        // Data is already a blob
        blob = tokenData;
      } else if (tokenData instanceof ArrayBuffer) {
        // Data is an ArrayBuffer
        blob = new Blob([tokenData], { type: mimeType });
      } else if (typeof tokenData === "string") {
        // Data is a string (JSON, text, etc.)
        blob = new Blob([tokenData], { type: mimeType });
      } else if (tokenData && typeof tokenData === "object") {
        // Data is an object, stringify it
        const jsonString = JSON.stringify(tokenData, null, 2);
        blob = new Blob([jsonString], { type: "application/json" });
        fileName = fileName.replace(/\.[^.]+$/, ".json");
      } else {
        throw new Error("Unsupported data format received from Origin SDK");
      }

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
    } catch (error: any) {
      console.error("Download failed:", error);

      // Fallback: create a metadata file if the actual content can't be downloaded
      try {
        console.log("Falling back to metadata download");

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
            note: "This is metadata only. The actual dataset content could not be retrieved.",
            error: error.message,
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
            "Could not access dataset content. Downloaded metadata with error details.",
          variant: "default",
        });
      } catch (fallbackError) {
        toast({
          title: "Download Failed",
          description: error.message || "Failed to download dataset.",
          variant: "destructive",
        });
      }
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
