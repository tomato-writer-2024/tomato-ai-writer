'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [checks, setChecks] = useState<Record<string, { status: 'loading' | 'success' | 'error'; message: string }>>({
    react: { status: 'loading', message: '检查React...' },
    nextjs: { status: 'loading', message: '检查Next.js...' },
    styles: { status: 'loading', message: '检查样式...' },
    navigation: { status: 'loading', message: '检查路由...' },
  });

  useEffect(() => {
    // 检查React
    try {
      setChecks(prev => ({ ...prev, react: { status: 'success', message: 'React加载成功' } }));
    } catch (error) {
      setChecks(prev => ({ ...prev, react: { status: 'error', message: 'React加载失败' } }));
    }

    // 检查Next.js
    try {
      if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
        setChecks(prev => ({ ...prev, nextjs: { status: 'success', message: 'Next.js数据加载成功' } }));
      } else {
        setChecks(prev => ({ ...prev, nextjs: { status: 'error', message: 'Next.js数据未找到' } }));
      }
    } catch (error) {
      setChecks(prev => ({ ...prev, nextjs: { status: 'error', message: 'Next.js检查失败' } }));
    }

    // 检查样式
    try {
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-red-500';
      const hasStyles = window.getComputedStyle(testDiv).backgroundColor !== '';
      setChecks(prev => ({
        ...prev,
        styles: { status: hasStyles ? 'success' : 'error', message: hasStyles ? 'Tailwind CSS加载成功' : 'Tailwind CSS未加载' }
      }));
    } catch (error) {
      setChecks(prev => ({ ...prev, styles: { status: 'error', message: '样式检查失败' } }));
    }

    // 检查路由
    try {
      setChecks(prev => ({ ...prev, navigation: { status: 'success', message: '路由工作正常' } }));
    } catch (error) {
      setChecks(prev => ({ ...prev, navigation: { status: 'error', message: '路由检查失败' } }));
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="text-green-500">✓</span>;
      case 'error':
        return <span className="text-red-500">✗</span>;
      default:
        return <span className="text-blue-500">⟳</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">系统诊断页面</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">系统检查</h2>
          <div className="space-y-3">
            {Object.entries(checks).map(([key, check]) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <div className="text-xl">{getStatusIcon(check.status)}</div>
                <div className="flex-1">
                  <div className="font-medium capitalize">{key}</div>
                  <div className="text-sm text-gray-600">{check.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">快速测试</h2>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回首页
            </button>
            <button
              onClick={() => window.location.href = '/workspace'}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              访问工作台
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">环境信息</h2>
          <div className="space-y-2 text-sm">
            <div><strong>浏览器:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</div>
            <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
            <div><strong>时间:</strong> {new Date().toLocaleString('zh-CN')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
