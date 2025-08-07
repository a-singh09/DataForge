"use client";

import { useState } from 'react';
import { 
  Code, 
  Download, 
  Key, 
  ShoppingCart, 
  Shield, 
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ApiIntegration from '@/components/ai-dashboard/api-integration';
import LicensedContent from '@/components/ai-dashboard/licensed-content';
import BulkLicensing from '@/components/ai-dashboard/bulk-licensing';
import ComplianceAudit from '@/components/ai-dashboard/compliance-audit';

const quickStats = [
  {
    title: 'Licensed Datasets',
    value: '47',
    change: '+12 this month',
    icon: FileText,
    color: 'text-blue-400'
  },
  {
    title: 'API Calls',
    value: '1.2M',
    change: '+23% this week',
    icon: Code,
    color: 'text-green-400'
  },
  {
    title: 'Total Spend',
    value: '$24,847',
    change: '+$3,200 this month',
    icon: ShoppingCart,
    color: 'text-purple-400'
  },
  {
    title: 'Compliance Score',
    value: '98%',
    change: 'Excellent',
    icon: Shield,
    color: 'text-orange-400'
  }
];

export default function AIDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                AI Company <span className="gradient-text">Portal</span>
              </h1>
              <p className="text-xl text-gray-300">
                Manage your licensed datasets and API integrations
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Datasets
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="glass border-gray-800 hover:bg-white/5 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="bulk">Bulk</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="glass border-gray-800">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg">
                      <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Download className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dataset Downloaded</p>
                        <p className="text-xs text-gray-400">Premium Photography Collection</p>
                      </div>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg">
                      <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Code className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">API Key Generated</p>
                        <p className="text-xs text-gray-400">Production environment</p>
                      </div>
                      <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg">
                      <div className="h-8 w-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Bulk License Purchase</p>
                        <p className="text-xs text-gray-400">15 datasets licensed</p>
                      </div>
                      <span className="text-xs text-gray-500">3d ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card className="glass border-gray-800">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">API Usage</span>
                        <span className="text-sm font-medium">1.2M / 2M calls</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Storage Used</span>
                        <span className="text-sm font-medium">847 GB / 1 TB</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Monthly Budget</span>
                        <span className="text-sm font-medium">$24,847 / $30,000</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <ApiIntegration />
          </TabsContent>

          <TabsContent value="content">
            <LicensedContent />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkLicensing />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceAudit />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}