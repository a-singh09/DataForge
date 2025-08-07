"use client";

import {
  useAuth as useOriginAuth,
  useConnect,
  useProvider,
  useProviders,
  useModal,
} from "@campnetwork/origin/react";

/**
 * Comprehensive authentication hook that wraps Origin SDK functionality
 * Provides access to auth instance, connection methods, and provider management
 */
export function useAuth() {
  const auth = useOriginAuth();
  const { connect, disconnect } = useConnect();
  const { provider, setProvider } = useProvider();
  const providers = useProviders();
  const { isOpen, openModal, closeModal } = useModal();

  return {
    // Auth instance for direct SDK access
    auth,
    origin: auth?.origin,

    // Connection methods
    connect,
    disconnect,

    // Provider management
    provider,
    setProvider,
    providers,

    // Modal control
    isModalOpen: isOpen,
    openModal,
    closeModal,

    // Utility methods
    setWalletAddress: (address: string) => auth?.setWalletAddress(address),

    // Event listener helper
    addEventListener: (
      event: "provider" | "state" | "providers" | "viem",
      callback: (data: any) => void,
    ) => {
      auth?.on(event, callback);
    },
  };
}

export { useAuth as default };
