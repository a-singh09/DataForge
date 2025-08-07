"use client";

import { useSocials } from "@campnetwork/origin/react";
import { SocialLinkButton } from "./SocialLinkButton";
import {
  SocialPlatform,
  SocialPlatformInfo,
  LinkedSocials,
} from "@/types/social";

interface SocialAccountStatusProps {
  showUnlinked?: boolean;
  variant?: "default" | "compact" | "grid";
  className?: string;
}

/**
 * Component that displays the status of all social account connections
 * Shows linked and optionally unlinked social accounts
 */
export function SocialAccountStatus({
  showUnlinked = true,
  variant = "default",
  className = "",
}: SocialAccountStatusProps) {
  const { data: linkedSocials, isLoading, error } = useSocials();

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-48"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 ${className}`}>
        Error loading social accounts: {error.message}
      </div>
    );
  }

  const platforms: SocialPlatformInfo[] = [
    { key: "twitter", name: "Twitter", icon: "🐦" },
    { key: "spotify", name: "Spotify", icon: "🎵" },
    { key: "tiktok", name: "TikTok", icon: "📱" },
    { key: "telegram", name: "Telegram", icon: "✈️" },
  ];

  const socialData = linkedSocials as LinkedSocials;
  const linkedPlatforms = platforms.filter(
    (p) => socialData && socialData[p.key],
  );
  const unlinkedPlatforms = platforms.filter(
    (p) => !socialData || !socialData[p.key],
  );

  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-gray-600">Connected:</span>
        {linkedPlatforms.length > 0 ? (
          <div className="flex space-x-1">
            {linkedPlatforms.map((platform) => (
              <span
                key={platform.key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                title={platform.name}
              >
                {platform.icon}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-400">None</span>
        )}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold mb-4">Social Accounts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <div key={platform.key} className="text-center">
              <SocialLinkButton platform={platform.key} variant="icon" />
              <p className="text-xs text-gray-600 mt-1">{platform.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Social Account Status</h3>

        {linkedPlatforms.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-green-700 mb-3">
              Connected Accounts ({linkedPlatforms.length})
            </h4>
            <div className="space-y-2">
              {linkedPlatforms.map((platform) => (
                <div
                  key={platform.key}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{platform.icon}</span>
                    <span className="font-medium text-green-800">
                      {platform.name}
                    </span>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <SocialLinkButton platform={platform.key} />
                </div>
              ))}
            </div>
          </div>
        )}

        {showUnlinked && unlinkedPlatforms.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Available Connections ({unlinkedPlatforms.length})
            </h4>
            <div className="space-y-2">
              {unlinkedPlatforms.map((platform) => (
                <div
                  key={platform.key}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg opacity-50">{platform.icon}</span>
                    <span className="font-medium text-gray-700">
                      {platform.name}
                    </span>
                    <span className="text-sm text-gray-500">Not connected</span>
                  </div>
                  <SocialLinkButton platform={platform.key} />
                </div>
              ))}
            </div>
          </div>
        )}

        {linkedPlatforms.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">
              No social accounts connected yet
            </p>
            <p className="text-sm text-gray-500">
              Connect your social accounts to enable social content minting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
