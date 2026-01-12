'use client';

import React, { useState } from 'react';
import { Upload, Download, FileText, File, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';

export type ImportExportMode = 'both' | 'import' | 'export';
export type ExportFormat = 'txt' | 'docx' | 'pdf';
export type ImportExportVariant = 'full' | 'compact' | 'minimal';

interface ImportExportProps {
  /** 导入导出模式 */
  mode?: ImportExportMode;
  /** 内容（用于导出） */
  content?: string;
  /** 文件名（用于导出） */
  filename?: string;
  /** 文件加载回调（用于导入） */
  onContentLoaded?: (content: string, filename: string) => void;
  /** 导出成功回调 */
  onExportSuccess?: (format: ExportFormat) => void;
  /** 导出失败回调 */
  onExportError?: (error: string) => void;
  /** 导入成功回调 */
  onImportSuccess?: (filename: string) => void;
  /** 导入失败回调 */
  onImportError?: (error: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** UI变体 */
  variant?: ImportExportVariant;
  /** 自定义类名 */
  className?: string;
  /** 接受的文件类型 */
  acceptedTypes?: string[];
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 默认是否展开 */
  defaultExpanded?: boolean;
}

/**
 * ImportExport组件
 * 统一的导入导出组件，支持Word、PDF、TXT格式
 * 与VI风格保持一致（番茄红#FF4757）
 */
export default function ImportExport({
  mode = 'both',
  content = '',
  filename = 'export',
  onContentLoaded,
  onExportSuccess,
  onExportError,
  onImportSuccess,
  onImportError,
  disabled = false,
  variant = 'full',
  className = '',
  acceptedTypes = ['.txt', '.pdf', '.doc', '.docx'],
  maxSize = 10,
  defaultExpanded = false,
}: ImportExportProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null);
  const [importedFile, setImportedFile] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `文件大小不能超过 ${maxSize}MB`;
      setError(errorMsg);
      onImportError?.(errorMsg);
      return false;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension) && !acceptedTypes.includes(file.type)) {
      const errorMsg = `不支持的文件类型，仅支持: ${acceptedTypes.join(', ')}`;
      setError(errorMsg);
      onImportError?.(errorMsg);
      return false;
    }

    return true;
  };

  const parseFile = async (file: File): Promise<string> => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (extension === '.txt') {
      return await file.text();
    }

    if (extension === '.pdf' || extension === '.doc' || extension === '.docx') {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse file');
      }

      const data = await response.json();
      return data.content;
    }

    throw new Error('Unsupported file format');
  };

  const handleFileSelect = async (file: File) => {
    setError('');
    setIsImporting(true);

    if (!validateFile(file)) {
      setIsImporting(false);
      return;
    }

    try {
      const fileContent = await parseFile(file);
      setImportedFile({ name: file.name, size: file.size });
      onContentLoaded?.(fileContent, file.name);
      onImportSuccess?.(file.name);
      setError('');
    } catch (err) {
      const errorMsg = '文件解析失败，请重试';
      setError(errorMsg);
      onImportError?.(errorMsg);
      console.error('File parse error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setImportedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!content.trim()) {
      const errorMsg = '没有内容可导出';
      setError(errorMsg);
      onExportError?.(errorMsg);
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      if (format === 'txt') {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const response = await fetch('/api/files/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, format, filename }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate document');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setExportedFormat(format);
      onExportSuccess?.(format);
      setTimeout(() => setExportedFormat(null), 2000);
    } catch (err) {
      const errorMsg = `导出${format.toUpperCase()}失败，请重试`;
      setError(errorMsg);
      onExportError?.(errorMsg);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const ExportButton = ({ format, onClick }: { format: ExportFormat; onClick: () => void }) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled || isExporting}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border-2
          transition-all duration-200
          ${
            disabled || isExporting
              ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
              : 'bg-white border-gray-300 hover:border-[#FF4757] hover:bg-red-50'
          }
        `}
      >
        {format === 'txt' && <FileText className="w-4 h-4 text-gray-600" />}
        {format === 'docx' && <File className="w-4 h-4 text-blue-600" />}
        {format === 'pdf' && <FileText className="w-4 h-4 text-red-600" />}
        <span className="text-sm font-medium text-gray-700">{format.toUpperCase()}</span>
      </button>
    );
  };

  // Compact变体
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {(mode === 'both' || mode === 'import') && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept={acceptedTypes.join(',')}
              className="hidden"
              disabled={disabled}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isImporting}
              className={`
                flex items-center space-x-1 px-3 py-2 rounded-lg
                transition-all duration-200
                ${
                  disabled || isImporting
                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                    : 'bg-[#FF4757] hover:bg-[#E84118] text-white'
                }
              `}
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">导入</span>
            </button>
          </>
        )}

        {(mode === 'both' || mode === 'export') && (
          <div className="flex items-center space-x-1">
            <ExportButton format="txt" onClick={() => handleExport('txt')} />
            <ExportButton format="docx" onClick={() => handleExport('docx')} />
            <ExportButton format="pdf" onClick={() => handleExport('pdf')} />
          </div>
        )}

        {exportedFormat && (
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>{exportedFormat.toUpperCase()}已导出</span>
          </div>
        )}
      </div>
    );
  }

  // Minimal变体
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {(mode === 'both' || mode === 'import') && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept={acceptedTypes.join(',')}
              className="hidden"
              disabled={disabled}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isImporting}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="导入文件"
            >
              {isImporting ? (
                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </>
        )}

        {(mode === 'both' || mode === 'export') && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleExport('txt')}
              disabled={disabled || isExporting}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="导出为TXT"
            >
              <FileText className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => handleExport('docx')}
              disabled={disabled || isExporting}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="导出为Word"
            >
              <File className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full变体（默认）
  return (
    <div className={`w-full ${className}`}>
      {/* 可折叠的导入导出区域 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* 标题栏 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-[#FF4757]" />
            <Download className="w-5 h-5 text-[#FF4757]" />
            <span className="font-medium text-gray-900">导入导出</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* 内容区域 */}
        {isExpanded && (
          <div className="p-4 space-y-4 bg-white">
            {/* 导入区域 */}
            {(mode === 'both' || mode === 'import') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  导入文件
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept={acceptedTypes.join(',')}
                  className="hidden"
                  disabled={disabled}
                />

                {!importedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                      transition-all duration-200
                      ${
                        disabled || isImporting
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                          : 'border-gray-300 hover:border-[#FF4757] hover:bg-red-50/30'
                      }
                    `}
                  >
                    {isImporting ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-8 h-8 text-[#FF4757] animate-spin" />
                        <p className="text-sm text-gray-600">正在解析文件...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div className="text-sm">
                          <p className="text-gray-700">
                            <span className="text-[#FF4757] font-medium">点击上传</span> 或拖拽文件到此处
                          </p>
                          <p className="text-gray-500 mt-1">
                            支持 {acceptedTypes.join(', ')}，最大 {maxSize}MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 truncate">
                          {importedFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {formatFileSize(importedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 导出区域 */}
            {(mode === 'both' || mode === 'export') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  导出文件
                </label>
                <div className="flex items-center space-x-2 flex-wrap">
                  {(!isExporting && !exportedFormat) && (
                    <>
                      <ExportButton format="txt" onClick={() => handleExport('txt')} />
                      <ExportButton format="docx" onClick={() => handleExport('docx')} />
                      <ExportButton format="pdf" onClick={() => handleExport('pdf')} />
                    </>
                  )}

                  {isExporting && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在生成文档...</span>
                    </div>
                  )}

                  {(exportedFormat && !isExporting) && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{exportedFormat.toUpperCase()} 导出成功！</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
