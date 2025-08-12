"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "@campnetwork/origin/react";

/**
 * Hook to fetch real wallet balance
 */
export function useWalletBalance() {
  const { authenticated } = useAuthState();
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated) {
      setBalance("0");
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });

          if (accounts && accounts.length > 0) {
            const balance = await (window as any).ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            });

            // Convert from wei to ETH
            const balanceInEth = (
              parseInt(balance, 16) / Math.pow(10, 18)
            ).toFixed(4);
            setBalance(balanceInEth);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch wallet balance:", err);
        setError(err.message || "Failed to fetch balance");
        setBalance("0");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [authenticated]);

  return {
    balance,
    isLoading,
    error,
  };
}
