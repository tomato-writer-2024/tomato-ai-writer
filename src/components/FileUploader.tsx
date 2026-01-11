"use client";

import React, { useRef, useState } from 'react';
import { Upload, FileText, File, X, Loader2, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onContentLoaded: (content: string, filename: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  disabled?: boolean;
}

export default function FileUploader({
  onContentLoaded,
  acceptedTypes = ['.txt', '.pdf', '.doc', '.docx'],
  maxSize = 10,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension) && !acceptedTypes.includes(file.type)) {
      setError(`不支持的文件类型，仅支持: ${acceptedTypes.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    setError('');
    setIsLoading(true);

    if (!validateFile(file)) {
      setIsLoading(false);
      return;
    }

    try {
      const content = await parseFile(file);
      setUploadedFile({ name: file.name, size: file.size });
      onContentLoaded(content, file.name);
      setError('');
    } catch (err) {
      setError('文件解析失败，请重试');
      console.error('File parse error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseFile = async (file: File): Promise<string> => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    // TXT files - 直接读取
    if (extension === '.txt') {
      return await file.text();
    }

    // PDF files - 使用后端API解析
    if (extension === '.pdf') {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse PDF');
      }

      const data = await response.json();
      return data.content;
    }

    // Word documents - 使用后端API解析
    if (extension === '.doc' || extension === '.docx') {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse Word document');
      }

      const data = await response.json();
      return data.content;
    }

    throw new Error('Unsupported file format');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isLoading ? 'pointer-events-none' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={acceptedTypes.join(',')}
            className="hidden"
            disabled={disabled}
          />

          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">正在解析文件...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <div className="text-sm">
                <p className="text-gray-700">
                  <span className="text-blue-600 font-medium">点击上传</span> 或拖拽文件到此处
                </p>
                <p className="text-gray-500 mt-1">
                  支持 {acceptedTypes.join(', ')} · 最大 {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {uploadedFile.name.endsWith('.pdf') ? (
              <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : uploadedFile.name.match(/\.(doc|docx)$/) ? (
              <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(uploadedFile.size)}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleRemoveFile}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="移除文件"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
