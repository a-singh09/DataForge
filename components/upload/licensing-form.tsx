"use client";

import { useState, useEffect } from "react";
import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Clock,
  Percent,
  Info,
  AlertCircle,
} from "lucide-react";

interface LicensingFormProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

// Payment tokens supported by Origin SDK on BaseCAMP
const paymentTokens = [
  {
    value: "0x0000000000000000000000000000000000000000",
    label: "ETH (Native)",
    symbol: "ETH",
    decimals: 18,
  },
  // Add other supported tokens as needed
];

const licenseDurations = [
  { value: 30 * 24 * 60 * 60, label: "30 Days", displayValue: "30" },
  { value: 90 * 24 * 60 * 60, label: "90 Days", displayValue: "90" },
  { value: 365 * 24 * 60 * 60, label: "1 Year", displayValue: "365" },
  {
    value: 10 * 365 * 24 * 60 * 60,
    label: "10 Years",
    displayValue: "lifetime",
  },
];

export default function LicensingForm({
  data,
  onDataChange,
  onNext,
  onBack,
}: LicensingFormProps) {
  const { authenticated } = useAuthState();
  const auth = useAuth();

  const [licensing, setLicensing] = useState({
    fixedPrice: 0.01, 
    duration: 365 * 24 * 60 * 60, // 1 year in seconds
    royaltyPercentage: 95, // 95% to creator, 5% platform fee
    paymentToken: "0x0000000000000000000000000000000000000000", // Native ETH
    ...data.licensing,
  });

  // Set initial license terms when component mounts
  useEffect(() => {
    const licenseTerms = {
      price: BigInt(Math.floor(licensing.fixedPrice * 1e18)), // Convert to wei
      duration: licensing.duration,
      royaltyBps: licensing.royaltyPercentage * 100, // Convert percentage to basis points
      paymentToken: licensing.paymentToken as `0x${string}`,
    };

    onDataChange({
      licensing,
      licenseTerms,
    });
  }, []); // Only run on mount

  const handleChange = (field: string, value: any) => {
    const updated = { ...licensing, [field]: value };
    setLicensing(updated);

    // Create Origin SDK compatible license terms
    const licenseTerms = {
      price: BigInt(Math.floor(updated.fixedPrice * 1e18)), // Convert to wei
      duration: updated.duration,
      royaltyBps: updated.royaltyPercentage * 100, // Convert percentage to basis points
      paymentToken: updated.paymentToken as `0x${string}`,
    };

    onDataChange({
      licensing: updated,
      licenseTerms,
    });
  };

  const selectedToken = paymentTokens.find(
    (token) => token.value === licensing.paymentToken,
  );
  const selectedDuration = licenseDurations.find(
    (d) => d.value === licensing.duration,
  );
  const platformFee = (100 - licensing.royaltyPercentage) / 100;
  const creatorEarning =
    licensing.fixedPrice * (licensing.royaltyPercentage / 100);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Set Licensing Terms</h2>
        <p className="text-gray-400 text-lg">
          Configure pricing and terms for AI companies to license your content
        </p>
      </div>

      {/* Authentication Warning */}
      {!authenticated && (
        <Alert className="border-orange-500/20 bg-orange-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to connect your wallet to set licensing terms and mint
            IpNFTs.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {/* Pricing Section */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-orange-400" />
            Pricing
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Fixed Price */}
            <div>
              <Label
                htmlFor="price"
                className="text-base font-medium mb-3 block"
              >
                Fixed Price *
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={licensing.fixedPrice}
                  onChange={(e) =>
                    handleChange(
                      "fixedPrice",
                      parseFloat(e.target.value) || 0.1,
                    )
                  }
                  className="h-12 text-lg pr-16"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {selectedToken?.symbol || "ETH"}
                </div>
              </div>
            </div>

            {/* Payment Token */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Payment Token
              </Label>
              <Select
                value={licensing.paymentToken}
                onValueChange={(value) => handleChange("paymentToken", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTokens.map((token) => (
                    <SelectItem key={token.value} value={token.value}>
                      {token.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* License Duration */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-400" />
            License Duration
          </h3>

          <Select
            value={licensing.duration.toString()}
            onValueChange={(value) => handleChange("duration", parseInt(value))}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {licenseDurations.map((duration) => (
                <SelectItem
                  key={duration.value}
                  value={duration.value.toString()}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{duration.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-sm text-gray-400 mt-3">
            Longer licenses typically command higher prices and provide more
            value
          </p>
        </div>

        {/* Royalty Settings */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Percent className="h-5 w-5 mr-2 text-orange-400" />
            Creator Royalty
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-base font-medium">
                  Your Royalty Percentage
                </Label>
                <span className="text-xl font-bold text-green-400">
                  {licensing.royaltyPercentage}%
                </span>
              </div>

              <Slider
                value={[licensing.royaltyPercentage]}
                onValueChange={(value) =>
                  handleChange("royaltyPercentage", value[0])
                }
                min={85}
                max={98}
                step={1}
                className="mb-4"
              />

              <div className="flex justify-between text-sm text-gray-400">
                <span>85% (Min)</span>
                <span>98% (Max)</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-2">
                    Royalty Information
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    CreatorVault takes a small platform fee (2-15%) to maintain
                    the marketplace and handle payments. The remaining
                    percentage goes directly to you as the creator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="glass rounded-2xl p-8 bg-gradient-to-br from-orange-500/10 to-purple-500/10">
          <h3 className="text-xl font-semibold mb-6">Pricing Summary</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">License Price:</span>
              <span className="text-lg font-semibold">
                {licensing.fixedPrice} {selectedToken?.symbol || "ETH"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">License Duration:</span>
              <span className="font-medium">{selectedDuration?.label}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Royalty (Basis Points):</span>
              <span className="font-medium">
                {licensing.royaltyPercentage * 100} BPS
              </span>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">
                  Platform Fee ({100 - licensing.royaltyPercentage}%):
                </span>
                <span className="text-red-400">
                  -{(licensing.fixedPrice * platformFee).toFixed(4)}{" "}
                  {selectedToken?.symbol || "ETH"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Your Earnings:</span>
                <span className="text-xl font-bold text-green-400">
                  {creatorEarning.toFixed(4)} {selectedToken?.symbol || "ETH"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={!authenticated}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
        >
          {authenticated ? "Review & Mint IpNFT" : "Connect Wallet to Continue"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
