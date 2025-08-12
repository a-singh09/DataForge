"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export interface LicenseTerms {
  price: bigint;
  duration: number;
  royaltyBps: number;
  paymentToken: string;
}

/**
 * Hook to fetch real license terms for a specific token using Origin SDK
 */
export function useLicenseTerms(tokenId: bigint | null) {
  const { auth } = useAuth();
  const [terms, setTerms] = useState<LicenseTerms | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId || !auth?.origin) {
      setTerms(null);
      setError(null);
      return;
    }

    const fetchTerms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching license terms for token ${tokenId}`);
        const licenseTerms = await auth.origin!.getTerms(tokenId);

        console.log(`License terms for token ${tokenId}:`, licenseTerms);
        setTerms(licenseTerms);
      } catch (err: any) {
        console.error(
          `Failed to fetch license terms for token ${tokenId}:`,
          err,
        );
        setError(err.message || "Failed to fetch license terms");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [tokenId, auth?.origin]);

  return {
    terms,
    isLoading,
    error,
    refetch: () => {
      if (tokenId && auth?.origin) {
        setTerms(null);
        setError(null);
      }
    },
  };
}
