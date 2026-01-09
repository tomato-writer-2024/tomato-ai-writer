'use client';

import { Loader2 } from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="animate-pulse bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-lg shadow-lg">
          <BrandIcons.Logo size={32} className="text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          番茄AI写作助手
        </span>
      </div>

      {/* 加载动画 */}
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="text-gray-600">加载中...</p>
      </div>

      {/* 进度条 */}
      <div className="mt-8 w-64">
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/2 animate-pulse bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        </div>
      </div>
    </div>
  );
}
