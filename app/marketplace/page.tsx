"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Grid, List, TrendingUp, Loader2 } from "lucide-react";
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
import { MarketplaceProvider, useMarketplaceContext } from "@/components/marketplace/marketplace-provider";
import { useAuthState } from "@campnetwork/origin/react";
import { toast } from "@/hooks/use-toast";

import { MarketplaceFilters } from "@/types/marketplace";

function MarketplaceContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<MarketplaceFilters["sortBy"]>("popular");
  const [showFilters, setShowFilters] = useState(false);
  const { authenticated } = useAuthState();
  const ctx = useMarketplaceContext();
  const datasets = ctx.data;
  const totalCount = ctx.totalCount;
  const isLoading = ctx.isLoading;
  const isError = ctx.isError;
  const error = ctx.error;
  const refetch = ctx.refetch;

  // Sync local search/sort with marketplace context filters
  useEffect(() => {
    ctx.updateFilters({
      searchQuery: searchQuery.trim() || undefined,
      sortBy,
    });
  }, [searchQuery, sortBy]);

  // Fetch trending datasets for the hero section (currently unused but ready for future features)
  // const { data: trendingDatasets, isLoading: isTrendingLoading } = useTrendingIpNFTs(6);

  // Handle authentication requirement
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access the marketplace
          </p>
          <Button
            onClick={() =>
              toast({
                title: "Connect Wallet",
                description:
                  "Use the connect button in the navigation to get started",
              })
            }
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading && datasets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading marketplace data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    console.error("Marketplace error:", error);
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">
            Error Loading Data
          </h2>
          <p className="text-gray-400 mb-6">
            {error?.message || "Failed to load marketplace data"}
          </p>
          <div className="text-xs text-gray-500 mb-4 max-w-md">
            This might be because no Origin uploads were found. The marketplace
            will show mock data as a fallback.
          </div>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

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
                <p className="text-gray-400">{totalCount} datasets found</p>
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
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as MarketplaceFilters["sortBy"])
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Popular
                      </div>
                    </SelectItem>
                    <SelectItem value="price_low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price_high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dataset Grid */}
            {datasets.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {datasets.map((dataset) => (
                  <DatasetCard
                    key={dataset.tokenId.toString()}
                    dataset={dataset}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">No datasets found</p>
                <p className="text-gray-500">
                  Try adjusting your search or filters to find more datasets
                </p>
              </div>
            )}

            {/* Load More - Only show if there are more items */}
            {datasets.length > 0 && datasets.length < totalCount && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    // This would typically load more data
                    // For now, we'll show a message about pagination
                    toast({
                      title: "Load More",
                      description:
                        "Pagination will be implemented with infinite scroll",
                    });
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Datasets"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <MarketplaceProvider
      initialFilters={{}}
      initialViewMode="grid"
      initialPaginationMode="infinite"
      itemsPerPage={20}
    >
      <MarketplaceContent />
    </MarketplaceProvider>
  );
}
