"use client";

import {
  useLinkSocials as useOriginLinkSocials,
  useSocials,
  useLinkModal,
} from "@campnetwork/origin/react";
import { useState } from "react";
import { SocialPlatform, LinkedSocials } from "@/types/social";

/**
 * Comprehensive social linking hook that wraps Origin SDK functionality
 * Provides enhanced social account linking with state management
 */
export function useSocialLinking() {
  const { data: linkedSocials, isLoading, error, refetch } = useSocials();
  const {
    linkTwitter,
    linkSpotify,
    linkTiktok,
    linkTelegram,
    sendTelegramOTP,
    unlinkTwitter,
    unlinkSpotify,
    unlinkTiktok,
    unlinkTelegram,
  } = useOriginLinkSocials();

  const {
    isLinkingOpen,
    openTwitterModal,
    openSpotifyModal,
    openTiktokModal,
    openTelegramModal,
    closeModal,
  } = useLinkModal();

  const [linkingState, setLinkingState] = useState<{
    platform: string | null;
    loading: boolean;
    error: string | null;
  }>({
    platform: null,
    loading: false,
    error: null,
  });

  const handleLinkWithState = async (
    platform: "twitter" | "spotify" | "tiktok" | "telegram",
    linkFunction: () => void | Promise<void>,
    additionalData?: any,
  ) => {
    setLinkingState({ platform, loading: true, error: null });

    try {
      await linkFunction();
      await refetch(); // Refresh social data
      setLinkingState({ platform: null, loading: false, error: null });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to link ${platform}`;
      setLinkingState({ platform, loading: false, error: errorMessage });
    }
  };

  const handleUnlinkWithState = async (
    platform: "twitter" | "spotify" | "tiktok" | "telegram",
    unlinkFunction: () => Promise<void>,
  ) => {
    setLinkingState({ platform, loading: true, error: null });

    try {
      await unlinkFunction();
      await refetch(); // Refresh social data
      setLinkingState({ platform: null, loading: false, error: null });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to unlink ${platform}`;
      setLinkingState({ platform, loading: false, error: errorMessage });
    }
  };

  return {
    // Social data
    linkedSocials,
    isLoading,
    error,
    refetch,

    // Linking state
    linkingState,
    isLinking: linkingState.loading,
    linkingError: linkingState.error,
    clearLinkingError: () =>
      setLinkingState((prev) => ({ ...prev, error: null })),

    // Modal state
    isLinkingOpen,
    closeModal,

    // Enhanced linking functions with state management
    linkTwitter: () => handleLinkWithState("twitter", () => linkTwitter()),
    linkSpotify: () => handleLinkWithState("spotify", () => linkSpotify()),
    linkTiktok: (handle: string) =>
      handleLinkWithState("tiktok", () => linkTiktok(handle), { handle }),
    linkTelegram: (phone: string, otp: string, hash: string) =>
      handleLinkWithState("telegram", () => linkTelegram(phone, otp, hash), {
        phone,
        otp,
      }),
    sendTelegramOTP: async (phone: string) => {
      setLinkingState({ platform: "telegram", loading: true, error: null });
      try {
        const result = await sendTelegramOTP(phone);
        setLinkingState({ platform: null, loading: false, error: null });
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send Telegram OTP";
        setLinkingState({
          platform: "telegram",
          loading: false,
          error: errorMessage,
        });
        throw err;
      }
    },

    // Enhanced unlinking functions with state management
    unlinkTwitter: () =>
      handleUnlinkWithState("twitter", () => unlinkTwitter()),
    unlinkSpotify: () =>
      handleUnlinkWithState("spotify", () => unlinkSpotify()),
    unlinkTiktok: () => handleUnlinkWithState("tiktok", () => unlinkTiktok()),
    unlinkTelegram: () =>
      handleUnlinkWithState("telegram", () => unlinkTelegram()),

    // Modal opening functions
    openTwitterModal,
    openSpotifyModal,
    openTiktokModal,
    openTelegramModal,

    // Utility functions
    isLinked: (platform: SocialPlatform) =>
      Boolean((linkedSocials as LinkedSocials)?.[platform]),

    getLinkedCount: () => {
      const socialData = linkedSocials as LinkedSocials;
      return socialData ? Object.values(socialData).filter(Boolean).length : 0;
    },

    getLinkedPlatforms: () => {
      const socialData = linkedSocials as LinkedSocials;
      return socialData
        ? (Object.entries(socialData)
            .filter(([_, linked]) => linked)
            .map(([platform]) => platform) as SocialPlatform[])
        : [];
    },

    getUnlinkedPlatforms: () => {
      const socialData = linkedSocials as LinkedSocials;
      return socialData
        ? (Object.entries(socialData)
            .filter(([_, linked]) => !linked)
            .map(([platform]) => platform) as SocialPlatform[])
        : [];
    },
  };
}

export default useSocialLinking;
