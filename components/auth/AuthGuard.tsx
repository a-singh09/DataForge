"use client";

import { useAuthState } from "@/hooks/useAuthState";
import { AuthModal } from "./AuthModal";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showModal?: boolean;
}

/**
 * Authentication guard component that protects routes
 * Shows authentication modal or fallback content for unauthenticated users
 */
export function AuthGuard({
  children,
  fallback,
  showModal = true,
}: AuthGuardProps) {
  const { authenticated, loading } = useAuthState();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!authenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access this content.
          </p>
        </div>
        {showModal && <AuthModal />}
      </div>
    );
  }

  return <>{children}</>;
}
