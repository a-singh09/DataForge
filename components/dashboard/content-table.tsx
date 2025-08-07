"use client";

import { useState } from 'react';
import Image from 'next/image';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Star, 
  DollarSign,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockContent = [
  {
    id: '1',
    title: 'Premium Photography Collection',
    type: 'image',
    preview: 'https://images.pexels.com/photos/1851415/pexels-photo-1851415.jpeg?auto=compress&cs=tinysrgb&w=100',
    price: 0.5,
    currency: 'ETH',
    licenses: 89,
    revenue: 44.5,
    rating: 4.8,
    uploadDate: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    title: 'Social Media Text Dataset',
    type: 'text',
    preview: null,
    price: 0.3,
    currency: 'ETH',
    licenses: 156,
    revenue: 46.8,
    rating: 4.6,
    uploadDate: '2024-01-10',
    status: 'active'
  },
  {
    id: '3',
    title: 'Audio Music Samples',
    type: 'audio',
    preview: null,
    price: 0.8,
    currency: 'ETH',
    licenses: 45,
    revenue: 36.0,
    rating: 4.9,
    uploadDate: '2024-01-08',
    status: 'active'
  },
  {
    id: '4',
    title: 'Code Repository Dataset',
    type: 'code',
    preview: null,
    price: 1.2,
    currency: 'ETH',
    licenses: 203,
    revenue: 243.6,
    rating: 4.7,
    uploadDate: '2024-01-05',
    status: 'paused'
  }
];

const typeColors = {
  image: 'bg-blue-500/20 text-blue-400',
  text: 'bg-green-500/20 text-green-400',
  audio: 'bg-purple-500/20 text-purple-400',
  video: 'bg-red-500/20 text-red-400',
  code: 'bg-yellow-500/20 text-yellow-400',
};

export default function ContentTable() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Content</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'table' ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Licenses</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {item.preview ? (
                          <Image
                            src={item.preview}
                            alt={item.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColors[item.type as keyof typeof typeColors]}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {item.price} {item.currency}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Download className="h-4 w-4 text-gray-400" />
                      <span>{item.licenses}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-400">
                      {item.revenue} {item.currency}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{item.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Pricing
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockContent.map((item) => (
              <div key={item.id} className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={typeColors[item.type as keyof typeof typeColors]}>
                    {item.type}
                  </Badge>
                  <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="text-orange-400 font-medium">
                      {item.price} {item.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Licenses:</span>
                    <span>{item.licenses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="text-green-400 font-medium">
                      {item.revenue} {item.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}