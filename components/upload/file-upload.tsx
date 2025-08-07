"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  ArrowRight
} from 'lucide-react';

interface FileUploadProps {
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('text') || type.includes('json')) return FileText;
  if (type.includes('javascript') || type.includes('python')) return Code;
  return FileText;
};

export default function FileUpload({ onDataChange, onNext, onBack }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    
    acceptedFiles.forEach((file) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        
        if (progress === 100) {
          setUploadedFiles(prev => [...prev, file]);
        }
      }, 200);
    });

    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.aac', '.flac'],
      'text/*': ['.txt', '.md', '.csv', '.json'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
    }
  });

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleNext = () => {
    onDataChange({ files: uploadedFiles });
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
            ? 'border-orange-500 bg-orange-500/10' 
            : 'border-gray-700 hover:border-gray-600'
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

      {/* Uploaded Files */}
      {(uploadedFiles.length > 0 || Object.keys(uploadProgress).length > 0) && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {[...uploadedFiles, ...Object.keys(uploadProgress)
              .filter(name => !uploadedFiles.some(f => f.name === name))
              .map(name => ({ name, size: 0, type: 'unknown' } as File))
            ].map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              const progress = uploadProgress[file.name] || 100;
              const isUploaded = uploadedFiles.some(f => f.name === file.name);
              
              return (
                <div key={`${file.name}-${index}`} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        {file.size > 0 && (
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                        )}
                        {isUploaded ? (
                          <>
                            <Check className="h-4 w-4 text-green-400" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.name)}
                              className="h-6 w-6 p-0 hover:bg-red-500/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <div className="h-4 w-4 animate-spin border-2 border-orange-500 border-t-transparent rounded-full" />
                        )}
                      </div>
                    </div>
                    
                    {!isUploaded && (
                      <Progress value={progress} className="h-2" />
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
          disabled={uploadedFiles.length === 0}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
        >
          Continue to Metadata
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}