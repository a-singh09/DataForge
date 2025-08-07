"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download,
  Eye,
  FileText,
  Users,
  Globe,
  Lock
} from 'lucide-react';

const complianceMetrics = [
  {
    category: 'Data Usage Compliance',
    score: 98,
    status: 'excellent',
    description: 'Adherence to licensing terms and usage restrictions'
  },
  {
    category: 'Ethical AI Standards',
    score: 95,
    status: 'excellent',
    description: 'Compliance with ethical AI development practices'
  },
  {
    category: 'Privacy Protection',
    score: 92,
    status: 'good',
    description: 'Data privacy and user consent compliance'
  },
  {
    category: 'Attribution Requirements',
    score: 88,
    status: 'good',
    description: 'Proper attribution and credit to content creators'
  }
];

const auditLogs = [
  {
    id: '1',
    timestamp: '2024-01-20T10:30:00Z',
    action: 'Dataset Access',
    dataset: 'Premium Photography Collection',
    user: 'ai-training-team@company.com',
    status: 'compliant',
    details: 'Accessed within license terms'
  },
  {
    id: '2',
    timestamp: '2024-01-20T09:15:00Z',
    action: 'Model Training',
    dataset: 'Social Media Text Dataset',
    user: 'ml-engineer@company.com',
    status: 'compliant',
    details: 'Training completed with proper attribution'
  },
  {
    id: '3',
    timestamp: '2024-01-19T16:45:00Z',
    action: 'Data Export',
    dataset: 'Audio Music Samples',
    user: 'data-scientist@company.com',
    status: 'flagged',
    details: 'Export exceeded license limits - resolved'
  },
  {
    id: '4',
    timestamp: '2024-01-19T14:20:00Z',
    action: 'API Access',
    dataset: 'Code Repository Dataset',
    user: 'api-service',
    status: 'compliant',
    details: 'Automated access within rate limits'
  },
  {
    id: '5',
    timestamp: '2024-01-18T11:30:00Z',
    action: 'License Renewal',
    dataset: 'Premium Photography Collection',
    user: 'admin@company.com',
    status: 'compliant',
    details: 'License renewed before expiration'
  }
];

const getScoreColor = (score: number) => {
  if (score >= 95) return 'text-green-400';
  if (score >= 85) return 'text-yellow-400';
  return 'text-red-400';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'compliant':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'flagged':
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    case 'violation':
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ComplianceAudit() {
  const overallScore = Math.round(
    complianceMetrics.reduce((sum, metric) => sum + metric.score, 0) / complianceMetrics.length
  );

  return (
    <div className="space-y-8">
      {/* Compliance Overview */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-orange-400" />
            Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                    className="text-green-400"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-400">{overallScore}%</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Overall Compliance Score</h3>
              <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
            </div>
            
            <div className="space-y-4">
              {complianceMetrics.map((metric) => (
                <div key={metric.category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{metric.category}</span>
                    <span className={`text-sm font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}%
                    </span>
                  </div>
                  <Progress value={metric.score} className="h-2 mb-1" />
                  <p className="text-xs text-gray-400">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">User Access Control</h3>
            <p className="text-sm text-gray-400">
              Track and manage who accesses your licensed datasets
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">Global Compliance</h3>
            <p className="text-sm text-gray-400">
              Adherence to international data protection regulations
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Data Security</h3>
            <p className="text-sm text-gray-400">
              End-to-end encryption and secure data handling
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Trail</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-white">{log.action}</p>
                      <Badge variant="outline" className="text-xs">
                        {log.dataset}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{log.details}</p>
                    <p className="text-xs text-gray-500">
                      {log.user} • {formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>
                
                <Badge 
                  className={
                    log.status === 'compliant' 
                      ? 'bg-green-500/20 text-green-400'
                      : log.status === 'flagged'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }
                >
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Reports */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Monthly Compliance Report</p>
                <p className="text-sm text-gray-400">Detailed usage and compliance metrics</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Ethical AI Assessment</p>
                <p className="text-sm text-gray-400">AI ethics and bias evaluation</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Data Lineage Report</p>
                <p className="text-sm text-gray-400">Track data sources and transformations</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">License Compliance Audit</p>
                <p className="text-sm text-gray-400">Verify adherence to licensing terms</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}