"use client";

import React, { useState } from 'react';
import { Download, FileText, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileExporterProps {
  content: string;
  filename?: string;
  disabled?: boolean;
  onExportSuccess?: (format: string) => void;
  onExportError?: (error: string) => void;
}

export default function FileExporter({
  content,
  filename = 'export',
  disabled = false,
  onExportSuccess,
  onExportError,
}: FileExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const exportAsTxt = async () => {
    try {
      setIsExporting(true);
      setError('');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportedFormat('TXT');
      onExportSuccess?.('TXT');
      setTimeout(() => setExportedFormat(null), 2000);
    } catch (err) {
      const errorMsg = '导出TXT失败，请重试';
      setError(errorMsg);
      onExportError?.(errorMsg);
      console.error('TXT export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsWord = async () => {
    try {
      setIsExporting(true);
      setError('');

      // 使用后端API生成Word文档
      const response = await fetch('/api/files/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          format: 'docx',
          filename,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Word document');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportedFormat('Word');
      onExportSuccess?.('Word');
      setTimeout(() => setExportedFormat(null), 2000);
    } catch (err) {
      const errorMsg = '导出Word失败，请重试';
      setError(errorMsg);
      onExportError?.(errorMsg);
      console.error('Word export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPdf = async () => {
    try {
      setIsExporting(true);
      setError('');

      // 使用后端API生成PDF文档
      const response = await fetch('/api/files/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          format: 'pdf',
          filename,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF document');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportedFormat('PDF');
      onExportSuccess?.('PDF');
      setTimeout(() => setExportedFormat(null), 2000);
    } catch (err) {
      const errorMsg = '导出PDF失败，请重试';
      setError(errorMsg);
      onExportError?.(errorMsg);
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const ExportButton = ({ format, onClick }: { format: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={disabled || isExporting}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300
        transition-all duration-200
        ${
          disabled || isExporting
            ? 'opacity-50 cursor-not-allowed bg-gray-100'
            : 'hover:bg-gray-50 hover:border-gray-400 bg-white'
        }
      `}
    >
      {format === 'TXT' && <FileText className="w-4 h-4 text-gray-500" />}
      {format === 'Word' && <File className="w-4 h-4 text-blue-500" />}
      {format === 'PDF' && <FileText className="w-4 h-4 text-red-500" />}
      <span className="text-sm font-medium text-gray-700">{format}</span>
    </button>
  );

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2">
        {!isExporting && !exportedFormat && (
          <>
            <ExportButton format="TXT" onClick={exportAsTxt} />
            <ExportButton format="Word" onClick={exportAsWord} />
            <ExportButton format="PDF" onClick={exportAsPdf} />
          </>
        )}

        {isExporting && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>正在生成文档...</span>
          </div>
        )}

        {exportedFormat && !isExporting && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>{exportedFormat} 导出成功！</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-start space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// 快捷导出按钮组件（用于只导出一种格式的情况）
export function QuickExportButton({
  content,
  format = 'txt',
  filename = 'export',
  disabled = false,
  onExportSuccess,
}: {
  content: string;
  format?: 'txt' | 'docx' | 'pdf';
  filename?: string;
  disabled?: boolean;
  onExportSuccess?: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async () => {
    if (isExporting || disabled) return;

    try {
      setIsExporting(true);

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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            format,
            filename,
          }),
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

      setShowSuccess(true);
      onExportSuccess?.();
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Export error:', err);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`
        inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${
          disabled || isExporting
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
      title={`导出为${format.toUpperCase()}`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : showSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>
        {showSuccess ? '已导出' : isExporting ? '导出中...' : `导出${format.toUpperCase()}`}
      </span>
    </button>
  );
}
