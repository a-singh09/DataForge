"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, 
  Filter, 
  Search, 
  Plus, 
  Minus,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';

const availableDatasets = [
  {
    id: '1',
    title: 'Premium Photography Collection',
    type: 'image',
    creator: '0x1234...5678',
    price: 0.5,
    currency: 'ETH',
    samples: 15420,
    rating: 4.8,
    tags: ['photography', 'nature', 'high-res']
  },
  {
    id: '2',
    title: 'Social Media Text Dataset',
    type: 'text',
    creator: '0x8765...4321',
    price: 0.3,
    currency: 'ETH',
    samples: 50000,
    rating: 4.6,
    tags: ['social', 'nlp', 'sentiment']
  },
  {
    id: '3',
    title: 'Audio Music Samples',
    type: 'audio',
    creator: '0x9876...1234',
    price: 0.8,
    currency: 'ETH',
    samples: 3200,
    rating: 4.9,
    tags: ['music', 'audio', 'synthetic']
  },
  {
    id: '4',
    title: 'Code Repository Dataset',
    type: 'code',
    creator: '0x5432...8765',
    price: 1.2,
    currency: 'ETH',
    samples: 8750,
    rating: 4.7,
    tags: ['javascript', 'python', 'ml']
  },
  {
    id: '5',
    title: 'Video Content Library',
    type: 'video',
    creator: '0x2468...1357',
    price: 2.1,
    currency: 'ETH',
    samples: 1200,
    rating: 4.5,
    tags: ['video', 'content', 'training']
  }
];

const typeColors = {
  image: 'bg-blue-500/20 text-blue-400',
  text: 'bg-green-500/20 text-green-400',
  audio: 'bg-purple-500/20 text-purple-400',
  video: 'bg-red-500/20 text-red-400',
  code: 'bg-yellow-500/20 text-yellow-400',
};

export default function BulkLicensing() {
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [licenseDuration, setLicenseDuration] = useState('365');
  const [bulkDiscount, setBulkDiscount] = useState(0);

  const filteredDatasets = availableDatasets.filter(dataset => {
    const matchesSearch = dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || dataset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDatasetToggle = (datasetId: string) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId) 
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const calculateTotal = () => {
    const selectedItems = availableDatasets.filter(dataset => 
      selectedDatasets.includes(dataset.id)
    );
    const subtotal = selectedItems.reduce((sum, dataset) => sum + dataset.price, 0);
    
    // Calculate bulk discount
    let discount = 0;
    if (selectedDatasets.length >= 10) discount = 0.15;
    else if (selectedDatasets.length >= 5) discount = 0.10;
    else if (selectedDatasets.length >= 3) discount = 0.05;
    
    setBulkDiscount(discount);
    const total = subtotal * (1 - discount);
    
    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculateTotal();

  return (
    <div className="space-y-8">
      {/* Bulk Purchase Summary */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-orange-400" />
            Bulk License Purchase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">{selectedDatasets.length}</p>
              <p className="text-sm text-gray-400">Selected Datasets</p>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <p className="text-2xl font-bold text-green-400">{subtotal.toFixed(3)} ETH</p>
              <p className="text-sm text-gray-400">Subtotal</p>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">{(discount * 100).toFixed(0)}%</p>
              <p className="text-sm text-gray-400">Bulk Discount</p>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <p className="text-2xl font-bold text-orange-400">{total.toFixed(3)} ETH</p>
              <p className="text-sm text-gray-400">Total</p>
            </div>
          </div>
          
          {selectedDatasets.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium mb-2 block">
                    License Duration
                  </Label>
                  <Select value={licenseDuration} onValueChange={setLicenseDuration}>
                    <SelectTrigger className="w-48">
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
                
                <Button 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={selectedDatasets.length === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase {selectedDatasets.length} Licenses
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Discount Tiers */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle>Bulk Discount Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/30 rounded-lg text-center">
              <p className="text-lg font-bold text-green-400">5% OFF</p>
              <p className="text-sm text-gray-400">3-4 datasets</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg text-center">
              <p className="text-lg font-bold text-blue-400">10% OFF</p>
              <p className="text-sm text-gray-400">5-9 datasets</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg text-center">
              <p className="text-lg font-bold text-purple-400">15% OFF</p>
              <p className="text-sm text-gray-400">10+ datasets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dataset Selection */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Available Datasets</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDatasets.map((dataset) => (
              <div
                key={dataset.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedDatasets.includes(dataset.id)
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedDatasets.includes(dataset.id)}
                      onCheckedChange={() => handleDatasetToggle(dataset.id)}
                    />
                    <div>
                      <h3 className="font-semibold text-white">{dataset.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span>Creator: {dataset.creator}</span>
                        <span>{dataset.samples.toLocaleString()} samples</span>
                        <span>Rating: {dataset.rating}/5</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={typeColors[dataset.type as keyof typeof typeColors]}>
                          {dataset.type}
                        </Badge>
                        {dataset.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">
                      {dataset.price} {dataset.currency}
                    </p>
                    <p className="text-sm text-gray-400">per license</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Corporate Pricing */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle>Enterprise Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Need Custom Pricing?</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              For large-scale deployments, custom licensing terms, or enterprise support, 
              contact our team for personalized pricing and solutions.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Request Quote
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Contact Sales
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}