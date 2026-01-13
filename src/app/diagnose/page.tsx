'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Terminal, Activity } from 'lucide-react';

type HealthStatus = 'loading' | 'healthy' | 'unhealthy' | 'error';

interface HealthCheckResult {
  status: HealthStatus;
  requestId: string;
  timestamp: string;
  responseTime: string;
  checks: {
    environment: {
      status: 'ok' | 'error';
      message: string;
      details: Record<string, boolean | string>;
    };
    database: {
      status: 'ok' | 'error';
      message: string;
      connectionTime: string;
    };
  };
  system?: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: string;
    memory: {
      used: string;
      total: string;
    };
  };
}

export default function DiagnosePage() {
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'environment' | 'database' | 'system'>('overview');

  const fetchHealthCheck = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health');
      const data = await response.json();

      if (response.ok) {
        setHealthData(data);
      } else {
        setError(data.error || '健康检查失败');
        setHealthData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthCheck();
    // 每30秒自动刷新
    const interval = setInterval(fetchHealthCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">系统诊断</h1>
            <button
              onClick={fetchHealthCheck}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>刷新</span>
            </button>
          </div>
          <p className="text-gray-600">
            实时监控系统状态、数据库连接和环境配置
          </p>
        </div>

        {/* Loading State */}
        {isLoading && !healthData && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">诊断失败</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Health Data */}
        {healthData && (
          <>
            {/* Overall Status Card */}
            <div className="mb-6 p-6 rounded-xl bg-white border-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${getStatusColor(healthData.status)}`}>
                    {healthData.status === 'healthy' ? (
                      <Activity className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">系统状态</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">{healthData.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">响应时间</p>
                  <p className="text-xl font-mono text-gray-900">{healthData.responseTime}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  请求ID: {healthData.requestId} | 更新时间: {new Date(healthData.timestamp).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex gap-4">
                {[
                  { id: 'overview', label: '概览' },
                  { id: 'environment', label: '环境变量' },
                  { id: 'database', label: '数据库' },
                  { id: 'system', label: '系统信息' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {/* Overview Tab */}
              {selectedTab === 'overview' && (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Environment Status */}
                  <div className="p-5 rounded-lg bg-white border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">环境变量</h3>
                      {getStatusIcon(healthData.checks.environment.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {healthData.checks.environment.message}
                    </p>
                    <div className="space-y-2">
                      {Object.entries(healthData.checks.environment.details).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{key}</span>
                          <span className={`font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
                            {value ? '✓' : '✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Database Status */}
                  <div className="p-5 rounded-lg bg-white border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">数据库连接</h3>
                      {getStatusIcon(healthData.checks.database.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {healthData.checks.database.message}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">连接时间</span>
                      <span className="font-mono text-gray-900">{healthData.checks.database.connectionTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Environment Tab */}
              {selectedTab === 'environment' && (
                <div className="p-5 rounded-lg bg-white border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">环境变量详情</h3>
                  <div className="space-y-3">
                    {Object.entries(healthData.checks.environment.details).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(value ? 'ok' : 'error')}
                          <span className="font-mono text-sm text-gray-700">{key}</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            value
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {value ? '已配置' : '未配置'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {Object.values(healthData.checks.environment.details).some(v => !v) && (
                    <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        ⚠️ 检测到未配置的环境变量，请在Vercel控制台中配置
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Database Tab */}
              {selectedTab === 'database' && (
                <div className="p-5 rounded-lg bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">数据库连接详情</h3>
                    {getStatusIcon(healthData.checks.database.status)}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">状态</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {healthData.checks.database.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">连接时间</p>
                        <p className="font-mono text-gray-900">
                          {healthData.checks.database.connectionTime}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">
                        {healthData.checks.database.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {selectedTab === 'system' && healthData.system && (
                <div className="p-5 rounded-lg bg-white border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">系统信息</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">Node.js版本</p>
                      <p className="font-mono text-sm text-gray-900">{healthData.system.nodeVersion}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">平台</p>
                      <p className="font-mono text-sm text-gray-900">
                        {healthData.system.platform} / {healthData.system.arch}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">运行时间</p>
                      <p className="font-mono text-sm text-gray-900">{healthData.system.uptime}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">内存使用</p>
                      <p className="font-mono text-sm text-gray-900">
                        {healthData.system.memory.used} / {healthData.system.memory.total}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            番茄小说AI写作工具 - 系统诊断页面
          </p>
        </div>
      </div>
    </div>
  );
}
