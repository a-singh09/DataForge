"use client";

import { useAuthState as useOriginAuthState } from "@campnetwork/origin/react";

/**
 * Custom hook wrapper for Origin SDK's useAuthState
 * Provides authentication status and loading state
 */
export function useAuthState() {
  const { authenticated, loading } = useOriginAuthState();

  return {
    authenticated,
    loading,
    isAuthenticated: authenticated,
    isLoading: loading,
  };
}

export { useAuthState as default };
