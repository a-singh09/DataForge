"use client";

import { useState } from "react";
import { Search, Filter, Grid, List, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatasetCard from "@/components/marketplace/dataset-card";
import FilterSidebar from "@/components/marketplace/filter-sidebar";

import { IpNFTMetadata } from "@/types/marketplace";

const mockDatasets: IpNFTMetadata[] = [
  {
    tokenId: BigInt(1),
    title: "Premium Photography Collection",
    description:
      "High-quality nature photography dataset perfect for computer vision training.",
    contentType: "image",
    creator: {
      address: "0x1234567890123456789012345678901234567890",
      socialProfiles: {
        twitter: "photographer_ai",
      },
      verified: true,
    },
    license: {
      price: BigInt("500000000000000000"), // 0.5 ETH
      duration: 365 * 24 * 60 * 60, // 1 year
      royaltyBps: 500, // 5%
      paymentToken: "0x0000000000000000000000000000000000000000",
    },
    contentHash: "QmHash1234567890abcdef",
    uri: "ipfs://QmHash1234567890abcdef",
    createdAt: Date.now() - 86400000,
    tags: ["photography", "nature", "high-res"],
    previewUrl:
      "https://images.pexels.com/photos/1851415/pexels-photo-1851415.jpeg?auto=compress&cs=tinysrgb&w=400",
    samples: 15420,
    downloads: 89,
    rating: 4.8,
  },
  {
    tokenId: BigInt(2),
    title: "Social Media Text Dataset",
    description: "Curated social media posts with sentiment analysis labels.",
    contentType: "text",
    creator: {
      address: "0x8765432109876543210987654321098765432109",
      socialProfiles: {},
      verified: false,
    },
    license: {
      price: BigInt("300000000000000000"), // 0.3 ETH
      duration: 180 * 24 * 60 * 60, // 6 months
      royaltyBps: 300, // 3%
      paymentToken: "0x0000000000000000000000000000000000000000",
    },
    contentHash: "QmHash2345678901bcdefg",
    uri: "ipfs://QmHash2345678901bcdefg",
    createdAt: Date.now() - 172800000,
    tags: ["social", "nlp", "sentiment"],
    samples: 50000,
    downloads: 156,
    rating: 4.6,
  },
  {
    tokenId: BigInt(3),
    title: "Audio Music Samples",
    description: "Professional music samples for audio AI training.",
    contentType: "audio",
    creator: {
      address: "0x9876543210987654321098765432109876543210",
      socialProfiles: {
        spotify: "ai_music_creator",
      },
      verified: true,
    },
    license: {
      price: BigInt("800000000000000000"), // 0.8 ETH
      duration: 730 * 24 * 60 * 60, // 2 years
      royaltyBps: 750, // 7.5%
      paymentToken: "0x0000000000000000000000000000000000000000",
    },
    contentHash: "QmHash3456789012cdefgh",
    uri: "ipfs://QmHash3456789012cdefgh",
    createdAt: Date.now() - 259200000,
    tags: ["music", "audio", "synthetic"],
    samples: 3200,
    downloads: 45,
    rating: 4.9,
  },
  {
    tokenId: BigInt(4),
    title: "Code Repository Dataset",
    description:
      "Clean, documented code samples for AI code generation training.",
    contentType: "code",
    creator: {
      address: "0x5432109876543210987654321098765432109876",
      socialProfiles: {
        twitter: "dev_ai_trainer",
      },
      verified: true,
    },
    license: {
      price: BigInt("1200000000000000000"), // 1.2 ETH
      duration: 365 * 24 * 60 * 60, // 1 year
      royaltyBps: 600, // 6%
      paymentToken: "0x0000000000000000000000000000000000000000",
    },
    contentHash: "QmHash4567890123defghi",
    uri: "ipfs://QmHash4567890123defghi",
    createdAt: Date.now() - 345600000,
    tags: ["javascript", "python", "ml"],
    samples: 8750,
    downloads: 203,
    rating: 4.7,
  },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI Training <span className="gradient-text">Datasets</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover high-quality, licensed datasets from verified creators
              worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search datasets, creators, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-gray-900/50 border-gray-700 focus:border-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <FilterSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <p className="text-gray-400">
                  {mockDatasets.length} datasets found
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Popularity
                      </div>
                    </SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dataset Grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {mockDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Datasets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
