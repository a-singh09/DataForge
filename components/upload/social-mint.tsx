"use client";

import { useState, useEffect } from "react";
import {
  useAuth,
  useAuthState,
  useSocials,
  useLinkSocials,
} from "@campnetwork/origin/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Twitter,
  Music,
  MessageSquare,
  Send,
  Check,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  User,
} from "lucide-react";

interface SocialMintProps {
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const socialPlatforms = [
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "from-blue-500 to-blue-600",
    description: "Mint tweets, threads, and media",
    supported: true,
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: Music,
    color: "from-green-500 to-green-600",
    description: "Mint tracks and playlists",
    supported: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: MessageSquare,
    color: "from-pink-500 to-pink-600",
    description: "Mint videos and captions",
    supported: true,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: Send,
    color: "from-blue-400 to-blue-500",
    description: "Mint messages and media",
    supported: false, // Not yet supported by Origin SDK mintSocial
  },
];

export default function SocialMint({
  onDataChange,
  onNext,
  onBack,
}: SocialMintProps) {
  const { authenticated } = useAuthState();
  const auth = useAuth();
  const { data: linkedSocials, isLoading: socialsLoading } = useSocials();
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

  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [telegramPhone, setTelegramPhone] = useState("");
  const [telegramOTP, setTelegramOTP] = useState("");
  const [telegramHash, setTelegramHash] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    if (!authenticated) {
      setError("Please connect your wallet first");
      return;
    }

    setIsConnecting(platformId);
    setError(null);

    try {
      switch (platformId) {
        case "twitter":
          await linkTwitter();
          break;
        case "spotify":
          await linkSpotify();
          break;
        case "tiktok":
          if (!tiktokHandle.trim()) {
            setError("Please enter your TikTok handle");
            setIsConnecting(null);
            return;
          }
          await linkTiktok(tiktokHandle);
          break;
        case "telegram":
          if (!telegramPhone.trim()) {
            setError("Please enter your phone number");
            setIsConnecting(null);
            return;
          }
          if (!telegramOTP.trim() || !telegramHash.trim()) {
            // Send OTP first
            const result = await sendTelegramOTP(telegramPhone);
            setTelegramHash(result.phone_code_hash);
            setError("OTP sent! Please enter the code you received.");
            setIsConnecting(null);
            return;
          }
          await linkTelegram(telegramPhone, telegramOTP, telegramHash);
          break;
        default:
          throw new Error(`Platform ${platformId} not supported`);
      }
    } catch (error: any) {
      console.error(`Failed to connect ${platformId}:`, error);
      setError(error.message || `Failed to connect to ${platformId}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      switch (platformId) {
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
    } catch (error: any) {
      console.error(`Failed to disconnect ${platformId}:`, error);
      setError(error.message || `Failed to disconnect from ${platformId}`);
    }
  };

  const handleNext = () => {
    if (!selectedPlatform) {
      setError("Please select a platform to mint from");
      return;
    }

    onDataChange({
      socialSource: selectedPlatform,
      uploadType: "social",
    });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          Connect Your Social Accounts
        </h2>
        <p className="text-gray-400 text-lg">
          Link your social platforms to mint content directly from your profiles
        </p>
      </div>

      {/* Authentication Warning */}
      {!authenticated && (
        <Alert className="mb-6 border-orange-500/20 bg-orange-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to connect your wallet to link social accounts and mint
            content.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Platform Connection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;
          const isConnected =
            linkedSocials?.[platform.id as keyof typeof linkedSocials] || false;
          const isConnecting = isConnecting === platform.id;
          const isSelected = selectedPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className={`glass rounded-2xl p-6 transition-all duration-200 ${
                isSelected ? "border-2 border-orange-500 bg-orange-500/10" : ""
              } ${!platform.supported ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-12 w-12 bg-gradient-to-br ${platform.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{platform.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {platform.description}
                    </p>
                    {!platform.supported && (
                      <p className="text-yellow-400 text-xs mt-1">
                        Coming Soon
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isConnected && <Check className="h-5 w-5 text-green-400" />}
                  {isSelected && <User className="h-5 w-5 text-orange-400" />}
                </div>
              </div>

              {/* Special inputs for TikTok and Telegram */}
              {platform.id === "tiktok" && !isConnected && (
                <div className="mb-4">
                  <Label
                    htmlFor="tiktok-handle"
                    className="text-sm font-medium mb-2 block"
                  >
                    TikTok Handle
                  </Label>
                  <Input
                    id="tiktok-handle"
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value)}
                    placeholder="@yourusername"
                    className="h-10"
                  />
                </div>
              )}

              {platform.id === "telegram" && !isConnected && (
                <div className="mb-4 space-y-3">
                  <div>
                    <Label
                      htmlFor="telegram-phone"
                      className="text-sm font-medium mb-2 block"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="telegram-phone"
                      value={telegramPhone}
                      onChange={(e) => setTelegramPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="h-10"
                    />
                  </div>
                  {telegramHash && (
                    <div>
                      <Label
                        htmlFor="telegram-otp"
                        className="text-sm font-medium mb-2 block"
                      >
                        Verification Code
                      </Label>
                      <Input
                        id="telegram-otp"
                        value={telegramOTP}
                        onChange={(e) => setTelegramOTP(e.target.value)}
                        placeholder="Enter OTP"
                        className="h-10"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                {!isConnected ? (
                  <Button
                    onClick={() => handleConnect(platform.id)}
                    disabled={
                      isConnecting || !authenticated || !platform.supported
                    }
                    className="flex-1"
                    variant={isConnecting ? "outline" : "default"}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : !platform.supported ? (
                      "Coming Soon"
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleDisconnect(platform.id)}
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                    <Button
                      className={`flex-1 ${
                        isSelected
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-orange-500 hover:bg-orange-600"
                      }`}
                      onClick={() =>
                        setSelectedPlatform(isSelected ? null : platform.id)
                      }
                    >
                      {isSelected ? "Selected" : "Select for Minting"}
                    </Button>
                  </>
                )}
              </div>

              {isConnected && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Status: Connected</span>
                    <span className="text-green-400">✓ Verified</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connected Platforms Summary */}
      {linkedSocials && Object.values(linkedSocials).some(Boolean) && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Connected Accounts:</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(linkedSocials).map(([platformId, isLinked]) => {
              if (!isLinked) return null;

              const platform = socialPlatforms.find((p) => p.id === platformId);
              if (!platform) return null;

              const Icon = platform.icon;
              const isSelected = selectedPlatform === platformId;

              return (
                <div
                  key={platformId}
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${
                    isSelected
                      ? "bg-orange-500/20 border border-orange-500/30"
                      : "bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{platform.name}</span>
                  <Check className="h-4 w-4 text-green-400" />
                  {isSelected && <User className="h-4 w-4 text-orange-400" />}
                </div>
              );
            })}
          </div>

          {selectedPlatform && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Selected for minting:{" "}
                <span className="text-orange-400 font-medium">
                  {socialPlatforms.find((p) => p.id === selectedPlatform)?.name}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!selectedPlatform || !authenticated}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
        >
          {!authenticated
            ? "Connect Wallet to Continue"
            : !selectedPlatform
              ? "Select Platform to Continue"
              : "Continue to Metadata"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
