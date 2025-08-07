"use client";

import { useState } from "react";
import { SocialAccountStatus } from "./SocialAccountStatus";
import { SocialLinkButton } from "./SocialLinkButton";
import { useSocialLinking } from "@/hooks/useSocialLinking";
import { SocialPlatform } from "@/types/social";

interface SocialAccountManagerProps {
  className?: string;
}

/**
 * Comprehensive social account management component
 * Provides full social linking/unlinking functionality with status display
 */
export function SocialAccountManager({
  className = "",
}: SocialAccountManagerProps) {
  const {
    linkedSocials,
    isLoading,
    error,
    linkingState,
    isLinking,
    linkingError,
    clearLinkingError,
    getLinkedCount,
    getLinkedPlatforms,
    getUnlinkedPlatforms,
  } = useSocialLinking();

  const [activeTab, setActiveTab] = useState<"overview" | "manage">("overview");

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-8 bg-gray-300 rounded w-64"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
      >
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Social Accounts
        </h3>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const linkedCount = getLinkedCount();
  const linkedPlatforms = getLinkedPlatforms();
  const unlinkedPlatforms = getUnlinkedPlatforms();

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Social Account Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {linkedCount > 0
                ? `${linkedCount} account${linkedCount === 1 ? "" : "s"} connected`
                : "No accounts connected"}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "overview"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "manage"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Linking Error Display */}
        {linkingError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-800">{linkingError}</p>
              </div>
              <button
                onClick={clearLinkingError}
                className="text-red-400 hover:text-red-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLinking && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-800">
                {linkingState.platform
                  ? `Processing ${linkingState.platform} connection...`
                  : "Processing social account connection..."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "overview" ? (
          <SocialAccountStatus variant="default" showUnlinked={true} />
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(
                  [
                    "twitter",
                    "spotify",
                    "tiktok",
                    "telegram",
                  ] as SocialPlatform[]
                ).map((platform) => (
                  <div key={platform} className="text-center">
                    <SocialLinkButton platform={platform} variant="icon" />
                    <p className="text-xs text-gray-600 mt-2 capitalize">
                      {platform}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {linkedCount > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Connected Accounts ({linkedCount})
                </h3>
                <div className="space-y-3">
                  {linkedPlatforms.map((platform) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {platform === "twitter" && "🐦"}
                          {platform === "spotify" && "🎵"}
                          {platform === "tiktok" && "📱"}
                          {platform === "telegram" && "✈️"}
                        </span>
                        <div>
                          <p className="font-medium text-green-800 capitalize">
                            {platform}
                          </p>
                          <p className="text-sm text-green-600">Connected</p>
                        </div>
                      </div>
                      <SocialLinkButton platform={platform} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unlinkedPlatforms.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Available Connections ({unlinkedPlatforms.length})
                </h3>
                <div className="space-y-3">
                  {unlinkedPlatforms.map((platform) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg opacity-50">
                          {platform === "twitter" && "🐦"}
                          {platform === "spotify" && "🎵"}
                          {platform === "tiktok" && "📱"}
                          {platform === "telegram" && "✈️"}
                        </span>
                        <div>
                          <p className="font-medium text-gray-700 capitalize">
                            {platform}
                          </p>
                          <p className="text-sm text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <SocialLinkButton platform={platform} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
