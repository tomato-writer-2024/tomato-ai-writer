/**
 * Vercel部署测试页面
 * 用于快速检查Vercel部署的状态
 */
'use client';

import { useState, useEffect } from 'react';

export default function TestVercelPage() {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runDiagnostics() {
      try {
        const response = await fetch('/api/diagnose');
        const data = await response.json();
        setDiagnostic(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF4757] to-[#5F27CD]">
        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4757] mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">正在诊断...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF4757] to-[#5F27CD]">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">诊断失败</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF4757] to-[#5F27CD] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Vercel部署诊断报告</h1>

          {/* 环境信息 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">环境信息</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">NODE_ENV:</span>
                <span className="font-mono text-blue-600">{diagnostic?.data?.environment?.nodeEnv}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VERCEL_ENV:</span>
                <span className="font-mono text-blue-600">{diagnostic?.data?.environment?.vercelEnv || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VERCEL_URL:</span>
                <span className="font-mono text-blue-600">{diagnostic?.data?.environment?.vercelUrl || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BASE_URL:</span>
                <span className="font-mono text-blue-600">{diagnostic?.data?.configuration?.baseUrl || 'N/A'}</span>
              </div>
            </div>
          </section>

          {/* 数据库检查 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">数据库检查</h2>
            <div className={`rounded-lg p-4 ${diagnostic?.data?.checks?.database?.status === '连接成功' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${diagnostic?.data?.checks?.database?.status === '连接成功' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">{diagnostic?.data?.checks?.database?.status || '未知'}</span>
              </div>
              {diagnostic?.data?.checks?.database?.tables && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">users表: </span>
                  <span className={diagnostic?.data?.checks?.database?.tables?.users === '存在' ? 'text-green-600' : 'text-red-600'}>
                    {diagnostic?.data?.checks?.database?.tables?.users}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 管理员账户 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">超级管理员账户</h2>
            {diagnostic?.data?.checks?.database?.adminUser?.status === '存在' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">邮箱:</span>
                    <span className="font-mono">{diagnostic?.data?.checks?.database?.adminUser?.data?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">用户名:</span>
                    <span className="font-mono">{diagnostic?.data?.checks?.database?.adminUser?.data?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">角色:</span>
                    <span className="font-mono text-blue-600">{diagnostic?.data?.checks?.database?.adminUser?.data?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">超级管理员:</span>
                    <span className={diagnostic?.data?.checks?.database?.adminUser?.data?.is_super_admin ? 'text-green-600' : 'text-red-600'}>
                      {diagnostic?.data?.checks?.database?.adminUser?.data?.is_super_admin ? '是' : '否'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">状态:</span>
                    <span className={diagnostic?.data?.checks?.database?.adminUser?.data?.is_active ? 'text-green-600' : 'text-red-600'}>
                      {diagnostic?.data?.checks?.database?.adminUser?.data?.is_active ? '激活' : '未激活'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">超级管理员账户不存在，请运行迁移脚本</p>
              </div>
            )}
          </section>

          {/* JWT检查 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">JWT配置</h2>
            <div className={`rounded-lg p-4 ${diagnostic?.data?.checks?.jwt?.status === '已配置' && diagnostic?.data?.checks?.jwt?.valid === '有效' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${diagnostic?.data?.checks?.jwt?.status === '已配置' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="font-semibold">{diagnostic?.data?.checks?.jwt?.status || '未知'}</span>
                {diagnostic?.data?.checks?.jwt?.length > 0 && (
                  <span className="text-sm text-gray-500 ml-2">(长度: {diagnostic?.data?.checks?.jwt?.length})</span>
                )}
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">状态: </span>
                <span className={diagnostic?.data?.checks?.jwt?.valid === '有效' ? 'text-green-600' : 'text-yellow-600'}>
                  {diagnostic?.data?.checks?.jwt?.valid}
                </span>
              </div>
            </div>
          </section>

          {/* API端点 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API端点</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {Object.entries(diagnostic?.data?.checks?.apiEndpoints || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-gray-600 w-24">{key}:</span>
                  <code className="bg-white px-2 py-1 rounded text-sm font-mono text-blue-600">{String(value)}</code>
                </div>
              ))}
            </div>
          </section>

          {/* 操作按钮 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                返回首页
              </a>
              <a
                href="/simple-login"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                测试登录
              </a>
              <a
                href="/workspace"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                进入工作台
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
