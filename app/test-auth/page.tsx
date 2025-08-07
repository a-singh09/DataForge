"use client";

import { useAuthState } from "@/hooks/useAuthState";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { SocialAccountManager } from "@/components/social/SocialAccountManager";

export default function TestAuthPage() {
  const { authenticated, loading } = useAuthState();
  const { disconnect } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>

      <div className="space-y-8">
        {/* Authentication Status */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <AuthStatus />
          <div className="mt-4">
            <p>Authenticated: {authenticated ? "Yes" : "No"}</p>
            <p>Loading: {loading ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* Connect/Disconnect */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Connection Controls</h2>
          {!authenticated ? (
            <AuthModal />
          ) : (
            <button
              onClick={disconnect}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Social Account Management */}
        {authenticated && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Social Account Management
            </h2>
            <SocialAccountManager />
          </div>
        )}
      </div>
    </div>
  );
}
