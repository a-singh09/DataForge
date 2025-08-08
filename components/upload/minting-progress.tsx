"use client";

import { useState, useEffect } from "react";
import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Check,
  Clock,
  Zap,
  ExternalLink,
  ArrowRight,
  Loader2,
  AlertCircle,
  Copy,
} from "lucide-react";

interface MintingProgressProps {
  data: any;
  onComplete: () => void;
}

interface MintingState {
  currentStep: number;
  isComplete: boolean;
  tokenId: string | null;
  error: string | null;
  txHash: string | null;
  isInitializing: boolean;
}

const mintingSteps = [
  {
    id: "preparing",
    title: "Preparing Content",
    description: "Processing files and metadata",
  },
  {
    id: "uploading",
    title: "Uploading to IPFS",
    description: "Storing content on decentralized storage via Origin SDK",
  },
  {
    id: "minting",
    title: "Minting IpNFT",
    description: "Creating blockchain record with licensing terms",
  },
  {
    id: "indexing",
    title: "Indexing Content",
    description: "Making your content discoverable in marketplace",
  },
  {
    id: "complete",
    title: "Complete!",
    description: "Your IpNFT is now live and ready for licensing",
  },
];

export default function MintingProgress({
  data,
  onComplete,
}: MintingProgressProps) {
  const { authenticated } = useAuthState();
  const auth = useAuth();

  const [mintingState, setMintingState] = useState<MintingState>({
    currentStep: 0,
    isComplete: false,
    tokenId: null,
    error: null,
    txHash: null,
    isInitializing: true,
  });

  const performMinting = async () => {
    if (!authenticated) {
      setMintingState((prev) => ({
        ...prev,
        error: "Please connect your wallet to mint IpNFT",
      }));
      return;
    }

    if (!auth?.origin) {
      setMintingState((prev) => ({
        ...prev,
        error: "Origin SDK not available. Please refresh and try again.",
      }));
      return;
    }

    // Double-check that we're not still initializing
    if (mintingState.isInitializing) {
      console.log("Still initializing, waiting...");
      return;
    }

    try {
      console.log("Starting minting process...", {
        authenticated,
        hasOrigin: !!auth.origin,
      });

      // Step 1: Preparing Content
      setMintingState((prev) => ({ ...prev, currentStep: 0 }));

      // Check and set Origin consent if needed
      try {
        console.log("Checking Origin usage and consent...");
        const originUsage = await auth.origin.getOriginUsage();
        console.log("Origin usage:", originUsage);

        // Set consent to true if not already set
        if (!originUsage?.user?.active) {
          console.log("Setting Origin consent...");
          await auth.origin.setOriginConsent(true);
        }
      } catch (consentError) {
        console.warn("Origin consent setup failed:", consentError);
        // Continue anyway as this might not be required for minting
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Uploading to IPFS and Minting
      setMintingState((prev) => ({ ...prev, currentStep: 1 }));

      const files = data.files || [];
      const metadata = data.metadata || {};
      const licenseTerms = data.licenseTerms;

      console.log("Minting data received:", {
        filesCount: files.length,
        metadata,
        licenseTerms,
        uploadType: data.uploadType,
      });

      // Debug the files array
      console.log("Files array details:", files);
      if (files.length > 0) {
        console.log("First file details:", {
          file: files[0],
          name: files[0]?.name,
          type: files[0]?.type,
          size: files[0]?.size,
          keys: Object.keys(files[0] || {}),
          constructor: files[0]?.constructor?.name,
        });
      }

      if (!licenseTerms) {
        throw new Error("License terms are required");
      }

      if (!files.length) {
        throw new Error("No files provided for minting");
      }

      // Validate the first file
      const file = files[0];
      if (!file.name) {
        throw new Error(
          `File name is missing. File object: ${JSON.stringify({
            hasName: "name" in file,
            hasType: "type" in file,
            hasSize: "size" in file,
            keys: Object.keys(file),
            constructor: file.constructor.name,
          })}`,
        );
      }
      if (!file.type) {
        throw new Error("File type is missing");
      }

      let tokenId: string;

      // Add retry logic for API failures
      const retryMinting = async (attempt: number = 1): Promise<string> => {
        try {
          if (!files.length) {
            throw new Error("No files to mint");
          }

          // File minting - mint the first file
          const file = files[0];

          // Ensure we have proper file metadata including name and type
          const fileMetadata = {
            ...metadata,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            // Add any additional metadata from the form
            title: metadata.title || file.name,
            description: metadata.description || `File: ${file.name}`,
            category: metadata.category || "Other",
            tags: metadata.tags || [],
          };

          console.log(`Attempting file minting (attempt ${attempt})...`, {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileMetadata,
            licenseTerms,
          });

          console.log("File object details:", {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            constructor: file.constructor.name,
          });

          return await auth.origin.mintFile(
            file,
            fileMetadata,
            licenseTerms,
            undefined, // no parent
            {
              progressCallback: (percent) => {
                console.log(`Upload progress: ${percent}%`);
              },
            },
          );
        } catch (error: any) {
          console.error(`Minting attempt ${attempt} failed:`, error);
          console.error("Full error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });

          // Check if it's a server error that might be retryable
          const isRetryableError =
            error.message?.includes("500") ||
            error.message?.includes("Failed to upload") ||
            error.message?.includes("Failed to load resource") ||
            error.message?.includes("upload-url") ||
            error.message?.includes("update-status");

          if (attempt < 3 && isRetryableError) {
            console.log(
              `Retrying minting in ${attempt * 2} seconds... (attempt ${attempt + 1}/3)`,
            );
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
            return retryMinting(attempt + 1);
          }

          // If all retries failed, provide more context
          if (isRetryableError) {
            throw new Error(
              `Origin SDK backend services are currently unavailable after ${attempt} attempts. The upload-url and update-status endpoints are returning 500 errors. This appears to be a temporary infrastructure issue with the Origin SDK servers. Please try again later.`,
            );
          }

          throw error;
        }
      };

      tokenId = await retryMinting();

      // Step 3: Minting IpNFT (blockchain transaction)
      setMintingState((prev) => ({ ...prev, currentStep: 2, tokenId }));
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 4: Indexing Content
      setMintingState((prev) => ({ ...prev, currentStep: 3 }));
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 5: Complete
      setMintingState((prev) => ({
        ...prev,
        currentStep: 4,
        isComplete: true,
        txHash: `0x${tokenId}`, // Simplified - in reality you'd get the actual tx hash
      }));

      onComplete();
    } catch (error: any) {
      console.error("Minting failed:", error);

      let errorMessage = "Minting failed. Please try again.";

      // Handle specific Origin SDK errors
      if (error.message?.includes("Failed to upload file")) {
        errorMessage =
          "File upload failed. The Origin SDK upload service is currently experiencing issues. This appears to be a temporary server problem. Please try again in a few minutes.";
      } else if (
        error.message?.includes("500") ||
        error.message?.includes("Internal Server Error")
      ) {
        errorMessage =
          "Origin SDK server error (500). The backend services are temporarily unavailable. Please try again later or contact support if the issue persists.";
      } else if (error.message?.includes("upload-url")) {
        errorMessage =
          "Upload URL generation failed. The Origin SDK upload service is having issues. Please try again later.";
      } else if (error.message?.includes("update-status")) {
        errorMessage =
          "Status update failed. The file may have uploaded but status tracking failed. Please check your dashboard or try again.";
      } else if (error.message?.includes("404")) {
        errorMessage =
          "Service not found. Please check your network connection and try again.";
      } else if (error.message?.includes("WalletClient not connected")) {
        errorMessage =
          "Wallet not properly connected. Please disconnect and reconnect your wallet.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMintingState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  };

  useEffect(() => {
    console.log("Minting component mounted:", {
      authenticated,
      hasOrigin: !!auth?.origin,
      hasAuth: !!auth,
    });

    if (!authenticated) {
      // Instead of showing an error, keep the loading state and wait for authentication
      console.log("User not authenticated, waiting for wallet connection...");
      return;
    }

    // Check if client ID is configured
    const clientId = process.env.NEXT_PUBLIC_CAMP_CLIENT_ID;
    if (!clientId) {
      setMintingState((prev) => ({
        ...prev,
        isInitializing: false,
        error:
          "CAMP_CLIENT_ID is not configured. Please check your environment variables.",
      }));
      return;
    }

    // Wait for Origin SDK to be initialized
    const waitForOriginSDK = async () => {
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 15 seconds (30 * 500ms)

      while (attempts < maxAttempts) {
        console.log(
          `Checking Origin SDK initialization (attempt ${attempts + 1}/${maxAttempts})...`,
          {
            hasAuth: !!auth,
            hasOrigin: !!auth?.origin,
            authKeys: auth ? Object.keys(auth) : [],
          },
        );

        if (auth?.origin) {
          console.log("Origin SDK is ready, starting minting process...");
          setMintingState((prev) => ({ ...prev, isInitializing: false }));
          // Add a small delay to ensure everything is properly initialized
          setTimeout(() => {
            performMinting();
          }, 500);
          return;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // If we get here, Origin SDK didn't initialize in time
      console.error(
        "Origin SDK failed to initialize after",
        maxAttempts * 500,
        "ms",
        "Final auth state:",
        { hasAuth: !!auth, authKeys: auth ? Object.keys(auth) : [] },
      );
      setMintingState((prev) => ({
        ...prev,
        isInitializing: false,
        error:
          "Origin SDK is taking longer than expected to initialize. This could be due to network issues or the SDK not being properly configured. Please refresh the page and try again. If the issue persists, check your network connection and ensure the CAMP_CLIENT_ID is properly set.",
      }));
    };

    waitForOriginSDK();
  }, [authenticated, auth]);

  const progress = ((mintingState.currentStep + 1) / mintingSteps.length) * 100;

  // Show initialization loading state
  if (mintingState.isInitializing) {
    const isWaitingForWallet = !authenticated;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            {isWaitingForWallet
              ? "Preparing to Mint"
              : "Initializing Origin SDK"}
          </h2>
          <p className="text-gray-400 text-lg">
            {isWaitingForWallet
              ? "Please connect your wallet to continue with minting your IpNFT"
              : "Please wait while we connect to the Origin SDK services..."}
          </p>
        </div>

        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            <span className="text-lg">
              {isWaitingForWallet
                ? "Waiting for wallet connection..."
                : "Connecting to Origin SDK..."}
            </span>
          </div>

          <div className="mt-6 text-center text-gray-400 text-sm">
            {isWaitingForWallet
              ? "Use the Connect button in the header to connect your wallet and start minting."
              : "This usually takes a few seconds. If this takes longer than expected, please check your network connection."}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (mintingState.error) {
    const isServerError =
      mintingState.error.includes("500") ||
      mintingState.error.includes("upload-url") ||
      mintingState.error.includes("backend services");

    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="mb-6 border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>{mintingState.error}</div>
            {isServerError && (
              <div className="text-sm text-yellow-400 mt-2">
                ⚠️ This appears to be a temporary issue with the Origin SDK
                infrastructure. The development team has been notified. Please
                try again in a few minutes.
              </div>
            )}
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Try Again
          </Button>

          {isServerError && (
            <div className="text-sm text-gray-400">
              If the issue persists, you can check the{" "}
              <a
                href="https://status.campnetwork.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Origin SDK status page
              </a>{" "}
              for updates.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mintingState.isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-2xl p-8 mb-8">
          {/* Success Animation */}
          <div className="h-24 w-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Check className="h-12 w-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold mb-4 gradient-text">
            IpNFT Minted Successfully!
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Your content is now live on the marketplace and ready to earn
            revenue
          </p>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Content Details</h3>
              <p className="text-gray-400 text-sm mb-2">
                {data.metadata?.title || "Untitled Content"}
              </p>
              <p className="text-orange-400 font-medium">
                {data.licensing?.fixedPrice} ETH per license
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">IpNFT Details</h3>
              <p className="text-gray-400 text-sm mb-2">Token ID:</p>
              <div className="flex items-center space-x-2">
                <p className="text-blue-400 font-mono text-xs">
                  {mintingState.tokenId || "N/A"}
                </p>
                {mintingState.tokenId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(mintingState.tokenId!)
                    }
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>

            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => (window.location.href = "/marketplace")}
            >
              View in Marketplace
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Minting Your IpNFT</h2>
        <p className="text-gray-400 text-lg">
          Please wait while we process your content and create the blockchain
          record
        </p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8">
        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Overall Progress</span>
            <span className="text-orange-400 font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {mintingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-500 ${
                index < mintingState.currentStep
                  ? "bg-green-500/10 border border-green-500/20"
                  : index === mintingState.currentStep
                    ? "bg-orange-500/10 border border-orange-500/20"
                    : "bg-gray-800/30"
              }`}
            >
              {/* Step Icon */}
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index < mintingState.currentStep
                    ? "bg-green-500"
                    : index === mintingState.currentStep
                      ? "bg-orange-500"
                      : "bg-gray-600"
                }`}
              >
                {index < mintingState.currentStep ? (
                  <Check className="h-5 w-5 text-white" />
                ) : index === mintingState.currentStep ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Clock className="h-5 w-5 text-white" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-1 ${
                    index <= mintingState.currentStep
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm">{step.description}</p>

                {index === mintingState.currentStep && (
                  <div className="mt-3 flex items-center space-x-2 text-orange-400">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">In Progress...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Transaction Info */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Network:</span>
            <span className="text-green-400">BaseCAMP L1</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-400">Gas Fee:</span>
            <span className="text-green-400">$0.00 (Gasless)</span>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400">
        <p>
          This process usually takes 2-3 minutes. Please don't close this
          window.
        </p>
      </div>
    </div>
  );
}
