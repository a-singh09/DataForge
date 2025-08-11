"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMarketplaceContext } from "./marketplace-provider";
import {
  Image,
  FileText,
  Music,
  Video,
  Code,
  Hash,
  Shield,
  Clock,
  RotateCcw,
} from "lucide-react";

const contentTypes = [
  { id: "image", label: "Images", icon: Image },
  { id: "text", label: "Text", icon: FileText },
  { id: "audio", label: "Audio", icon: Music },
  { id: "video", label: "Video", icon: Video },
  { id: "code", label: "Code", icon: Code },
  { id: "social", label: "Social", icon: Hash },
];

const licenseDurations = [
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "1y", label: "1 Year" },
  { id: "lifetime", label: "Lifetime" },
];

const uploadTimes = [
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
];

export default function FilterSidebar() {
  const { filters, updateFilters, clearFilters } = useMarketplaceContext();

  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    filters.contentTypes || [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(
    filters.priceRange || [0, 5],
  );
  const [verifiedOnly, setVerifiedOnly] = useState(
    filters.verifiedOnly || false,
  );
  const [selectedDurations, setSelectedDurations] = useState<string[]>(
    filters.licenseDurations || [],
  );
  const [selectedUploadTime, setSelectedUploadTime] = useState<string>(
    filters.uploadTimeframe || "",
  );

  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, typeId]);
    } else {
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId));
    }
  };

  const handleDurationChange = (durationId: string, checked: boolean) => {
    if (checked) {
      setSelectedDurations([...selectedDurations, durationId]);
    } else {
      setSelectedDurations(selectedDurations.filter((id) => id !== durationId));
    }
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setPriceRange([0, 5]);
    setVerifiedOnly(false);
    setSelectedDurations([]);
    setSelectedUploadTime("");
    clearFilters();
  };

  const applyFilters = () => {
    updateFilters({
      contentTypes: selectedTypes,
      priceRange,
      verifiedOnly,
      licenseDurations: selectedDurations,
      uploadTimeframe: selectedUploadTime,
    });
  };

  // Update local state when context filters change
  useEffect(() => {
    setSelectedTypes(filters.contentTypes || []);
    setPriceRange(filters.priceRange || [0, 5]);
    setVerifiedOnly(filters.verifiedOnly || false);
    setSelectedDurations(filters.licenseDurations || []);
    setSelectedUploadTime(filters.uploadTimeframe || "");
  }, [filters]);

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-gray-400 hover:text-orange-400"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Content Type */}
      <div className="mb-8">
        <h4 className="font-medium mb-4 flex items-center">
          <Hash className="h-4 w-4 mr-2" />
          Content Type
        </h4>
        <div className="space-y-3">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.id} className="flex items-center space-x-3">
                <Checkbox
                  id={type.id}
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={(checked) =>
                    handleTypeChange(type.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={type.id}
                  className="flex items-center space-x-2 cursor-pointer flex-1"
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="font-medium mb-4">Price Range (ETH)</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={5}
            min={0}
            step={0.1}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{priceRange[0]} ETH</span>
            <span>{priceRange[1]} ETH</span>
          </div>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Creator Verification */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="verified"
            checked={verifiedOnly}
            onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
          />
          <Label
            htmlFor="verified"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Shield className="h-4 w-4 text-blue-400" />
            <span>Verified Creators Only</span>
          </Label>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* License Duration */}
      <div className="mb-8">
        <h4 className="font-medium mb-4 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          License Duration
        </h4>
        <div className="space-y-3">
          {licenseDurations.map((duration) => (
            <div key={duration.id} className="flex items-center space-x-3">
              <Checkbox
                id={duration.id}
                checked={selectedDurations.includes(duration.id)}
                onCheckedChange={(checked) =>
                  handleDurationChange(duration.id, checked as boolean)
                }
              />
              <Label
                htmlFor={duration.id}
                className="cursor-pointer flex-1 flex justify-between"
              >
                <span>{duration.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Upload Date */}
      <div className="mb-8">
        <h4 className="font-medium mb-4">Upload Date</h4>
        <div className="space-y-3">
          {uploadTimes.map((time) => (
            <div key={time.id} className="flex items-center space-x-3">
              <Checkbox
                id={time.id}
                checked={selectedUploadTime === time.id}
                onCheckedChange={(checked) =>
                  setSelectedUploadTime(checked ? time.id : "")
                }
              />
              <Label
                htmlFor={time.id}
                className="cursor-pointer flex-1 flex justify-between"
              >
                <span>{time.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <Button
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        onClick={applyFilters}
      >
        Apply Filters
      </Button>
    </div>
  );
}
