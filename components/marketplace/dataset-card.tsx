"use client";

import { useState } from 'react';
import Image from 'next/image';
import { 
  Star, 
  Download, 
  Eye, 
  Shield, 
  Clock,
  Tag,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Dataset {
  id: string;
  title: string;
  creator: string;
  creatorVerified: boolean;
  type: string;
  price: number;
  currency: string;
  samples: number;
  downloads: number;
  rating: number;
  tags: string[];
  previewUrl?: string;
  description: string;
}

interface DatasetCardProps {
  dataset: Dataset;
  viewMode: 'grid' | 'list';
}

const typeColors = {
  image: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  text: 'bg-green-500/20 text-green-400 border-green-500/30',
  audio: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  video: 'bg-red-500/20 text-red-400 border-red-500/30',
  code: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  social: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export default function DatasetCard({ dataset, viewMode }: DatasetCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  
  if (viewMode === 'list') {
    return (
      <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Preview/Icon */}
          <div className="w-full md:w-24 h-24 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
            {dataset.previewUrl ? (
              <Image
                src={dataset.previewUrl}
                alt={dataset.title}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {dataset.title}
                  </h3>
                  {dataset.creatorVerified && (
                    <Shield className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {dataset.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <Badge className={typeColors[dataset.type as keyof typeof typeColors] || typeColors.text}>
                    {dataset.type}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    {dataset.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {dataset.downloads}
                  </span>
                  <span>{dataset.samples.toLocaleString()} samples</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xl font-bold text-orange-400">
                    {dataset.price} {dataset.currency}
                  </div>
                  <div className="text-xs text-gray-500">per license</div>
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{dataset.title}</DialogTitle>
                        <DialogDescription>
                          Dataset preview and licensing information
                        </DialogDescription>
                      </DialogHeader>
                      {/* Preview content would go here */}
                      <div className="p-6 bg-gray-800 rounded-lg">
                        <p>Dataset preview and metadata would be displayed here.</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    License Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="glass rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 group hover:scale-105">
      {/* Preview Image */}
      <div className="aspect-video bg-gray-800 relative overflow-hidden">
        {dataset.previewUrl ? (
          <Image
            src={dataset.previewUrl}
            alt={dataset.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3">
          <Badge className={typeColors[dataset.type as keyof typeof typeColors] || typeColors.text}>
            {dataset.type}
          </Badge>
        </div>
        
        {dataset.creatorVerified && (
          <div className="absolute top-3 right-3">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
        )}

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mr-2">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{dataset.title}</DialogTitle>
                <DialogDescription>
                  Dataset preview and licensing information
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 bg-gray-800 rounded-lg">
                <p>Dataset preview and metadata would be displayed here.</p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
            <ExternalLink className="h-4 w-4 mr-1" />
            License
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
            {dataset.title}
          </h3>
          <div className="text-right flex-shrink-0 ml-3">
            <div className="text-lg font-bold text-orange-400">
              {dataset.price} {dataset.currency}
            </div>
            <div className="text-xs text-gray-500">per license</div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {dataset.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {dataset.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              {dataset.rating}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {dataset.downloads}
            </span>
          </div>
          <span>{dataset.samples.toLocaleString()} samples</span>
        </div>
      </div>
    </div>
  );
}