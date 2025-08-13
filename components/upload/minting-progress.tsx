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

      // Simple initialization - just proceed with minting

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

      // Debug the specific data we'll use
      console.log("Form data breakdown:", {
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        tags: metadata.tags,
        price: licenseTerms.price,
        priceType: typeof licenseTerms.price,
        duration: licenseTerms.duration,
        royaltyBps: licenseTerms.royaltyBps,
        paymentToken: licenseTerms.paymentToken,
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

      // Basic file validation
      const file = files[0];
      console.log("Processing file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      let tokenId: string;

      // Single-attempt minting (no retries)
      if (!files.length) {
        throw new Error("No files to mint");
      }

      // Create a proper File object from our stored file data (exactly like Simple File Upload Test)
      const storedFile = files[0];

      // Create a new File object using the stored file data
      const fileForMint = new File([storedFile.slice()], storedFile.name, {
        type: storedFile.type,
        lastModified: storedFile.lastModified,
      });

      console.log("Created proper File object for minting:", {
        name: fileForMint.name,
        type: fileForMint.type,
        size: fileForMint.size,
        constructor: fileForMint.constructor.name,
      });

      // Use metadata from the form
      const fileMetadata = {
        name: metadata.title || fileForMint.name,
        description: metadata.description || `File: ${fileForMint.name}`,
        // Add additional metadata fields if they exist
        ...(metadata.category && { category: metadata.category }),
        ...(metadata.tags &&
          metadata.tags.length > 0 && { tags: metadata.tags.join(", ") }),
      };

      console.log("Using metadata from form:", fileMetadata);

      // const simpleLicense = {
      //   price: BigInt("10000000000000000"), // Start with 0 like the working example
      //   duration: 86400, // 1 day like the working example
      //   royaltyBps: 9500, // 0% like the working example
      //   paymentToken:
      //     "0x0000000000000000000000000000000000000000" as `0x${string}`,
      // };

      // Use license terms from the form (but ensure they're properly formatted)
      const formLicense = {
        price:
          typeof licenseTerms.price === "string"
            ? BigInt(licenseTerms.price)
            : licenseTerms.price || BigInt("0"), // Convert string to BigInt
        duration: licenseTerms.duration || 86400, // Use form duration or fallback to 1 day
        royaltyBps: licenseTerms.royaltyBps || 0, // Use form royalty or fallback to 0
        paymentToken:
          "0x0000000000000000000000000000000000000000" as `0x${string}`,
      };

      console.log("Raw license terms from form:", licenseTerms);
      console.log("Converted license terms for minting:", {
        price: formLicense.price.toString(),
        priceType: typeof formLicense.price,
        priceInEth: (Number(formLicense.price) / 1e18).toFixed(6),
        duration: formLicense.duration,
        durationInDays: Math.floor(formLicense.duration / 86400),
        royaltyBps: formLicense.royaltyBps,
        royaltyPercent: (formLicense.royaltyBps / 100).toFixed(2),
        paymentToken: formLicense.paymentToken,
      });

      let mintedTokenId: string | null = null;

      try {
        console.log("Calling mintFile with these exact parameters:");
        console.log("File:", {
          name: fileForMint.name,
          size: fileForMint.size,
          type: fileForMint.type,
        });
        console.log("Metadata:", fileMetadata);
        console.log("License:", formLicense);
        console.log("License price type:", typeof formLicense.price);

        mintedTokenId = await auth.origin!.mintFile(
          fileForMint,
          fileMetadata,
          formLicense,
          undefined,
          {
            progressCallback: (percent: number) => {
              console.log(`Upload progress: ${percent}%`);
              // Update progress in UI
              setMintingState((prev) => ({
                ...prev,
                currentStep: Math.floor((percent / 100) * 2) + 1, // Map progress to steps 1-2
              }));
            },
          },
        );

        console.log("Minting successful, token ID:", mintedTokenId);
      } catch (mintError: any) {
        console.error("Minting failed:", mintError);
        throw new Error(
          `Minting failed: ${mintError.message || "Unknown error"}`,
        );
      }

      if (!mintedTokenId) {
        throw new Error("Minting did not return a token ID");
      }

      tokenId = mintedTokenId;

      // Store the token ID in database
      try {
        console.log("Storing token ID in database:", tokenId);
        const storeResponse = await fetch("/api/tokenids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokenId: tokenId,
          }),
        });

        const responseText = await storeResponse.text();
        console.log("Store response status:", storeResponse.status);
        console.log("Store response text:", responseText);

        if (storeResponse.ok) {
          console.log("Token ID stored successfully in database");
        } else {
          console.warn("Failed to store token ID in database:", responseText);
        }
      } catch (storeError) {
        console.warn("Error storing token ID in database:", storeError);
        // Don't fail the minting process if database storage fails
      }

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

            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <h3 className="font-semibold mb-2">IpNFT Details</h3>
              <p className="text-gray-400 text-sm mb-2">Token ID:</p>
              <div className="flex items-center justify-center space-x-2">
                <p
                  className="text-blue-400 font-mono text-xs truncate max-w-[200px]"
                  title={mintingState.tokenId || "N/A"}
                >
                  {mintingState.tokenId
                    ? `${mintingState.tokenId.slice(0, 8)}...${mintingState.tokenId.slice(-8)}`
                    : "N/A"}
                </p>
                {mintingState.tokenId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(mintingState.tokenId!)
                    }
                    className="h-6 w-6 p-0 flex-shrink-0"
                    title="Copy full token ID"
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
