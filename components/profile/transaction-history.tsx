"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  Filter,
  Calendar
} from 'lucide-react';

const transactions = [
  {
    id: '1',
    type: 'license_sale',
    title: 'License Sale',
    description: 'Premium Photography Collection',
    amount: 0.475,
    currency: 'ETH',
    status: 'completed',
    timestamp: '2024-01-20T10:30:00Z',
    txHash: '0xabcd1234...',
    direction: 'in'
  },
  {
    id: '2',
    type: 'mint_fee',
    title: 'Minting Fee',
    description: 'Audio Music Samples',
    amount: 0.025,
    currency: 'ETH',
    status: 'completed',
    timestamp: '2024-01-19T15:45:00Z',
    txHash: '0xefgh5678...',
    direction: 'out'
  },
  {
    id: '3',
    type: 'royalty',
    title: 'Royalty Payment',
    description: 'Social Media Text Dataset',
    amount: 0.285,
    currency: 'ETH',
    status: 'completed',
    timestamp: '2024-01-18T09:15:00Z',
    txHash: '0xijkl9012...',
    direction: 'in'
  },
  {
    id: '4',
    type: 'license_sale',
    title: 'License Sale',
    description: 'Code Repository Dataset',
    amount: 1.14,
    currency: 'ETH',
    status: 'pending',
    timestamp: '2024-01-17T14:20:00Z',
    txHash: '0xmnop3456...',
    direction: 'in'
  },
  {
    id: '5',
    type: 'withdrawal',
    title: 'Withdrawal',
    description: 'To external wallet',
    amount: 5.0,
    currency: 'ETH',
    status: 'completed',
    timestamp: '2024-01-15T11:00:00Z',
    txHash: '0xqrst7890...',
    direction: 'out'
  }
];

export default function TransactionHistory() {
  const [filter, setFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('30d');

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'income') return tx.direction === 'in';
    if (filter === 'expenses') return tx.direction === 'out';
    return tx.type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expenses">Expenses</SelectItem>
                <SelectItem value="license_sale">Sales</SelectItem>
                <SelectItem value="royalty">Royalties</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
                <SelectItem value="90d">90D</SelectItem>
                <SelectItem value="1y">1Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  tx.direction === 'in' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {tx.direction === 'in' ? (
                    <ArrowDownLeft className="h-5 w-5 text-green-400" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-red-400" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-white">{tx.title}</p>
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{tx.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  tx.direction === 'in' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.direction === 'in' ? '+' : '-'}{tx.amount} {tx.currency}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-orange-400 p-0 h-auto"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="text-xs">{tx.txHash}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <Button variant="outline">
            Load More Transactions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}