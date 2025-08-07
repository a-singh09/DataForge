"use client";

import { useState } from 'react';
import { Search, Filter, Grid, List, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatasetCard from '@/components/marketplace/dataset-card';
import FilterSidebar from '@/components/marketplace/filter-sidebar';

const mockDatasets = [
  {
    id: '1',
    title: 'Premium Photography Collection',
    creator: '0x1234...5678',
    creatorVerified: true,
    type: 'image',
    price: 0.5,
    currency: 'ETH',
    samples: 15420,
    downloads: 89,
    rating: 4.8,
    tags: ['photography', 'nature', 'high-res'],
    previewUrl: 'https://images.pexels.com/photos/1851415/pexels-photo-1851415.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'High-quality nature photography dataset perfect for computer vision training.',
  },
  {
    id: '2',
    title: 'Social Media Text Dataset',
    creator: '0x8765...4321',
    creatorVerified: false,
    type: 'text',
    price: 0.3,
    currency: 'ETH',
    samples: 50000,
    downloads: 156,
    rating: 4.6,
    tags: ['social', 'nlp', 'sentiment'],
    previewUrl: null,
    description: 'Curated social media posts with sentiment analysis labels.',
  },
  {
    id: '3',
    title: 'Audio Music Samples',
    creator: '0x9876...1234',
    creatorVerified: true,
    type: 'audio',
    price: 0.8,
    currency: 'ETH',
    samples: 3200,
    downloads: 45,
    rating: 4.9,
    tags: ['music', 'audio', 'synthetic'],
    previewUrl: null,
    description: 'Professional music samples for audio AI training.',
  },
  {
    id: '4',
    title: 'Code Repository Dataset',
    creator: '0x5432...8765',
    creatorVerified: true,
    type: 'code',
    price: 1.2,
    currency: 'ETH',
    samples: 8750,
    downloads: 203,
    rating: 4.7,
    tags: ['javascript', 'python', 'ml'],
    previewUrl: null,
    description: 'Clean, documented code samples for AI code generation training.',
  }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
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
              Discover high-quality, licensed datasets from verified creators worldwide
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
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
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
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
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
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dataset Grid */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
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