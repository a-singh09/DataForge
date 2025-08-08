"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Lock,
  Shuffle,
  SkipForward,
  SkipBack,
  Grid3X3,
  List,
  FileText,
  Code2,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IpNFTMetadata } from "@/types/marketplace";

interface SampleContentDisplayProps {
  dataset: IpNFTMetadata;
}

export default function SampleContentDisplay({
  dataset,
}: SampleContentDisplayProps) {
  const [currentSample, setCurrentSample] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Mock sample data - in real implementation, this would come from the dataset
  const getSampleData = () => {
    const sampleCount = Math.min(dataset.samples || 5, 10); // Show max 10 samples

    switch (dataset.contentType) {
      case "image":
        return Array.from({ length: sampleCount }, (_, i) => ({
          id: i,
          type: "image",
          url: `/api/placeholder/300/200?text=Sample${i + 1}`,
          title: `Image Sample ${i + 1}`,
          metadata: {
            resolution: "1920x1080",
            format: "JPEG",
            size: "2.4 MB",
          },
        }));

      case "video":
        return Array.from({ length: sampleCount }, (_, i) => ({
          id: i,
          type: "video",
          url: `/api/placeholder/400/300?text=Video${i + 1}`,
          title: `Video Sample ${i + 1}`,
          metadata: {
            duration: "0:30",
            resolution: "1920x1080",
            format: "MP4",
          },
        }));

      case "audio":
        return Array.from({ length: sampleCount }, (_, i) => ({
          id: i,
          type: "audio",
          title: `Audio Track ${i + 1}`,
          metadata: {
            duration: "3:45",
            format: "MP3",
            bitrate: "320kbps",
          },
        }));

      case "text":
        return Array.from({ length: sampleCount }, (_, i) => ({
          id: i,
          type: "text",
          title: `Text Document ${i + 1}`,
          content: `This is a sample text document ${i + 1}. It contains high-quality content suitable for AI training. The full dataset includes comprehensive text data with proper formatting and structure...`,
          metadata: {
            words: Math.floor(Math.random() * 1000) + 500,
            language: "English",
            category: "General",
          },
        }));

      case "code":
        return Array.from({ length: sampleCount }, (_, i) => ({
          id: i,
          type: "code",
          title: `Code File ${i + 1}.js`,
          content: `// Sample code file ${i + 1}\nfunction processData(input) {\n  const result = input\n    .filter(item => item.isValid)\n    .map(item => ({\n      ...item,\n      processed: true\n    }));\n  \n  return result;\n}\n\n// More code available in full dataset...`,
          metadata: {
            language: "JavaScript",
            lines: Math.floor(Math.random() * 200) + 50,
            functions: Math.floor(Math.random() * 10) + 3,
          },
        }));

      case "social":
        return Array.from({ length: sampleCount }, (_, i) => ({
          id: i,
          type: "social",
          title: `Social Post ${i + 1}`,
          content: `This is a sample social media post ${i + 1}. It demonstrates the type of content available in this dataset. #AI #MachineLearning #DataScience`,
          metadata: {
            platform: ["Twitter", "TikTok", "Instagram"][i % 3],
            engagement: Math.floor(Math.random() * 10000) + 100,
            hashtags: Math.floor(Math.random() * 5) + 1,
          },
        }));

      default:
        return Array.from({ length: sampleCount }, (_, i) => ({
          id: i,
          type: "generic",
          title: `Sample ${i + 1}`,
          metadata: {
            size: `${Math.floor(Math.random() * 10) + 1} MB`,
            format: "Various",
          },
        }));
    }
  };

  const samples = getSampleData();

  const renderSampleContent = (sample: any) => {
    switch (sample.type) {
      case "image":
        return (
          <div className="relative group">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={sample.url}
                alt={sample.title}
                fill
                className="object-cover"
              />
              {/* Preview watermark */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-black/60 px-3 py-1 rounded text-white text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Only
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-white text-sm font-medium">{sample.title}</h4>
              <div className="text-xs text-gray-400 mt-1">
                {sample.metadata.resolution} • {sample.metadata.format}
              </div>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="relative group">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/20 to-purple-900/20">
                <div className="text-center">
                  <Play className="h-12 w-12 text-white/60 mx-auto mb-2" />
                  <div className="text-white text-sm">
                    {sample.metadata.duration}
                  </div>
                </div>
              </div>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/60 hover:bg-black/80"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-white text-sm font-medium">{sample.title}</h4>
              <div className="text-xs text-gray-400 mt-1">
                {sample.metadata.duration} • {sample.metadata.format}
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Volume2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white text-sm font-medium">
                  {sample.title}
                </h4>
                <div className="text-xs text-gray-400">
                  {sample.metadata.duration} • {sample.metadata.format}
                </div>
              </div>
            </div>

            {/* Waveform visualization */}
            <div className="h-8 bg-gray-700 rounded flex items-center justify-center mb-3">
              <div className="flex items-end gap-1 h-6">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple-400 rounded-t"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-purple-400 hover:text-purple-300"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="text-xs text-gray-400">30s preview</div>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-green-400" />
              <h4 className="text-white text-sm font-medium">{sample.title}</h4>
            </div>
            <div className="bg-gray-900 rounded p-3 mb-3">
              <p className="text-gray-300 text-sm line-clamp-4">
                {sample.content}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {sample.metadata.words} words • {sample.metadata.language}
            </div>
          </div>
        );

      case "code":
        return (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-5 w-5 text-yellow-400" />
              <h4 className="text-white text-sm font-medium">{sample.title}</h4>
            </div>
            <div className="bg-gray-900 rounded p-3 mb-3 overflow-x-auto">
              <pre className="text-gray-300 text-xs">
                <code>{sample.content}</code>
              </pre>
            </div>
            <div className="text-xs text-gray-400">
              {sample.metadata.lines} lines • {sample.metadata.language}
            </div>
          </div>
        );

      case "social":
        return (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-5 w-5 text-pink-400" />
              <h4 className="text-white text-sm font-medium">{sample.title}</h4>
              <Badge className="text-xs bg-pink-500/20 text-pink-400">
                {sample.metadata.platform}
              </Badge>
            </div>
            <div className="bg-gray-900 rounded p-3 mb-3">
              <p className="text-gray-300 text-sm">{sample.content}</p>
            </div>
            <div className="text-xs text-gray-400">
              {sample.metadata.engagement.toLocaleString()} engagement •{" "}
              {sample.metadata.hashtags} hashtags
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h4 className="text-white text-sm font-medium">{sample.title}</h4>
            <div className="text-xs text-gray-400 mt-1">
              {sample.metadata.size} • {sample.metadata.format}
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Sample Content ({samples.length} of {dataset.samples || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="text-gray-400 hover:text-white"
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3X3 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentSample(Math.floor(Math.random() * samples.length))
              }
              className="text-gray-400 hover:text-white"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="samples" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger
              value="samples"
              className="data-[state=active]:bg-gray-700"
            >
              Sample Content
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gray-700"
            >
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="samples" className="mt-4">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samples.slice(0, 6).map((sample) => (
                  <div key={sample.id}>{renderSampleContent(sample)}</div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {samples.slice(0, 4).map((sample) => (
                  <div key={sample.id}>{renderSampleContent(sample)}</div>
                ))}
              </div>
            )}

            {samples.length > (viewMode === "grid" ? 6 : 4) && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg">
                  <Lock className="h-4 w-4" />
                  <span>
                    {samples.length - (viewMode === "grid" ? 6 : 4)} more
                    samples available with license
                  </span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-medium">Content Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Samples</span>
                    <span className="text-white">
                      {dataset.samples?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Content Type</span>
                    <span className="text-white capitalize">
                      {dataset.contentType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Preview Available</span>
                    <span className="text-white">{samples.length} samples</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Access Information</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-medium text-orange-400">
                      License Required
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Full dataset access requires a valid license. Preview shows
                    limited samples only.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
