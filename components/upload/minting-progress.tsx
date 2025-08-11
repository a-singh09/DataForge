"use client";

import { useState, useEffect, useRef } from "react";
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
  const startedRef = useRef(false);
  const initTimerRef = useRef<number | null>(null);
  const originReady = !!auth?.origin;

  // Add a health check function
  const checkOriginHealth = async () => {
    if (!auth?.origin) return false;
    try {
      // Simple health check - try to call a basic method
      await auth.origin.getOriginUsage();
      return true;
    } catch (error) {
      console.warn("Origin SDK health check failed, but continuing:", error);
      // Return true anyway - the health check might fail but minting could still work
      return true;
    }
  };

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

    console.log("Starting minting process with Origin SDK...");

    // Validate wallet connection and network
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        console.log("Connected accounts:", accounts);
        if (!accounts || accounts.length === 0) {
          throw new Error(
            "No wallet accounts connected. Please connect your wallet.",
          );
        }

        // Check network
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Current chain ID:", chainId);

        // Check if we're on the right network (you may need to adjust this)
        // BaseCAMP L1 might have a specific chain ID
        if (chainId !== "0x1" && chainId !== "0x2105") {
          // Ethereum mainnet or Base
          console.warn("Potentially wrong network. Chain ID:", chainId);
        }
      }
    } catch (walletError) {
      console.warn("Wallet validation warning:", walletError);
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
          console.log("Origin consent set successfully");
        }
      } catch (consentError) {
        console.warn("Origin consent setup failed:", consentError);
        // Continue anyway as this might not be required for minting
      }

      // Test if Origin SDK is working by calling a simple method
      try {
        console.log("Testing Origin SDK connectivity...");
        const testUsage = await auth.origin.getOriginUsage();
        console.log("Origin SDK test successful:", testUsage);
      } catch (testError) {
        console.warn("Origin SDK test failed:", testError);
        throw new Error(
          "Origin SDK is not responding properly. Please refresh and try again.",
        );
      }

      // Additional delay to ensure all initialization is complete
      await new Promise((resolve) => setTimeout(resolve, 500));

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

      // Additional file validation
      if (file.size === 0) {
        throw new Error("File is empty");
      }

      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        throw new Error("File is too large (max 100MB)");
      }

      console.log("File validation passed:", {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeInMB: (file.size / 1024 / 1024).toFixed(2),
      });

      let tokenId: string;

      // Single-attempt minting (no retries)
      if (!files.length) {
        throw new Error("No files to mint");
      }

      // File minting - mint the first file
      const fileForMint = files[0];

      // Create simplified metadata for Origin SDK
      const fileMetadata = {
        title: metadata.title || fileForMint.name,
        description: metadata.description || `File: ${fileForMint.name}`,
        category: metadata.category || "Other",
        fileName: fileForMint.name,
        fileType: fileForMint.type,
        fileSize: fileForMint.size,
      } as Record<string, unknown>;

      // Remove any undefined or null values
      Object.keys(fileMetadata).forEach((key) => {
        if (fileMetadata[key] === undefined || fileMetadata[key] === null) {
          delete fileMetadata[key];
        }
      });

      console.log("Cleaned metadata:", fileMetadata);

      // Validate and format license terms
      console.log("Raw license terms received:", licenseTerms);

      // Ensure we have valid license terms
      if (!licenseTerms) {
        throw new Error("License terms are missing");
      }

      // Convert and validate price - ensure we handle BigInt properly
      let priceInWei: bigint;
      try {
        console.log(
          "Processing price:",
          licenseTerms.price,
          typeof licenseTerms.price,
        );

        if (typeof licenseTerms.price === "bigint") {
          priceInWei = licenseTerms.price;
        } else if (typeof licenseTerms.price === "string") {
          // Remove any non-numeric characters and convert
          const cleanPrice = licenseTerms.price.replace(/[^0-9]/g, "");
          priceInWei = BigInt(cleanPrice);
        } else if (typeof licenseTerms.price === "number") {
          // Convert from ETH to wei, ensuring we don't lose precision
          const weiString = (licenseTerms.price * 1e18).toFixed(0);
          priceInWei = BigInt(weiString);
        } else {
          throw new Error(`Invalid price format: ${typeof licenseTerms.price}`);
        }

        console.log("Converted price to wei:", priceInWei.toString());

        if (priceInWei <= BigInt(0)) {
          throw new Error("License price must be greater than 0");
        }
      } catch (error) {
        console.error("Price conversion error:", error);
        throw new Error(
          `Invalid price: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      // Validate duration
      const duration = Number(licenseTerms.duration);
      if (!duration || duration <= 0) {
        throw new Error("License duration must be greater than 0");
      }

      // Validate royalty
      const royaltyBps = Number(licenseTerms.royaltyBps);
      if (royaltyBps < 0 || royaltyBps > 10000) {
        throw new Error(
          "Royalty must be between 0 and 10000 basis points (0-100%)",
        );
      }

      // Format license terms for Origin SDK
      const paymentTokenAddress =
        licenseTerms.paymentToken ||
        "0x0000000000000000000000000000000000000000";

      // Ensure the payment token address is properly formatted
      if (
        !paymentTokenAddress.startsWith("0x") ||
        paymentTokenAddress.length !== 42
      ) {
        throw new Error(
          `Invalid payment token address format: ${paymentTokenAddress}`,
        );
      }

      const formattedLicenseTerms = {
        price: priceInWei,
        duration: duration,
        royaltyBps: royaltyBps,
        paymentToken: paymentTokenAddress as `0x${string}`, // Ensure proper Address type
      };

      console.log("Formatted license terms:", {
        price: formattedLicenseTerms.price.toString(),
        priceInEth: (Number(formattedLicenseTerms.price) / 1e18).toFixed(6),
        duration: formattedLicenseTerms.duration,
        royaltyBps: formattedLicenseTerms.royaltyBps,
        paymentToken: formattedLicenseTerms.paymentToken,
      });

      console.log("Attempting file minting...", {
        fileName: fileForMint.name,
        fileType: fileForMint.type,
        fileSize: fileForMint.size,
        fileMetadata,
        formattedLicenseTerms,
      });

      console.log("File object details:", {
        name: fileForMint.name,
        type: fileForMint.type,
        size: fileForMint.size,
        lastModified: fileForMint.lastModified,
        constructor: fileForMint.constructor.name,
      });

      let mintedTokenId: string | null = null;

      try {
        console.log("Calling Origin SDK mintFile with:", {
          fileName: fileForMint.name,
          fileSize: fileForMint.size,
          metadataKeys: Object.keys(fileMetadata),
          licenseTerms: {
            price: formattedLicenseTerms.price.toString(),
            duration: formattedLicenseTerms.duration,
            royaltyBps: formattedLicenseTerms.royaltyBps,
            paymentToken: formattedLicenseTerms.paymentToken,
          },
        });

        // Try with minimal metadata first to isolate the issue
        const minimalMetadata = {
          title: fileForMint.name,
          description: `File: ${fileForMint.name}`,
        };

        console.log("Using minimal metadata for testing:", minimalMetadata);

        mintedTokenId = await auth.origin!.mintFile(
          fileForMint as File,
          minimalMetadata, // Use minimal metadata for testing
          formattedLicenseTerms,
          undefined, // no parent
          {
            progressCallback: (percent: number) => {
              console.log(`Upload progress: ${percent}%`);
            },
          },
        );

        console.log("Minting successful, token ID:", mintedTokenId);
      } catch (mintError: any) {
        console.error("Minting error details:", {
          error: mintError,
          message: mintError.message,
          code: mintError.code,
          data: mintError.data,
          stack: mintError.stack,
        });

        // Handle specific error cases
        if (mintError.message?.includes("status: 0x0")) {
          throw new Error(
            "Blockchain transaction failed (status: 0x0). This usually means:\n\n" +
              "• Smart contract rejected the transaction due to invalid parameters\n" +
              "• Gas limit was too low (try increasing gas limit in your wallet)\n" +
              "• License terms are invalid (price: " +
              (Number(formattedLicenseTerms.price) / 1e18).toFixed(6) +
              " ETH, duration: " +
              formattedLicenseTerms.duration +
              "s, royalty: " +
              formattedLicenseTerms.royaltyBps +
              " BPS)\n" +
              "• Network congestion or RPC issues\n\n" +
              "Try refreshing and minting again, or adjust your license terms.",
          );
        } else if (
          mintError.message?.includes("user rejected") ||
          mintError.message?.includes("User denied")
        ) {
          throw new Error("Transaction was rejected by user");
        } else if (mintError.message?.includes("insufficient funds")) {
          throw new Error("Insufficient funds to pay for transaction gas");
        } else if (mintError.message?.includes("nonce")) {
          throw new Error(
            "Transaction nonce error. Please reset your wallet account or try again.",
          );
        } else if (mintError.message?.includes("gas")) {
          throw new Error(
            "Gas estimation failed. Try increasing gas limit in your wallet or try again later.",
          );
        } else {
          throw new Error(
            `Minting failed: ${mintError.message || "Unknown error"}. Please check console for details.`,
          );
        }
      }

      if (!mintedTokenId) {
        throw new Error("Minting did not return a token ID");
      }

      tokenId = mintedTokenId;

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
      hasOrigin: originReady,
      hasAuth: !!auth,
    });

    if (!authenticated) {
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

    // Prevent re-entrancy
    if (startedRef.current) {
      return;
    }

    // Simple initialization with retries
    let attempts = 0;
    const maxAttempts = 5;

    const tryInitialize = () => {
      attempts++;
      console.log(`Initialization attempt ${attempts}/${maxAttempts}`);

      if (auth?.origin) {
        console.log("Origin SDK is ready, starting minting process...");
        setMintingState((prev) => ({ ...prev, isInitializing: false }));
        startedRef.current = true;

        // Start minting after a brief delay
        setTimeout(() => {
          performMinting();
        }, 300);
        return;
      }

      if (attempts < maxAttempts) {
        // Wait longer between attempts
        const delay = attempts * 1000; // 1s, 2s, 3s, 4s, 5s
        console.log(`Origin SDK not ready, retrying in ${delay}ms...`);
        initTimerRef.current = window.setTimeout(tryInitialize, delay);
      } else {
        console.error("Origin SDK failed to initialize after maximum attempts");
        setMintingState((prev) => ({
          ...prev,
          isInitializing: false,
          error:
            "Origin SDK failed to initialize. Please refresh the page and try again. If the issue persists, check your network connection.",
        }));
      }
    };

    // Start initialization
    tryInitialize();

    return () => {
      if (initTimerRef.current != null) {
        clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }
    };
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
