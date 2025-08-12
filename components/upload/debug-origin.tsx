"use client";

import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

export default function DebugOrigin() {
  const { authenticated } = useAuthState();
  const auth = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const info: any = {
      timestamp: new Date().toISOString(),
      authenticated,
      hasAuth: !!auth,
      hasOrigin: !!auth?.origin,
      hasWindow: typeof window !== "undefined",
      hasEthereum: typeof window !== "undefined" && !!window.ethereum,
    };

    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        info.walletAccounts = accounts;
        info.chainId = chainId;
        info.chainIdDecimal = parseInt(chainId, 16);
      } catch (error) {
        info.walletError = error.message;
      }
    }

    if (auth?.origin) {
      try {
        // Try to get JWT to test Origin SDK connection
        const jwt = auth.origin.getJwt();
        info.hasJwt = !!jwt;
        info.jwtLength = jwt?.length || 0;
      } catch (error) {
        info.originError = error.message;
      }
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  const testSimpleMint = async () => {
    if (!auth?.origin) {
      alert("Origin SDK not available");
      return;
    }

    try {
      setIsLoading(true);

      // Create a simple test file
      const testContent = "Hello, Origin SDK!";
      const testFile = new File([testContent], "test.txt", {
        type: "text/plain",
      });

      const metadata = {
        name: "Test File",
        description: "A simple test file for debugging",
        contentType: "text/plain",
        size: testContent.length,
      };

      const license = {
        price: BigInt("0"),
        duration: 365 * 24 * 60 * 60,
        royaltyBps: 0,
        paymentToken:
          "0x0000000000000000000000000000000000000000" as `0x${string}`,
      };

      console.log("Attempting test mint...");
      const tokenId = await auth.origin.mintFile(testFile, metadata, license);

      alert(`Test mint successful! Token ID: ${tokenId}`);
    } catch (error: any) {
      console.error("Test mint failed:", error);
      alert(`Test mint failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Origin SDK Debug</h3>

      <div className="flex space-x-2">
        <Button onClick={runDiagnostics} disabled={isLoading}>
          Run Diagnostics
        </Button>
        <Button onClick={testSimpleMint} disabled={isLoading || !authenticated}>
          Test Simple Mint
        </Button>
      </div>

      {debugInfo && (
        <Alert>
          <AlertDescription>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
