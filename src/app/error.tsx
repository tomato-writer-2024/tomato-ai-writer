'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('页面错误:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <a href="/" className="mb-8 inline-flex items-center justify-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
            <BrandIcons.Logo size={28} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            番茄AI写作助手
          </span>
        </a>

        {/* 错误图标 */}
        <div className="mb-8">
          <div className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center shadow-xl">
            <AlertTriangle className="text-red-500" size={64} />
          </div>
        </div>

        {/* 错误信息 */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          哎呀，出错了
        </h1>
        <p className="mb-4 text-lg text-gray-600">
          抱歉，页面遇到了一些问题。
        </p>

        {/* 错误详情（开发环境显示） */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-left border border-red-100">
            <h2 className="mb-2 text-sm font-semibold text-red-700">错误详情</h2>
            <p className="text-sm text-red-600 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-red-500 font-mono">
                错误ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="outline"
            size="lg"
            icon={<RefreshCw size={20} />}
            onClick={reset}
          >
            重试
          </Button>
          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            onClick={() => window.location.href = '/'}
          >
            <Home size={20} />
            返回首页
          </button>
        </div>

        {/* 帮助信息 */}
        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100 text-left">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            如果问题持续存在：
          </h2>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-indigo-500">1.</span>
              <span>刷新页面，看是否能解决问题</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-indigo-500">2.</span>
              <span>清除浏览器缓存和Cookie后重试</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-indigo-500">3.</span>
              <span>尝试使用其他浏览器访问</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-indigo-500">4.</span>
              <span>检查网络连接是否正常</span>
            </li>
          </ul>
        </div>

        {/* 快捷链接 */}
        <div className="mt-12">
          <p className="mb-4 text-sm font-medium text-gray-500">快捷链接</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/workspace"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              工作台
            </a>
            <a
              href="/works"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              作品管理
            </a>
            <a
              href="/pricing"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              定价方案
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
