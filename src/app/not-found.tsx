'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { BrandIcons } from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-flex items-center justify-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
            <BrandIcons.Logo size={28} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            番茄AI写作助手
          </span>
        </Link>

        {/* 404 图标 */}
        <div className="mb-8 relative">
          <div className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-xl">
            <Search className="text-indigo-400" size={64} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>

        {/* 错误信息 */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          页面未找到
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          抱歉，您访问的页面不存在或已被删除。
        </p>

        {/* 帮助信息 */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md border border-gray-100">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            您可能想要：
          </h2>
          <ul className="space-y-3 text-left text-gray-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-indigo-500">•</span>
              <span>返回首页，重新开始您的创作之旅</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-indigo-500">•</span>
              <span>检查URL是否正确输入</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-indigo-500">•</span>
              <span>联系我们获取帮助</span>
            </li>
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GradientButton
            size="lg"
            icon={<Home size={20} />}
            onClick={() => window.location.href = '/'}
          >
            返回首页
          </GradientButton>
          <Button
            variant="secondary"
            size="lg"
            icon={<ArrowLeft size={20} />}
            onClick={() => window.history.back()}
          >
            返回上页
          </Button>
        </div>

        {/* 快捷链接 */}
        <div className="mt-12">
          <p className="mb-4 text-sm font-medium text-gray-500">快捷链接</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/workspace"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              工作台
            </Link>
            <Link
              href="/works"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              作品管理
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              定价方案
            </Link>
            <Link
              href="/test-report"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              测试报告
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
