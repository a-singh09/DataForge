"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  Image,
  Music,
  Video,
  Code,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface FileUploadProps {
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FileWithPreview {
  // File properties
  name: string;
  size: number;
  type: string;
  lastModified: number;
  webkitRelativePath: string;

  // File methods
  arrayBuffer: () => Promise<ArrayBuffer>;
  slice: (start?: number, end?: number, contentType?: string) => Blob;
  stream: () => ReadableStream<Uint8Array>;
  text: () => Promise<string>;

  // Custom properties
  preview?: string | null;
  uploadProgress?: number;
  uploadError?: string;
  fileId?: string;
}

const getFileIcon = (type: string | undefined) => {
  if (!type) return FileText;
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return Video;
  if (type.startsWith("audio/")) return Music;
  if (type.includes("text") || type.includes("json")) return FileText;
  if (type.includes("javascript") || type.includes("python")) return Code;
  return FileText;
};

export default function FileUpload({
  onDataChange,
  onNext,
  onBack,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // File size validation (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is 100MB.`;
    }

    // File type validation
    const allowedTypes = [
      "image/",
      "video/",
      "audio/",
      "text/",
      "application/pdf",
      "application/json",
      "application/zip",
      "application/javascript",
      "application/python",
    ];

    const isAllowed =
      file.type && allowedTypes.some((type) => file.type.startsWith(type));
    if (!isAllowed) {
      return `File type "${file.type || "unknown"}" is not supported.`;
    }

    return null;
  };

  const generatePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setUploadError(null);
      setIsUploading(true);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles
          .map(
            ({ file, errors }) =>
              `${file.name}: ${errors.map((e: any) => e.message).join(", ")}`,
          )
          .join("\n");
        setUploadError(`Some files were rejected:\n${errors}`);
      }

      // Process accepted files
      const processedFiles: FileWithPreview[] = [];

      for (const file of acceptedFiles) {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          setUploadError((prev) =>
            prev ? `${prev}\n${validationError}` : validationError,
          );
          continue;
        }

        // Generate preview
        const preview = await generatePreview(file);

        // Create a wrapper that preserves the File object and adds our properties
        const fileWithPreview: FileWithPreview = {
          // Preserve all File properties
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          webkitRelativePath: file.webkitRelativePath,
          // Add File methods
          arrayBuffer: file.arrayBuffer.bind(file),
          slice: file.slice.bind(file),
          stream: file.stream.bind(file),
          text: file.text.bind(file),
          // Add our custom properties
          preview,
          uploadProgress: 100, // Mark as ready since we're just storing locally
          fileId: `${file.name}-${file.size}-${file.lastModified}`,
        };

        console.log("File processed for local storage:", {
          name: fileWithPreview.name,
          type: fileWithPreview.type,
          size: fileWithPreview.size,
        });

        processedFiles.push(fileWithPreview);
      }

      // Add files to state - they're now ready for the next steps
      setUploadedFiles((prev) => [...prev, ...processedFiles]);
      setIsUploading(false);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
      "audio/*": [".mp3", ".wav", ".aac", ".flac", ".ogg"],
      "text/*": [".txt", ".md", ".csv", ".json"],
      "application/pdf": [".pdf"],
      "application/zip": [".zip", ".rar", ".7z"],
      "application/javascript": [".js", ".jsx"],
      "application/typescript": [".ts", ".tsx"],
      "text/x-python": [".py"],
    },
  });

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => {
      const filtered = prev.filter((file) => file.name !== fileName);
      // Revoke object URL for image previews to prevent memory leaks
      const fileToRemove = prev.find((file) => file.name === fileName);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return filtered;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleNext = () => {
    // Pass all files since they're stored locally and ready
    onDataChange({
      files: uploadedFiles,
      uploadType: "file",
    });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Upload Your Files</h2>
        <p className="text-gray-400 text-lg">
          Drag and drop your files here or click to browse
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`glass rounded-2xl p-12 mb-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragActive
            ? "border-orange-500 bg-orange-500/10"
            : "border-gray-700 hover:border-gray-600"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          {isDragActive ? (
            <p className="text-xl text-orange-400 font-medium">
              Drop your files here...
            </p>
          ) : (
            <>
              <p className="text-xl font-medium mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-gray-400">
                Supports images, videos, audio, documents, and code files
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <Alert className="mb-6 border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {uploadedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              const progress = file.uploadProgress || 0;
              const isUploaded = progress === 100;

              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg"
                >
                  {/* File Preview/Icon */}
                  <div className="h-16 w-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate mb-1">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span className="capitalize">
                            {file.type ? file.type.split("/")[0] : "Unknown"}
                          </span>
                          <span>•</span>
                          <span className="text-green-400">Ready</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Check className="h-4 w-4 text-green-400" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.name)}
                          className="h-6 w-6 p-0 hover:bg-red-500/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {file.uploadError && (
                      <p className="text-xs text-red-400 mt-2">
                        Error: {file.uploadError}
                      </p>
                    )}
                  </div>
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
          disabled={uploadedFiles.length === 0 || isUploading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
        >
          {isUploading ? "Processing Files..." : "Continue to Metadata"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
