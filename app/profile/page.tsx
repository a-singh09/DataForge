"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Twitter,
  Music,
  MessageSquare,
  Send,
  Settings,
  Bell,
  Shield,
  ExternalLink,
  Copy,
  Check,
  Edit,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TransactionHistory from "@/components/profile/transaction-history";
import Subscriptions from "@/components/profile/subscriptions";
import Link from "next/link";
import { useLicensing } from "@/hooks/useLicensing";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAuthState } from "@campnetwork/origin/react";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { useWalletBalance } from "@/hooks/useWalletBalance";

const socialPlatforms = [
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    connected: true,
    username: "@creator_vault",
    color: "text-blue-400",
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: Music,
    connected: true,
    username: "CreatorVault Music",
    color: "text-green-400",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: MessageSquare,
    connected: false,
    username: null,
    color: "text-pink-400",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: Send,
    connected: false,
    username: null,
    color: "text-blue-500",
  },
];

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);
  const { renewAccess } = useLicensing();
  const [renewTokenId, setRenewTokenId] = useState<string>("");
  const [renewPeriods, setRenewPeriods] = useState<number>(1);
  const [isRenewing, setIsRenewing] = useState<boolean>(false);
  const { auth } = useAuth();
  const { authenticated } = useAuthState();
  const { usageStats, isLoading: analyticsLoading } = useCreatorAnalytics();
  const { balance: walletBalance, isLoading: balanceLoading } =
    useWalletBalance();
  const [preferences, setPreferences] = useState({
    defaultLicenseDuration: "365",
    defaultRoyalty: 95,
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    showEarnings: false,
  });

  // Get wallet address from auth context or provider
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    const getWalletAddr = async () => {
      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Failed to get wallet address:", error);
      }
    };

    if (authenticated) {
      getWalletAddr();
    }
  }, [authenticated]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWalletAddress = async (): Promise<string | undefined> => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && accounts.length > 0) return accounts[0] as string;
      }
    } catch (_) {
      // ignore
    }
    return undefined;
  };

  const handleRenew = async () => {
    if (!renewTokenId) {
      toast({
        title: "Token ID required",
        description: "Enter a valid token ID to renew access.",
        variant: "destructive",
      });
      return;
    }
    if (renewPeriods < 1) {
      toast({
        title: "Invalid periods",
        description: "Periods must be at least 1.",
        variant: "destructive",
      });
      return;
    }
    setIsRenewing(true);
    try {
      const addr = await getWalletAddress();
      if (!addr) {
        toast({
          title: "No wallet detected",
          description: "Connect your wallet first, then try again.",
          variant: "destructive",
        });
        setIsRenewing(false);
        return;
      }
      const result = await renewAccess(BigInt(renewTokenId), renewPeriods);
      if (result.success) {
        toast({
          title: "Renewal successful",
          description: `Tx: ${result.transactionHash?.slice(0, 10)}...`,
        });
        setRenewTokenId("");
        setRenewPeriods(1);
      } else {
        toast({
          title: "Renewal failed",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Renewal failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRenewing(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                My <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-xl text-gray-300">
                Manage your account settings and preferences
              </p>
            </div>

            <Button className="bg-orange-500 hover:bg-orange-600">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wallet Information */}
            <Card className="glass border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2 text-orange-400" />
                  Wallet Information
                </CardTitle>
                <CardDescription>
                  Your connected wallet and network status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                    <p className="font-mono text-sm text-white">
                      {walletAddress
                        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                        : "Not connected"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="flex items-center"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-sm text-gray-400">Network</p>
                    <p className="font-semibold text-green-400">BaseCAMP L1</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-sm text-gray-400">Origin Multiplier</p>
                    <p className="font-semibold text-orange-400">
                      {analyticsLoading
                        ? "..."
                        : `${usageStats?.user?.multiplier || 1}x`}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-sm text-gray-400">Origin Status</p>
                    <Badge
                      className={`${usageStats?.user?.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                    >
                      {analyticsLoading
                        ? "Loading..."
                        : usageStats?.user?.active
                          ? "Active"
                          : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-400">
                      Wallet Balance
                    </h4>
                    <span className="text-lg font-bold text-blue-400">
                      {balanceLoading ? "..." : `${walletBalance} ETH`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Your current wallet balance for purchasing licenses
                  </p>
                </div>

                {/* Origin Stats */}
                {usageStats && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-orange-400">
                        Origin Points
                      </h4>
                      <span className="text-lg font-bold text-orange-400">
                        {usageStats.user?.points.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Earn points by uploading content and engaging with the
                      platform
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscriptions */}
            <Subscriptions />

            {/* Content Management */}
            <Card className="glass border-gray-800">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Manage your uploaded content and licensing terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Total Content
                      </span>
                      <span className="font-medium text-white">
                        {analyticsLoading
                          ? "..."
                          : usageStats?.dataSources?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Data Sources
                      </span>
                      <span className="font-medium text-white">
                        {analyticsLoading
                          ? "..."
                          : usageStats?.dataSources?.length || 0}
                      </span>
                    </div>
                  </div>
                  <Link href="/dashboard">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      Manage Content
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <TransactionHistory />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Licenses & Renewals */}
            <Card className="glass border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-orange-400" />
                  Licenses & Renewals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    Renew your dataset access when a license is about to expire
                    or has expired.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="renew-token">Token ID</Label>
                      <Input
                        id="renew-token"
                        placeholder="Enter IpNFT tokenId"
                        value={renewTokenId}
                        onChange={(e) => setRenewTokenId(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="renew-periods">Periods</Label>
                      <Input
                        id="renew-periods"
                        type="number"
                        min={1}
                        max={12}
                        value={renewPeriods}
                        onChange={(e) =>
                          setRenewPeriods(Math.max(1, Number(e.target.value)))
                        }
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleRenew}
                      disabled={isRenewing}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {isRenewing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew Access
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    Creator tip: after licenses expire, you can revise terms
                    (price, duration, royalty) to encourage renewals.
                  </p>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Revise License Terms
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            {/* Preferences */}
            <Card className="glass border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-orange-400" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default License Terms */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Default License Duration
                  </Label>
                  <Select
                    value={preferences.defaultLicenseDuration}
                    onValueChange={(value) =>
                      handlePreferenceChange("defaultLicenseDuration", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Default Royalty (%)
                  </Label>
                  <Input
                    type="number"
                    min="85"
                    max="98"
                    value={preferences.defaultRoyalty}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "defaultRoyalty",
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>

                <Separator />

                {/* Notification Settings */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("emailNotifications", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">
                        Push Notifications
                      </Label>
                      <Switch
                        id="push-notifications"
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("pushNotifications", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Privacy Settings */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="public-profile">Public Profile</Label>
                      <Switch
                        id="public-profile"
                        checked={preferences.publicProfile}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("publicProfile", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-earnings">Show Earnings</Label>
                      <Switch
                        id="show-earnings"
                        checked={preferences.showEarnings}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("showEarnings", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass border-gray-800">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-400 hover:text-red-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
