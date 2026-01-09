'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  Shield,
  FileText,
  Book,
  Sparkles,
  BarChart3,
  Play,
  Download,
} from 'lucide-react';
import Card, { CardBody } from '@/components/Card';
import Button from '@/components/Button';
import { Badge } from '@/components/Badge';
import { FEATURE_MODULES, getStatistics, getCompletedFeatures, getPendingFeatures } from '@/lib/featureAudit';

interface TestReport {
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    timeoutTests: number;
    passRate: number;
    totalDuration: number;
    averageDuration: number;
  };
  categoryBreakdown: Record<string, any>;
  performanceMetrics: Record<string, any>;
  issues: string[];
  recommendations: string[];
}

export default function AdminAuditPage() {
  const [activeTab, setActiveTab] = useState<'features' | 'tests'>('features');
  const [statistics, setStatistics] = useState<any>(null);
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    const stats = getStatistics();
    setStatistics(stats);
  };

  const runComprehensiveTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);

    try {
      const response = await fetch('/api/test/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testCount: 1000,
          parallelExecutions: 10,
          timeoutMs: 30000,
          verbose: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTestReport(data.report.testResults);
      }
    } catch (error) {
      console.error('测试执行失败:', error);
    } finally {
      setIsRunningTests(false);
      setTestProgress(100);
    }
  };

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      featureAudit: statistics,
      testResults: testReport,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!statistics) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Zap className="animate-pulse text-cyan-500 mx-auto mb-4" size={48} />
              <p className="text-slate-600">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedFeatures = getCompletedFeatures();
  const pendingFeatures = getPendingFeatures();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-cyan-500" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">系统功能审计与测试</h1>
                <p className="text-sm text-slate-600">后台开发者专用页面</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {testReport && (
                <Button
                  variant="outline"
                  icon={<Download size={18} />}
                  onClick={exportReport}
                >
                  导出报告
                </Button>
              )}
              <Button
                icon={<Play size={18} />}
                onClick={runComprehensiveTests}
                disabled={isRunningTests}
              >
                {isRunningTests ? '测试中...' : '运行综合测试'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card hover>
            <CardBody>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="text-green-500" size={24} />
                <span className="text-sm text-slate-600">已完成功能</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{statistics.completedFeatures}</div>
              <div className="text-xs text-slate-500">共 {statistics.totalFeatures} 个</div>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-cyan-500" size={24} />
                <span className="text-sm text-slate-600">完成率</span>
              </div>
              <div className="text-3xl font-bold text-cyan-600">{statistics.completionRate}%</div>
              <div className="text-xs text-slate-500">功能完成度</div>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-purple-500" size={24} />
                <span className="text-sm text-slate-600">功能模块</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{statistics.completedModules}</div>
              <div className="text-xs text-slate-500">共 {statistics.totalModules} 个</div>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-orange-500" size={24} />
                <span className="text-sm text-slate-600">待开发</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{statistics.pendingFeatures}</div>
              <div className="text-xs text-slate-500">未完成功能</div>
            </CardBody>
          </Card>
        </div>

        {/* 测试结果概览 */}
        {testReport && (
          <Card className="mb-8 border-2 border-cyan-200">
            <CardBody>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-cyan-500" />
                综合测试结果
              </h2>
              <div className="grid gap-6 md:grid-cols-5">
                <div>
                  <div className="text-sm text-slate-600 mb-1">总测试数</div>
                  <div className="text-2xl font-bold text-slate-900">{testReport.summary.totalTests}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">通过</div>
                  <div className="text-2xl font-bold text-green-600">{testReport.summary.passedTests}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">失败</div>
                  <div className="text-2xl font-bold text-red-600">{testReport.summary.failedTests}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">超时</div>
                  <div className="text-2xl font-bold text-orange-600">{testReport.summary.timeoutTests}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">通过率</div>
                  <div className="text-2xl font-bold text-cyan-600">{testReport.summary.passRate}%</div>
                </div>
              </div>

              {/* 性能指标 */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">性能指标</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-600">总耗时</div>
                    <div className="text-lg font-bold text-slate-900">
                      {(testReport.summary.totalDuration / 1000).toFixed(2)}s
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-600">平均测试时间</div>
                    <div className="text-lg font-bold text-slate-900">
                      {testReport.summary.averageDuration.toFixed(2)}ms
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-600">平均并发度</div>
                    <div className="text-lg font-bold text-slate-900">10</div>
                  </div>
                </div>
              </div>

              {/* 问题和建议 */}
              {(testReport.issues.length > 0 || testReport.recommendations.length > 0) && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="grid gap-6 md:grid-cols-2">
                    {testReport.issues.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                          <AlertTriangle size={16} />
                          发现的问题
                        </h3>
                        <ul className="space-y-2">
                          {testReport.issues.slice(0, 5).map((issue, index) => (
                            <li key={index} className="text-xs text-red-700 bg-red-50 rounded px-2 py-1">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {testReport.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-cyan-900 mb-3 flex items-center gap-2">
                          <Target size={16} />
                          优化建议
                        </h3>
                        <ul className="space-y-2">
                          {testReport.recommendations.map((rec, index) => (
                            <li key={index} className="text-xs text-cyan-700 bg-cyan-50 rounded px-2 py-1">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Tab切换 */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'features' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('features')}
          >
            功能清单
          </Button>
          <Button
            variant={activeTab === 'tests' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('tests')}
          >
            测试结果
          </Button>
        </div>

        {/* 功能清单 */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {FEATURE_MODULES.map((module) => (
              <Card key={module.id} hover>
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{module.name}</h3>
                      <p className="text-sm text-slate-600">{module.description}</p>
                    </div>
                    <Badge
                      variant={module.status === 'completed' ? 'success' : 'warning'}
                    >
                      {module.status === 'completed' ? '已完成' : '进行中'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {module.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="mt-0.5">
                          {feature.status === 'completed' ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <Clock size={16} className="text-orange-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900">
                              {feature.name}
                            </span>
                            {feature.progress !== undefined && (
                              <span className="text-xs text-slate-500">
                                ({feature.progress}%)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">{feature.description}</p>
                          {feature.pages.length > 0 && (
                            <div className="mt-1">
                              <span className="text-xs text-slate-500">
                                页面: {feature.pages.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* 测试结果 */}
        {activeTab === 'tests' && testReport && (
          <div className="space-y-6">
            {/* 分类统计 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-bold text-slate-900 mb-4">分类测试统计</h3>
                <div className="grid gap-4">
                  {Object.entries(testReport.categoryBreakdown).map(([category, stats]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100">
                          {category === 'auth' && <Shield size={20} className="text-cyan-600" />}
                          {category === 'novels' && <Book size={20} className="text-cyan-600" />}
                          {category === 'chapters' && <FileText size={20} className="text-cyan-600" />}
                          {category === 'ai-writing' && <Sparkles size={20} className="text-cyan-600" />}
                          {category === 'files' && <Download size={20} className="text-cyan-600" />}
                          {category === 'stats' && <BarChart3 size={20} className="text-cyan-600" />}
                          {category === 'performance' && <Zap size={20} className="text-cyan-600" />}
                          {category === 'security' && <Shield size={20} className="text-cyan-600" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 capitalize">{category}</div>
                          <div className="text-xs text-slate-600">{stats.total} 次测试</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">{stats.passed} 通过</div>
                        <div className="text-xs text-red-600">{stats.failed} 失败</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* 性能指标 */}
            {Object.keys(testReport.performanceMetrics).length > 0 && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">性能指标详情</h3>
                  <div className="grid gap-4">
                    {Object.entries(testReport.performanceMetrics).map(([key, metrics]: [string, any]) => (
                      <div key={key} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900 capitalize">{key}</span>
                          <Badge variant="success">
                            {metrics.count} 次测量
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-slate-600">最小值</div>
                            <div className="text-sm font-bold text-slate-900">
                              {metrics.min !== undefined ? `${metrics.min.toFixed(2)}ms` : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600">最大值</div>
                            <div className="text-sm font-bold text-slate-900">
                              {metrics.max.toFixed(2)}ms
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600">平均值</div>
                            <div className="text-sm font-bold text-cyan-600">
                              {metrics.avg.toFixed(2)}ms
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
