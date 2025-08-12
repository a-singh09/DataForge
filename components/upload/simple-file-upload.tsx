"use client";

import { useState } from "react";
import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export default function SimpleFileUpload() {
  const { authenticated } = useAuthState();
  const auth = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !auth?.origin) {
      setError("No file selected or Origin SDK not available");
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Starting simple upload test...");

      // Very basic metadata
      const metadata = {
        name: file.name,
        description: `Test upload: ${file.name}`,
      };

      // Minimal license terms
      const license = {
        price: BigInt("0"),
        duration: 86400, // 1 day
        royaltyBps: 0,
        paymentToken:
          "0x0000000000000000000000000000000000000000" as `0x${string}`,
      };

      console.log("Calling mintFile with:", { metadata, license });

      const tokenId = await auth.origin.mintFile(
        file,
        metadata,
        license,
        undefined,
        {
          progressCallback: (percent) => {
            console.log(`Progress: ${percent}%`);
          },
        },
      );

      setResult(`Success! Token ID: ${tokenId}`);
      console.log("Upload successful, token ID:", tokenId);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!authenticated) {
    return (
      <Alert>
        <AlertDescription>Please connect your wallet first.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Simple File Upload Test</h3>

      <div>
        <Input
          type="file"
          onChange={handleFileChange}
          accept="image/*,text/*"
          disabled={isUploading}
        />
      </div>

      <Button
        onClick={handleUpload}
        disabled={!file || isUploading || !auth?.origin}
      >
        {isUploading ? "Uploading..." : "Upload & Mint"}
      </Button>

      {result && (
        <Alert className="border-green-500/20 bg-green-500/10">
          <AlertDescription>{result}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-500/20 bg-red-500/10">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
