"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  BarChart3,
  Code,
  Book,
  RefreshCw
} from 'lucide-react';

const apiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'cv_prod_1234567890abcdef1234567890abcdef',
    environment: 'production',
    created: '2024-01-15',
    lastUsed: '2024-01-20',
    requests: 1200000,
    status: 'active'
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'cv_dev_abcdef1234567890abcdef1234567890',
    environment: 'development',
    created: '2024-01-10',
    lastUsed: '2024-01-19',
    requests: 45000,
    status: 'active'
  },
  {
    id: '3',
    name: 'Testing API Key',
    key: 'cv_test_567890abcdef1234567890abcdef1234',
    environment: 'testing',
    created: '2024-01-08',
    lastUsed: '2024-01-18',
    requests: 12000,
    status: 'inactive'
  }
];

const codeExamples = {
  javascript: `// Initialize CreatorVault API client
const CreatorVault = require('@creatorvault/sdk');

const client = new CreatorVault({
  apiKey: 'your_api_key_here',
  environment: 'production'
});

// Get dataset information
const dataset = await client.datasets.get('dataset_id');

// Download licensed content
const content = await client.datasets.download('dataset_id', {
  format: 'json',
  compression: 'gzip'
});`,
  python: `# Install: pip install creatorvault-sdk
from creatorvault import CreatorVault

# Initialize client
client = CreatorVault(
    api_key='your_api_key_here',
    environment='production'
)

# Get dataset information
dataset = client.datasets.get('dataset_id')

# Download licensed content
content = client.datasets.download(
    'dataset_id',
    format='json',
    compression='gzip'
)`,
  curl: `# Get dataset information
curl -X GET "https://api.creatorvault.ai/v1/datasets/{dataset_id}" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"

# Download licensed content
curl -X POST "https://api.creatorvault.ai/v1/datasets/{dataset_id}/download" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"format": "json", "compression": "gzip"}'`
};

export default function ApiIntegration() {
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [newKeyName, setNewKeyName] = useState('');

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const maskKey = (key: string) => {
    return key.slice(0, 12) + '...' + key.slice(-8);
  };

  return (
    <div className="space-y-8">
      {/* API Keys Management */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2 text-orange-400" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys for accessing CreatorVault services
              </CardDescription>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{apiKey.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span>Environment: {apiKey.environment}</span>
                      <span>Created: {apiKey.created}</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                      {apiKey.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <code className="text-sm bg-gray-900 px-3 py-2 rounded font-mono">
                    {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  <div className="text-sm text-gray-400">
                    {apiKey.requests.toLocaleString()} requests
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-orange-400" />
            API Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <p className="text-2xl font-bold text-green-400">1.2M</p>
              <p className="text-sm text-gray-400">Total Requests</p>
              <p className="text-xs text-green-400 mt-1">+23% this month</p>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">99.9%</p>
              <p className="text-sm text-gray-400">Uptime</p>
              <p className="text-xs text-blue-400 mt-1">Last 30 days</p>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">145ms</p>
              <p className="text-sm text-gray-400">Avg Response</p>
              <p className="text-xs text-purple-400 mt-1">-12ms this week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Book className="h-5 w-5 mr-2 text-orange-400" />
              Code Examples
            </CardTitle>
            <div className="flex items-center space-x-2">
              {Object.keys(codeExamples).map((lang) => (
                <Button
                  key={lang}
                  variant={selectedLanguage === lang ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'cURL'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
              <code className="text-gray-300">
                {codeExamples[selectedLanguage as keyof typeof codeExamples]}
              </code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples])}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card className="glass border-gray-800">
        <CardHeader>
          <CardTitle>Documentation & Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">API Reference</p>
                <p className="text-sm text-gray-400">Complete API documentation</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">SDK Documentation</p>
                <p className="text-sm text-gray-400">Language-specific guides</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Rate Limits</p>
                <p className="text-sm text-gray-400">Usage limits and best practices</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Support</p>
                <p className="text-sm text-gray-400">Get help from our team</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}