"use client";

import { useAuthState } from "@/hooks/useAuthState";
import { useAuth } from "@/hooks/useAuth";

interface AuthStatusProps {
  showAddress?: boolean;
  className?: string;
}

/**
 * Component that displays current authentication status
 * Shows wallet address and connection state
 */
export function AuthStatus({
  showAddress = true,
  className = "",
}: AuthStatusProps) {
  const { authenticated, loading } = useAuthState();
  const { disconnect } = useAuth();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-gray-300 h-4 w-20 rounded"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <div className={`text-gray-500 ${className}`}>Not connected</div>;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-green-600 font-medium">Connected</span>
      </div>
      <button
        onClick={disconnect}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Disconnect
      </button>
    </div>
  );
}
