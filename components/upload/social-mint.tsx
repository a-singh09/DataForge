"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Twitter, 
  Music, 
  MessageSquare,
  Send,
  Check,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface SocialMintProps {
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const socialPlatforms = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'from-blue-500 to-blue-600',
    description: 'Mint tweets, threads, and media'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: Music,
    color: 'from-green-500 to-green-600',
    description: 'Mint tracks and playlists'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: MessageSquare,
    color: 'from-pink-500 to-pink-600',
    description: 'Mint videos and captions'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: Send,
    color: 'from-blue-400 to-blue-500',
    description: 'Mint messages and media'
  }
];

export default function SocialMint({ onDataChange, onNext, onBack }: SocialMintProps) {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    setIsConnecting(platformId);
    
    // Simulate OAuth connection
    setTimeout(() => {
      setConnectedPlatforms(prev => [...prev, platformId]);
      setIsConnecting(null);
    }, 2000);
  };

  const handleDisconnect = (platformId: string) => {
    setConnectedPlatforms(prev => prev.filter(id => id !== platformId));
    setSelectedContent(prev => prev.filter(item => item.platform !== platformId));
  };

  const handleNext = () => {
    onDataChange({ socialContent: selectedContent, connectedPlatforms });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Connect Your Social Accounts</h2>
        <p className="text-gray-400 text-lg">
          Link your social platforms to mint content directly from your profiles
        </p>
      </div>

      {/* Platform Connection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;
          const isConnected = connectedPlatforms.includes(platform.id);
          const isConnecting = isConnecting === platform.id;
          
          return (
            <div key={platform.id} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 bg-gradient-to-br ${platform.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{platform.name}</h3>
                    <p className="text-gray-400 text-sm">{platform.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isConnected && (
                    <Check className="h-5 w-5 text-green-400" />
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                {!isConnected ? (
                  <Button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isConnecting}
                    className="flex-1"
                    variant={isConnecting ? "outline" : "default"}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleDisconnect(platform.id)}
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                      Browse Content
                    </Button>
                  </>
                )}
              </div>

              {isConnected && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Status: Connected</span>
                    <span className="text-green-400">✓ OAuth Verified</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connected Platforms Summary */}
      {connectedPlatforms.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Ready to Mint From:</h3>
          <div className="flex flex-wrap gap-3">
            {connectedPlatforms.map((platformId) => {
              const platform = socialPlatforms.find(p => p.id === platformId);
              if (!platform) return null;
              
              const Icon = platform.icon;
              return (
                <div key={platformId} className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{platform.name}</span>
                  <Check className="h-4 w-4 text-green-400" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={connectedPlatforms.length === 0}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
        >
          Continue to Metadata
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}