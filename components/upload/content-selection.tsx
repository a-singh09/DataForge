"use client";

import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Twitter, 
  Music, 
  Video, 
  FileText,
  Image,
  ArrowRight
} from 'lucide-react';

interface ContentSelectionProps {
  selectedType: 'file' | 'social' | null;
  onTypeSelect: (type: 'file' | 'social') => void;
  onNext: () => void;
}

const uploadOptions = [
  {
    type: 'file' as const,
    title: 'Upload Files',
    description: 'Upload images, videos, audio, documents, or code files from your device',
    icon: Upload,
    features: [
      'Support for all major file formats',
      'Batch upload multiple files',
      'Automatic metadata extraction',
      'Preview generation'
    ]
  },
  {
    type: 'social' as const,
    title: 'Mint Social Content',
    description: 'Connect your social accounts to mint content directly from your profiles',
    icon: Twitter,
    features: [
      'Twitter posts and threads',
      'Spotify tracks and playlists',
      'TikTok videos',
      'Telegram messages'
    ]
  }
];

export default function ContentSelection({ 
  selectedType, 
  onTypeSelect, 
  onNext 
}: ContentSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Content Source</h2>
        <p className="text-gray-400 text-lg">
          Select how you want to add content to the marketplace
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {uploadOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.type;
          
          return (
            <div
              key={option.type}
              className={`glass rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected 
                  ? 'border-2 border-orange-500 bg-orange-500/10' 
                  : 'hover:bg-white/10'
              }`}
              onClick={() => onTypeSelect(option.type)}
            >
              <div className="text-center mb-6">
                <div className={`h-16 w-16 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                  isSelected 
                    ? 'bg-orange-500' 
                    : 'bg-gradient-to-br from-gray-700 to-gray-800'
                }`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                <p className="text-gray-400">{option.description}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-300 mb-3">Features:</h4>
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-orange-400 rounded-full flex-shrink-0" />
                    <span className="text-sm text-gray-400">{feature}</span>
                  </div>
                ))}
              </div>

              {isSelected && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-center text-orange-400">
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedType && (
        <div className="text-center">
          <Button
            size="lg"
            onClick={onNext}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
          >
            Continue with {selectedType === 'file' ? 'File Upload' : 'Social Minting'}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}