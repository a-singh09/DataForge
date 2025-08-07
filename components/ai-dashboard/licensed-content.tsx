"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Eye, 
  Calendar, 
  FileText, 
  Image, 
  Music, 
  Video, 
  Code,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

const licensedDatasets = [
  {
    id: '1',
    title: 'Premium Photography Collection',
    type: 'image',
    creator: '0x1234...5678',
    licenseDate: '2024-01-15',
    expiryDate: '2025-01-15',
    price: 0.5,
    currency: 'ETH',
    samples: 15420,
    downloadProgress: 100,
    status: 'active',
    downloadUrl: 'https://api.creatorvault.ai/download/dataset1',
    usageCount: 1250000
  },
  {
    id: '2',
    title: 'Social Media Text Dataset',
    type: 'text',
    creator: '0x8765...4321',
    licenseDate: '2024-01-10',
    expiryDate: '2024-04-10',
    price: 0.3,
    currency: 'ETH',
    samples: 50000,
    downloadProgress: 100,
    status: 'active',
    downloadUrl: 'https://api.creatorvault.ai/download/dataset2',
    usageCount: 890000
  },
  {
    id: '3',
    title: 'Audio Music Samples',
    type: 'audio',
    creator: '0x9876...1234',
    licenseDate: '2024-01-08',
    expiryDate: '2025-01-08',
    price: 0.8,
    currency: 'ETH',
    samples: 3200,
    downloadProgress: 75,
    status: 'downloading',
    downloadUrl: 'https://api.creatorvault.ai/download/dataset3',
    usageCount: 45000
  },
  {
    id: '4',
    title: 'Code Repository Dataset',
    type: 'code',
    creator: '0x5432...8765',
    licenseDate: '2024-01-05',
    expiryDate: '2024-07-05',
    price: 1.2,
    currency: 'ETH',
    samples: 8750,
    downloadProgress: 100,
    status: 'expiring_soon',
    downloadUrl: 'https://api.creatorvault.ai/download/dataset4',
    usageCount: 2100000
  }
];

const typeIcons = {
  image: Image,
  text: FileText,
  audio: Music,
  video: Video,
  code: Code,
};

const typeColors = {
  image: 'bg-blue-500/20 text-blue-400',
  text: 'bg-green-500/20 text-green-400',
  audio: 'bg-purple-500/20 text-purple-400',
  video: 'bg-red-500/20 text-red-400',
  code: 'bg-yellow-500/20 text-yellow-400',
};

const statusColors = {
  active: 'bg-green-500/20 text-green-400',
  downloading: 'bg-blue-500/20 text-blue-400',
  expiring_soon: 'bg-yellow-500/20 text-yellow-400',
  expired: 'bg-red-500/20 text-red-400',
};

export default function LicensedContent() {
  const [filter, setFilter] = useState('all');

  const filteredDatasets = licensedDatasets.filter(dataset => {
    if (filter === 'all') return true;
    return dataset.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-blue-400">47</p>
            <p className="text-sm text-gray-400">Total Licenses</p>
          </CardContent>
        </Card>
        <Card className="glass border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-green-400">42</p>
            <p className="text-sm text-gray-400">Active</p>
          </CardContent>
        </Card>
        <Card className="glass border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-yellow-400">3</p>
            <p className="text-sm text-gray-400">Expiring Soon</p>
          </CardContent>
        </Card>
        <Card className="glass border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-purple-400">847 GB</p>
            <p className="text-sm text-gray-400">Total Data</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'active', 'downloading', 'expiring_soon', 'expired'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Licensed Datasets */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Licensed Datasets</CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDatasets.map((dataset) => {
              const TypeIcon = typeIcons[dataset.type as keyof typeof typeIcons];
              const daysUntilExpiry = getDaysUntilExpiry(dataset.expiryDate);
              
              return (
                <div key={dataset.id} className="p-6 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center">
                        <TypeIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{dataset.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Creator: {dataset.creator}</span>
                          <span>Licensed: {formatDate(dataset.licenseDate)}</span>
                          <span>{dataset.samples.toLocaleString()} samples</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={typeColors[dataset.type as keyof typeof typeColors]}>
                        {dataset.type}
                      </Badge>
                      <Badge className={statusColors[dataset.status as keyof typeof statusColors]}>
                        {dataset.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Download Progress */}
                  {dataset.status === 'downloading' && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Download Progress</span>
                        <span className="text-sm font-medium">{dataset.downloadProgress}%</span>
                      </div>
                      <Progress value={dataset.downloadProgress} className="h-2" />
                    </div>
                  )}

                  {/* License Info */}
                  <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-400">License Price</p>
                      <p className="font-medium text-orange-400">
                        {dataset.price} {dataset.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expires</p>
                      <p className="font-medium">
                        {formatDate(dataset.expiryDate)}
                        {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                          <span className="text-yellow-400 ml-1">
                            ({daysUntilExpiry} days)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Usage Count</p>
                      <p className="font-medium">{dataset.usageCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Status</p>
                      <p className="font-medium capitalize">
                        {dataset.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      disabled={dataset.downloadProgress < 100}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API Access
                    </Button>
                    {dataset.status === 'expiring_soon' && (
                      <Button variant="outline" size="sm" className="text-yellow-400 border-yellow-400/30">
                        <Calendar className="h-4 w-4 mr-2" />
                        Renew License
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}