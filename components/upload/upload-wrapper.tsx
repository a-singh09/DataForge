"use client";

import { useEffect, useState } from "react";
import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UploadWrapperProps {
  children: React.ReactNode;
}

export default function UploadWrapper({ children }: UploadWrapperProps) {
  const { authenticated, loading } = useAuthState();
  const auth = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let checkInterval: NodeJS.Timeout;

    const checkInitialization = async () => {
      console.log("Upload wrapper initialization check:", {
        authenticated,
        loading,
        hasAuth: !!auth,
        hasOrigin: !!auth?.origin,
      });

      // If still loading, wait
      if (loading) {
        console.log("Authentication still loading...");
        return;
      }

      // If not authenticated after loading is complete, show connect screen
      if (!authenticated && !loading) {
        console.log("User not authenticated");
        setIsInitializing(false);
        return;
      }

      // If authenticated, check for Origin SDK and set up viem client
      if (authenticated && auth?.origin) {
        try {
          // Set up viem client for Origin SDK if needed
          if (typeof window !== "undefined" && window.ethereum) {
            try {
              // Import viem dynamically to avoid SSR issues
              const { createWalletClient, custom } = await import("viem");

              // Get current chain ID from wallet
              const chainId = await window.ethereum.request({
                method: "eth_chainId",
              });
              const chainIdDecimal = parseInt(chainId, 16);
              console.log(
                "Current wallet chain ID:",
                chainId,
                "decimal:",
                chainIdDecimal,
              );

              // Create a basic chain config for the current network
              const currentChain = {
                id: chainIdDecimal,
                name: `Chain ${chainIdDecimal}`,
                network: `chain-${chainIdDecimal}`,
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: {
                  default: { http: [""] }, // Will use the wallet's RPC
                  public: { http: [""] },
                },
              };

              const walletClient = createWalletClient({
                chain: currentChain,
                transport: custom(window.ethereum),
              });

              console.log(
                "Setting up viem wallet client for Origin SDK with chain:",
                currentChain.name,
              );
              auth.origin.setViemClient(walletClient);
            } catch (viemError) {
              console.warn("Could not set up viem client:", viemError);
              // Continue anyway, Origin SDK might work without it
            }
          }

          console.log("Origin SDK is ready for upload");
          setIsInitializing(false);
          setInitError(null);
          return;
        } catch (error) {
          console.error("Error initializing upload system:", error);
          setInitError(
            "Failed to initialize upload system. Please refresh the page.",
          );
          return;
        }
      } else if (authenticated) {
        console.log("Authenticated but Origin SDK not ready, waiting...");
      }
    };

    // Initial check
    checkInitialization();

    // Set up periodic checks while initializing
    if (isInitializing && !loading) {
      checkInterval = setInterval(checkInitialization, 1000);
    }

    // Set up timeout for initialization
    timeoutId = setTimeout(() => {
      if (isInitializing) {
        console.warn("Initialization timeout reached");
        if (authenticated && !auth?.origin) {
          setInitError(
            "Origin SDK is taking longer than expected to initialize. Please refresh the page.",
          );
        } else if (!authenticated && !loading) {
          // Just stop initializing if not authenticated
          setIsInitializing(false);
        }
      }
    }, 10000); // 10 second timeout

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [authenticated, loading, auth, isInitializing]);

  // Show loading state while initializing or while auth is loading
  if (isInitializing || loading) {
    const isWaitingForAuth = loading;
    const isWaitingForOrigin = authenticated && !auth?.origin && !loading;

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <h2 className="text-2xl font-bold mb-4">
            {isWaitingForAuth
              ? "Checking Authentication"
              : isWaitingForOrigin
                ? "Initializing Origin SDK"
                : "Preparing Upload System"}
          </h2>
          <p className="text-gray-400 mb-6">
            {isWaitingForAuth
              ? "Please wait while we check your wallet connection..."
              : isWaitingForOrigin
                ? "Please wait while we prepare the Origin SDK for uploading..."
                : "Setting up the upload system..."}
          </p>
        </div>
      </div>
    );
  }

  // Authentication is only required for the final minting step
  // Allow users to proceed through the upload flow without wallet connection

  // Show initialization error
  if (initError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Alert className="mb-6 border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{initError}</AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // All good, render children - authentication will be checked in the minting step
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
