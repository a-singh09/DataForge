"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, Users, Clock, Target } from 'lucide-react';

const contentTypeData = [
  { name: 'Images', value: 45, color: '#3B82F6' },
  { name: 'Text', value: 30, color: '#10B981' },
  { name: 'Audio', value: 15, color: '#8B5CF6' },
  { name: 'Video', value: 10, color: '#EF4444' },
];

const licenseDurationData = [
  { name: '30 Days', licenses: 45, revenue: 1350 },
  { name: '90 Days', licenses: 78, revenue: 3900 },
  { name: '1 Year', licenses: 123, revenue: 9840 },
  { name: 'Lifetime', licenses: 34, revenue: 6800 },
];

const demographicsData = [
  { category: 'AI Startups', percentage: 45 },
  { category: 'Enterprise', percentage: 30 },
  { category: 'Research', percentage: 15 },
  { category: 'Individual', percentage: 10 },
];

export default function AnalyticsInsights() {
  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Most Popular Type</p>
                <p className="text-xl font-bold text-blue-400">Images</p>
                <p className="text-sm text-gray-500">45% of content</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Top License Duration</p>
                <p className="text-xl font-bold text-green-400">1 Year</p>
                <p className="text-sm text-gray-500">123 licenses</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Primary Audience</p>
                <p className="text-xl font-bold text-purple-400">AI Startups</p>
                <p className="text-sm text-gray-500">45% of buyers</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversion Rate</p>
                <p className="text-xl font-bold text-orange-400">12.5%</p>
                <p className="text-sm text-gray-500">Views to licenses</p>
              </div>
              <Target className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Content Type Distribution */}
        <Card className="glass border-gray-800">
          <CardHeader>
            <CardTitle>Content Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {contentTypeData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-400">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* License Duration Preferences */}
        <Card className="glass border-gray-800">
          <CardHeader>
            <CardTitle>License Duration Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={licenseDurationData}>
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
                  <Bar dataKey="licenses" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Demographics */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle>Customer Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demographicsData.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-gray-300">{item.category}</span>
                <div className="flex items-center space-x-4 flex-1 max-w-xs">
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}