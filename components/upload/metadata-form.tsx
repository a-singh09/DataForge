"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Hash, X, Plus } from "lucide-react";

interface MetadataFormProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const categories = [
  "Images & Photography",
  "Text & Documents",
  "Audio & Music",
  "Video & Film",
  "Code & Development",
  "Social Media Content",
  "Educational Content",
  "Creative Writing",
  "Data & Analytics",
  "Other",
];

export default function MetadataForm({
  data,
  onDataChange,
  onNext,
  onBack,
}: MetadataFormProps) {
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    ...data.metadata,
  });
  const [newTag, setNewTag] = useState("");

  const handleInputChange = (field: string, value: string) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onDataChange({ metadata: updated });
  };

  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      const updated = { ...metadata, tags: [...metadata.tags, newTag.trim()] };
      setMetadata(updated);
      onDataChange({ metadata: updated });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updated = {
      ...metadata,
      tags: metadata.tags.filter((tag: string) => tag !== tagToRemove),
    };
    setMetadata(updated);
    onDataChange({ metadata: updated });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const isValid =
    metadata.title.trim() &&
    metadata.description.trim() &&
    metadata.category &&
    metadata.tags.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Add Content Metadata</h2>
        <p className="text-gray-400 text-lg">
          Provide details to help AI companies discover your content
        </p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-base font-medium mb-3 block">
              Content Title *
            </Label>
            <Input
              id="title"
              value={metadata.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter a descriptive title for your content"
              className="h-12 text-lg"
            />
            <p className="text-sm text-gray-400 mt-2">
              Choose a clear, searchable title that describes your content
            </p>
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="description"
              className="text-base font-medium mb-3 block"
            >
              Description *
            </Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your content, its quality, and potential use cases for AI training"
              className="min-h-32 text-base"
            />
            <p className="text-sm text-gray-400 mt-2">
              Include details about format, quality, themes, and AI training
              applications
            </p>
          </div>

          {/* Category */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Category *
            </Label>
            <Select
              value={metadata.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Tags * (at least 1 required)
            </Label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag"
                    className="pl-10 h-12"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  variant="outline"
                  className="h-12 px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1 text-sm"
                    >
                      #{tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="h-4 w-4 p-0 hover:bg-red-500/20 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Add relevant tags to help AI companies find your content (e.g.,
              nature, urban, portraits)
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
        >
          Continue to Licensing
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
