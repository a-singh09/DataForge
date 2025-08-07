"use client";

import { useLinkSocials, useSocials } from "@campnetwork/origin/react";
import { useState } from "react";
import { SocialPlatform, LinkedSocials } from "@/types/social";

interface SocialLinkButtonProps {
  platform: SocialPlatform;
  variant?: "default" | "icon";
  className?: string;
}

/**
 * Social platform linking button component
 * Handles linking and unlinking of social accounts
 */
export function SocialLinkButton({
  platform,
  variant = "default",
  className = "",
}: SocialLinkButtonProps) {
  const { data: linkedSocials, isLoading } = useSocials();
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
  } = useLinkSocials();

  const [tiktokHandle, setTiktokHandle] = useState("");
  const [telegramPhone, setTelegramPhone] = useState("");
  const [telegramOTP, setTelegramOTP] = useState("");
  const [telegramHash, setTelegramHash] = useState("");
  const [showTiktokInput, setShowTiktokInput] = useState(false);
  const [showTelegramInput, setShowTelegramInput] = useState(false);
  const [telegramStep, setTelegramStep] = useState<"phone" | "otp">("phone");

  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-300 h-10 w-32 rounded ${className}`}
      />
    );
  }

  const isLinked = Boolean((linkedSocials as LinkedSocials)?.[platform]);

  const handleLink = async () => {
    try {
      switch (platform) {
        case "twitter":
          linkTwitter();
          break;
        case "spotify":
          linkSpotify();
          break;
        case "tiktok":
          if (!showTiktokInput) {
            setShowTiktokInput(true);
            return;
          }
          if (tiktokHandle.trim()) {
            await linkTiktok(tiktokHandle.trim());
            setShowTiktokInput(false);
            setTiktokHandle("");
          }
          break;
        case "telegram":
          if (!showTelegramInput) {
            setShowTelegramInput(true);
            return;
          }
          if (telegramStep === "phone" && telegramPhone.trim()) {
            const result = await sendTelegramOTP(telegramPhone.trim());
            if (
              result &&
              typeof result === "object" &&
              "phone_code_hash" in result
            ) {
              setTelegramHash(result.phone_code_hash as string);
              setTelegramStep("otp");
            }
          } else if (telegramStep === "otp" && telegramOTP.trim()) {
            await linkTelegram(telegramPhone, telegramOTP.trim(), telegramHash);
            setShowTelegramInput(false);
            setTelegramPhone("");
            setTelegramOTP("");
            setTelegramHash("");
            setTelegramStep("phone");
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to link ${platform}:`, error);
    }
  };

  const handleUnlink = async () => {
    try {
      switch (platform) {
        case "twitter":
          await unlinkTwitter();
          break;
        case "spotify":
          await unlinkSpotify();
          break;
        case "tiktok":
          await unlinkTiktok();
          break;
        case "telegram":
          await unlinkTelegram();
          break;
      }
    } catch (error) {
      console.error(`Failed to unlink ${platform}:`, error);
    }
  };

  const getPlatformIcon = () => {
    const icons = {
      twitter: "🐦",
      spotify: "🎵",
      tiktok: "📱",
      telegram: "✈️",
    };
    return icons[platform];
  };

  const getPlatformName = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const baseButtonClass = `
    inline-flex items-center justify-center px-4 py-2 border border-transparent 
    text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-blue-500 ${className}
  `;

  const linkedClass = "bg-green-100 text-green-800 hover:bg-green-200";
  const unlinkedClass = "bg-blue-600 text-white hover:bg-blue-700";

  if (variant === "icon") {
    return (
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={isLinked ? handleUnlink : handleLink}
          className={`${baseButtonClass} w-12 h-12 rounded-full ${
            isLinked ? linkedClass : unlinkedClass
          }`}
          title={`${isLinked ? "Unlink" : "Link"} ${getPlatformName()}`}
        >
          {getPlatformIcon()}
        </button>

        {/* TikTok handle input */}
        {showTiktokInput && platform === "tiktok" && (
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder="TikTok handle"
              value={tiktokHandle}
              onChange={(e) => setTiktokHandle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleLink}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
              >
                Link
              </button>
              <button
                onClick={() => setShowTiktokInput(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Telegram input */}
        {showTelegramInput && platform === "telegram" && (
          <div className="flex flex-col space-y-2">
            {telegramStep === "phone" ? (
              <>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={telegramPhone}
                  onChange={(e) => setTelegramPhone(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleLink}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                  >
                    Send OTP
                  </button>
                  <button
                    onClick={() => setShowTelegramInput(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={telegramOTP}
                  onChange={(e) => setTelegramOTP(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleLink}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      setTelegramStep("phone");
                      setTelegramOTP("");
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={isLinked ? handleUnlink : handleLink}
        className={`${baseButtonClass} ${isLinked ? linkedClass : unlinkedClass}`}
      >
        <span className="mr-2">{getPlatformIcon()}</span>
        {isLinked ? `Unlink ${getPlatformName()}` : `Link ${getPlatformName()}`}
      </button>

      {/* TikTok handle input */}
      {showTiktokInput && platform === "tiktok" && (
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Enter TikTok handle"
            value={tiktokHandle}
            onChange={(e) => setTiktokHandle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Link Account
            </button>
            <button
              onClick={() => setShowTiktokInput(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Telegram input */}
      {showTelegramInput && platform === "telegram" && (
        <div className="flex flex-col space-y-2">
          {telegramStep === "phone" ? (
            <>
              <input
                type="tel"
                placeholder="Enter phone number (+1234567890)"
                value={telegramPhone}
                onChange={(e) => setTelegramPhone(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-black"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send OTP
                </button>
                <button
                  onClick={() => setShowTelegramInput(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP from Telegram"
                value={telegramOTP}
                onChange={(e) => setTelegramOTP(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-black"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Verify & Link
                </button>
                <button
                  onClick={() => {
                    setTelegramStep("phone");
                    setTelegramOTP("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
