"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  Code2,
  Hash,
  Lock,
  Eye,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IpNFTMetadata } from "@/types/marketplace";

// Image Preview Component
export function ImagePreview({ dataset }: { dataset: IpNFTMetadata }) {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
        {dataset.previewUrl ? (
          <>
            <Image
              src={dataset.previewUrl}
              alt={dataset.title}
              fill
              className="object-cover"
            />
            {/* Watermark overlay for preview */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-black/60 px-4 py-2 rounded-lg flex items-center gap-2">
                <Eye className="h-4 w-4 text-white" />
                <span className="text-white text-sm">Preview Only</span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>No preview available</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Format</span>
            <span className="text-white">JPEG/PNG</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Resolution</span>
            <span className="text-white">High Quality</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Images</span>
            <span className="text-white">{dataset.samples || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">License</span>
            <span className="text-white">AI Training</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">
            Full Access Includes
          </span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• High-resolution original images</li>
          <li>• Metadata and annotations</li>
          <li>• Commercial AI training rights</li>
          <li>• Batch download capability</li>
        </ul>
      </div>
    </div>
  );
}

// Video Preview Component
export function VideoPreview({
  dataset,
  isPlaying,
  setIsPlaying,
}: {
  dataset: IpNFTMetadata;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}) {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
        {dataset.previewUrl ? (
          <>
            <video
              className="w-full h-full object-cover"
              muted={isMuted}
              loop
              poster={dataset.previewUrl}
            >
              <source src={dataset.previewUrl} type="video/mp4" />
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-black/60 hover:bg-black/80"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="bg-black/60 hover:bg-black/80"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="bg-black/60 px-3 py-1 rounded text-white text-sm">
                  Preview Only
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Play className="h-12 w-12 mx-auto mb-2" />
              <p>No preview available</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Format</span>
            <span className="text-white">MP4/MOV</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quality</span>
            <span className="text-white">HD/4K</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Videos</span>
            <span className="text-white">{dataset.samples || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Duration</span>
            <span className="text-white">Various</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">
            Full Access Includes
          </span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Full-resolution video files</li>
          <li>• Audio tracks and subtitles</li>
          <li>• Frame-by-frame annotations</li>
          <li>• Bulk download with metadata</li>
        </ul>
      </div>
    </div>
  );
}

// Audio Preview Component
export function AudioPreview({
  dataset,
  isPlaying,
  setIsPlaying,
}: {
  dataset: IpNFTMetadata;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Volume2 className="h-16 w-16 text-white" />
          </div>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-white font-medium mb-2">Audio Preview</h3>
          <p className="text-gray-400 text-sm">30-second sample available</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isPlaying ? "Pause" : "Play"} Preview
          </Button>
        </div>

        {/* Waveform visualization placeholder */}
        <div className="mt-4 h-16 bg-gray-700 rounded flex items-center justify-center">
          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-purple-400 rounded-t"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Format</span>
            <span className="text-white">MP3/WAV</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quality</span>
            <span className="text-white">High Fidelity</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Tracks</span>
            <span className="text-white">{dataset.samples || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Genre</span>
            <span className="text-white">Various</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">
            Full Access Includes
          </span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Complete audio files in multiple formats</li>
          <li>• Metadata and genre classifications</li>
          <li>• Lyrics and transcriptions (if available)</li>
          <li>• Commercial usage rights for AI training</li>
        </ul>
      </div>
    </div>
  );
}

// Text Preview Component
export function TextPreview({ dataset }: { dataset: IpNFTMetadata }) {
  const sampleText = `This is a sample preview of the text dataset. The full dataset contains comprehensive text data suitable for AI training purposes. 

Key features include:
- High-quality curated content
- Diverse topics and writing styles
- Proper formatting and structure
- Metadata annotations

[Content continues with full dataset access...]`;

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-green-400" />
          <span className="text-white font-medium">Text Sample</span>
          <Badge variant="outline" className="text-xs">
            Preview
          </Badge>
        </div>

        <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-300 max-h-48 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{sampleText}</pre>
        </div>

        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <Lock className="h-4 w-4" />
            <span>Full content available with license</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Format</span>
            <span className="text-white">TXT/JSON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Language</span>
            <span className="text-white">English</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Documents</span>
            <span className="text-white">{dataset.samples || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Words</span>
            <span className="text-white">~1M+</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">
            Full Access Includes
          </span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Complete text corpus with full content</li>
          <li>• Structured data with metadata</li>
          <li>• Topic classifications and tags</li>
          <li>• Export in multiple formats</li>
        </ul>
      </div>
    </div>
  );
}

// Code Preview Component
export function CodePreview({ dataset }: { dataset: IpNFTMetadata }) {
  const sampleCode = `// Sample code from the dataset
function analyzeData(input) {
  const processed = input
    .filter(item => item.isValid)
    .map(item => ({
      ...item,
      score: calculateScore(item)
    }));
  
  return processed;
}

// More code available in full dataset...
// [Additional functions and modules]`;

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="h-5 w-5 text-yellow-400" />
          <span className="text-white font-medium">Code Sample</span>
          <Badge variant="outline" className="text-xs">
            Preview
          </Badge>
        </div>

        <div className="bg-gray-900 rounded p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-gray-300">
            <code>{sampleCode}</code>
          </pre>
        </div>

        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <Lock className="h-4 w-4" />
            <span>Complete codebase available with license</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Languages</span>
            <span className="text-white">JS/TS/Python</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Files</span>
            <span className="text-white">{dataset.samples || "N/A"}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Lines</span>
            <span className="text-white">~100K+</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">License</span>
            <span className="text-white">Open Source</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">
            Full Access Includes
          </span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Complete source code repositories</li>
          <li>• Documentation and comments</li>
          <li>• Test files and examples</li>
          <li>• Dependency information</li>
        </ul>
      </div>
    </div>
  );
}

// Social Preview Component
export function SocialPreview({ dataset }: { dataset: IpNFTMetadata }) {
  const samplePosts = [
    {
      platform: "Twitter",
      content:
        "Just discovered this amazing new AI tool that's changing how we work! #AI #Innovation",
      engagement: "1.2K likes, 234 retweets",
    },
    {
      platform: "TikTok",
      content: "Quick tutorial on using AI for creative projects 🎨✨",
      engagement: "45K views, 2.1K likes",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="h-5 w-5 text-pink-400" />
          <span className="text-white font-medium">Social Content Sample</span>
          <Badge variant="outline" className="text-xs">
            Preview
          </Badge>
        </div>

        <div className="space-y-3">
          {samplePosts.map((post, index) => (
            <div key={index} className="bg-gray-900 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="text-xs bg-pink-500/20 text-pink-400">
                  {post.platform}
                </Badge>
              </div>
              <p className="text-gray-300 text-sm mb-2">{post.content}</p>
              <p className="text-gray-500 text-xs">{post.engagement}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <Lock className="h-4 w-4" />
            <span>Complete social dataset available with license</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Platforms</span>
            <span className="text-white">Multi-platform</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Posts</span>
            <span className="text-white">{dataset.samples || "N/A"}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Timeframe</span>
            <span className="text-white">Recent</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Engagement</span>
            <span className="text-white">High</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">
            Full Access Includes
          </span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Complete social media posts and content</li>
          <li>• Engagement metrics and analytics</li>
          <li>• Hashtags and metadata</li>
          <li>• Cross-platform content correlation</li>
        </ul>
      </div>
    </div>
  );
}

// Generic Preview Component
export function GenericPreview({ dataset }: { dataset: IpNFTMetadata }) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-white font-medium mb-2">Dataset Preview</h3>
        <p className="text-gray-400 text-sm mb-4">
          This dataset contains {dataset.samples || "multiple"} items ready for
          AI training.
        </p>
        <Badge variant="outline" className="text-xs">
          {dataset.contentType} content
        </Badge>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">
            Full Access Includes
          </span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Complete dataset with all content</li>
          <li>• Structured metadata and annotations</li>
          <li>• Commercial AI training license</li>
          <li>• Technical documentation</li>
        </ul>
      </div>
    </div>
  );
}
