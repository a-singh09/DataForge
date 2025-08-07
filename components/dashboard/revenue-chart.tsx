"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 2400, licenses: 24 },
  { name: 'Feb', revenue: 1398, licenses: 13 },
  { name: 'Mar', revenue: 9800, licenses: 98 },
  { name: 'Apr', revenue: 3908, licenses: 39 },
  { name: 'May', revenue: 4800, licenses: 48 },
  { name: 'Jun', revenue: 3800, licenses: 38 },
  { name: 'Jul', revenue: 4300, licenses: 43 },
];

interface RevenueChartProps {
  timeframe: string;
}

export default function RevenueChart({ timeframe }: RevenueChartProps) {
  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Revenue Analytics
          <span className="text-sm font-normal text-gray-400">{timeframe}</span>
        </CardTitle>
        <CardDescription>
          Track your earnings and license sales over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#F97316" 
                strokeWidth={3}
                dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F97316', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
          <div>
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">$12,847</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Avg. per License</p>
            <p className="text-2xl font-bold text-orange-400">$144</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}