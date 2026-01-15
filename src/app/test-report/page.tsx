'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import {
  Play, BarChart3, Zap, Clock, CheckCircle, XCircle,
  TrendingUp, Target, AlertTriangle, Download, RefreshCw,
  FileText, Share2,
} from 'lucide-react';

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
  avgExecutionTime: string;
  avgResponseTime: string;
  avgWordCount: number;
  avgCompletionRate: string;
  avgQualityScore: string;
  minResponseTime: string;
  maxResponseTime: string;
  responseTimeUnder1s: string;
  details?: any[]; // 测试详情
}

interface TestResult {
  success: boolean;
  data?: {
    summary: TestSummary;
    executionTime: string;
    testCaseCount: number;
  };
  error?: string;
}

export default function TestReportPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'ab' | 'performance'>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const [abTestResult, setAbTestResult] = useState<any>(null);
  const [perfResult, setPerfResult] = useState<any>(null);

  const [testCount, setTestCount] = useState(100);
  const [testType, setTestType] = useState<'single' | 'benchmark' | 'autotune'>('single');
  const [iterations, setIterations] = useState(10);

  // 执行生成测试
  const runGenerateTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: testCount,
          types: ['generate', 'continue', 'polish'],
        }),
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : '测试执行失败',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 导出测试结果
  const exportTestResult = () => {
    if (!testResult || !testResult.success) return;

    const dataStr = JSON.stringify(testResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-result-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 执行A/B测试
  const runABTest = async () => {
    setIsLoading(true);
    setAbTestResult(null);

    try {
      const response = await fetch('/api/test/ab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: testCount,
          testType: 'preset',
          presetIndex: 0,
        }),
      });

      const result = await response.json();
      setAbTestResult(result.data);
    } catch (error) {
      console.error('A/B测试失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 导出A/B测试结果
  const exportABResult = () => {
    if (!abTestResult) return;

    const dataStr = JSON.stringify(abTestResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ab-test-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 执行性能测试
  const runPerformanceTest = async () => {
    setIsLoading(true);
    setPerfResult(null);

    try {
      const response = await fetch('/api/test/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: testType,
          iterations,
        }),
      });

      const result = await response.json();
      setPerfResult(result.data);
    } catch (error) {
      console.error('性能测试失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 导出性能测试结果
  const exportPerfResult = () => {
    if (!perfResult) return;

    const dataStr = JSON.stringify(perfResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `perf-test-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            AI写作工具测试中心
          </h1>
          <p className="text-slate-600">
            批量测试、A/B测试、性能监控 - 确保系统质量和性能
          </p>
        </div>

        {/* 选项卡 */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === 'generate' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('generate')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            功能测试
          </Button>
          <Button
            variant={activeTab === 'ab' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('ab')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            A/B测试
          </Button>
          <Button
            variant={activeTab === 'performance' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('performance')}
          >
            <Zap className="w-4 h-4 mr-2" />
            性能测试
          </Button>
        </div>

        {/* 功能测试 */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      批量功能测试
                    </h2>
                    <p className="text-slate-600">
                      验证生成、续写、润色功能的准确性和质量
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={testCount}
                      onChange={(e) => setTestCount(Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg"
                      min="10"
                      max="10000"
                    />
                    <span className="text-slate-600">个测试用例</span>
                    <GradientButton
                      onClick={runGenerateTest}
                      disabled={isLoading}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isLoading ? '测试中...' : '开始测试'}
                    </GradientButton>
                  </div>
                </div>

                {testResult && testResult.success && testResult.data && (
                  <div className="space-y-6">
                    {/* 汇总卡片 */}
                    <div className="flex justify-end mb-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Download className="w-4 h-4 mr-2" />}
                        onClick={exportTestResult}
                      >
                        导出结果
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-600">通过率</p>
                              <p className="text-3xl font-bold text-green-700">
                                {testResult.data.summary.passRate}
                              </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                          </div>
                        </CardBody>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-600">平均响应时间</p>
                              <p className="text-3xl font-bold text-blue-700">
                                {testResult.data.summary.avgResponseTime}
                              </p>
                            </div>
                            <Clock className="w-12 h-12 text-blue-500" />
                          </div>
                        </CardBody>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-purple-600">平均完读率</p>
                              <p className="text-3xl font-bold text-purple-700">
                                {testResult.data.summary.avgCompletionRate}
                              </p>
                            </div>
                            <Target className="w-12 h-12 text-purple-500" />
                          </div>
                        </CardBody>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-orange-600">质量评分</p>
                              <p className="text-3xl font-bold text-orange-700">
                                {testResult.data.summary.avgQualityScore}
                              </p>
                            </div>
                            <Zap className="w-12 h-12 text-orange-500" />
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* 详细数据 */}
                    <Card>
                      <CardBody>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">详细数据</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm text-slate-600">总测试数</p>
                            <p className="text-xl font-bold text-slate-800">
                              {testResult.data.summary.total}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">通过数</p>
                            <p className="text-xl font-bold text-green-600">
                              {testResult.data.summary.passed}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">失败数</p>
                            <p className="text-xl font-bold text-red-600">
                              {testResult.data.summary.failed}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">平均字数</p>
                            <p className="text-xl font-bold text-slate-800">
                              {testResult.data.summary.avgWordCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">最小响应时间</p>
                            <p className="text-xl font-bold text-slate-800">
                              {testResult.data.summary.minResponseTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">最大响应时间</p>
                            <p className="text-xl font-bold text-slate-800">
                              {testResult.data.summary.maxResponseTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">&lt;1秒响应比例</p>
                            <p className="text-xl font-bold text-slate-800">
                              {testResult.data.summary.responseTimeUnder1s}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">总执行时间</p>
                            <p className="text-xl font-bold text-slate-800">
                              {testResult.data.executionTime}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* 测试用例列表 */}
                    <Card>
                      <CardBody>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">测试用例详情</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-3">ID</th>
                                <th className="text-left py-2 px-3">类型</th>
                                <th className="text-left py-2 px-3">字数</th>
                                <th className="text-left py-2 px-3">完读率</th>
                                <th className="text-left py-2 px-3">质量分</th>
                                <th className="text-left py-2 px-3">响应时间</th>
                                <th className="text-left py-2 px-3">状态</th>
                              </tr>
                            </thead>
                            <tbody>
                              {testResult.data.summary.details?.slice(0, 20).map((detail: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-2 px-3 text-slate-600">{detail.testCaseId.split('_').slice(-1)[0]}</td>
                                  <td className="py-2 px-3">
                                    <Badge variant={detail.type === 'generate' ? 'success' : detail.type === 'continue' ? 'info' : 'warning'}>
                                      {detail.type}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-slate-800">{detail.metrics?.wordCount || '-'}</td>
                                  <td className="py-2 px-3 text-slate-800">{detail.metrics?.completionRate?.toFixed(2) || '-'}%</td>
                                  <td className="py-2 px-3 text-slate-800">{detail.metrics?.qualityScore?.toFixed(2) || '-'}</td>
                                  <td className="py-2 px-3 text-slate-800">{detail.responseTime}ms</td>
                                  <td className="py-2 px-3">
                                    {detail.passed ? (
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {testResult.data.summary.details && testResult.data.summary.details.length > 20 && (
                            <p className="text-sm text-slate-500 mt-3 text-center">
                              仅显示前20条，导出完整结果查看详情
                            </p>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                {testResult && !testResult.success && (
                  <Card className="bg-red-50">
                    <CardBody>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <div>
                          <p className="font-bold text-red-700">测试失败</p>
                          <p className="text-red-600">{testResult.error}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* A/B测试 */}
        {activeTab === 'ab' && (
          <div className="space-y-6">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      A/B测试对比
                    </h2>
                    <p className="text-slate-600">
                      对比不同提示词和算法参数的效果
                    </p>
                  </div>
                  <GradientButton
                    onClick={runABTest}
                    disabled={isLoading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isLoading ? '测试中...' : '开始测试'}
                  </GradientButton>
                </div>

                {abTestResult && (
                  <div className="space-y-6">
                    {/* 导出按钮 */}
                    <div className="flex justify-end mb-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Download className="w-4 h-4 mr-2" />}
                        onClick={exportABResult}
                      >
                        导出结果
                      </Button>
                    </div>
                    {/* 胜者展示 */}
                    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
                      <CardBody>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-indigo-600 mb-1">最佳配置</p>
                            <p className="text-3xl font-bold text-indigo-700">
                              {abTestResult.winner}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-indigo-600 mb-1">改进幅度</p>
                            <p className="text-3xl font-bold text-green-600">
                              +{abTestResult.improvement}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* 变体对比 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {abTestResult.variants.map((variant: any, index: number) => (
                        <Card
                          key={index}
                          className={variant.name === abTestResult.winner
                            ? 'ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50'
                            : ''}
                        >
                          <CardBody>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-slate-800">
                                {variant.name}
                              </h3>
                              {variant.name === abTestResult.winner && (
                                <Badge variant="success">胜者</Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-600">通过率</span>
                                <span className="font-bold">{variant.summary.passRate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">响应时间</span>
                                <span className="font-bold">{variant.summary.avgResponseTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">完读率</span>
                                <span className="font-bold">{variant.summary.avgCompletionRate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">质量评分</span>
                                <span className="font-bold">{variant.summary.avgQualityScore}</span>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>

                    {/* 建议和指标 */}
                    <Card>
                      <CardBody>
                        <h3 className="text-lg font-bold text-slate-800 mb-3">最佳指标</h3>
                        <p className="text-slate-600 mb-4">{abTestResult.bestMetric}</p>

                        <h3 className="text-lg font-bold text-slate-800 mb-3">优化建议</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-600">
                          {abTestResult.recommendations.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* 性能测试 */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      AI性能测试
                    </h2>
                    <p className="text-slate-600">
                      监控AI响应时间，确保首字响应 &lt; 1秒
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={testType}
                      onChange={(e) => setTestType(e.target.value as any)}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="single">单次测试</option>
                      <option value="benchmark">基准测试</option>
                      <option value="autotune">自动调优</option>
                    </select>
                    {testType === 'benchmark' && (
                      <input
                        type="number"
                        value={iterations}
                        onChange={(e) => setIterations(Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg"
                        min="1"
                        max="100"
                      />
                    )}
                    <GradientButton
                      onClick={runPerformanceTest}
                      disabled={isLoading}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isLoading ? '测试中...' : '开始测试'}
                    </GradientButton>
                  </div>
                </div>

                {perfResult && (
                  <div className="space-y-6">
                    {/* 导出按钮 */}
                    <div className="flex justify-end mb-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Download className="w-4 h-4 mr-2" />}
                        onClick={exportPerfResult}
                      >
                        导出结果
                      </Button>
                    </div>
                    {/* 核心指标 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className={`${
                        perfResult.meetsGoal || perfResult.type === 'autotune'
                          ? 'bg-gradient-to-br from-green-50 to-green-100'
                          : 'bg-gradient-to-br from-red-50 to-red-100'
                      }`}>
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-600">首字响应时间</p>
                              <p className="text-3xl font-bold text-slate-800">
                                {testType === 'benchmark' || testType === 'autotune'
                                  ? perfResult[testType === 'autotune' ? 'after' : 'average'].firstTokenTime
                                  : perfResult.metrics.firstTokenTime
                                }
                              </p>
                            </div>
                            {perfResult.meetsGoal || (testType === 'autotune' && Number(perfResult.after.firstTokenTime.replace('ms', '')) < 1000) ? (
                              <CheckCircle className="w-12 h-12 text-green-500" />
                            ) : (
                              <XCircle className="w-12 h-12 text-red-500" />
                            )}
                          </div>
                        </CardBody>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-600">生成速度</p>
                              <p className="text-3xl font-bold text-blue-700">
                                {testType === 'benchmark' || testType === 'autotune'
                                  ? perfResult[testType === 'autotune' ? 'after' : 'average'].tokensPerSecond
                                  : perfResult.metrics.tokensPerSecond
                                }
                              </p>
                            </div>
                            <Zap className="w-12 h-12 text-blue-500" />
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* 性能分析 */}
                    {perfResult.analysis && (
                      <Card>
                        <CardBody>
                          <h3 className="text-lg font-bold text-slate-800 mb-3">性能分析</h3>
                          <div className="mb-4">
                            <p className="text-sm text-slate-600 mb-1">性能评分</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                  style={{ width: `${perfResult.analysis.score}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-800">
                                {perfResult.analysis.score}/100
                              </span>
                            </div>
                          </div>

                          {perfResult.analysis.issues.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-red-600 mb-2 font-medium">发现问题</p>
                              <ul className="list-disc list-inside space-y-1 text-red-700">
                                {perfResult.analysis.issues.map((issue: string, index: number) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {perfResult.analysis.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm text-indigo-600 mb-2 font-medium">优化建议</p>
                              <ul className="list-disc list-inside space-y-1 text-indigo-700">
                                {perfResult.analysis.recommendations.map((rec: string, index: number) => (
                                  <li key={index}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    )}

                    {/* 自动调优结果 */}
                    {testType === 'autotune' && perfResult.improvement && (
                      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
                        <CardBody>
                          <h3 className="text-lg font-bold text-slate-800 mb-3">自动调优效果</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-600 mb-1">首字响应时间优化</p>
                              <p className="text-2xl font-bold text-green-600">
                                {perfResult.improvement.firstTokenTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 mb-1">总耗时优化</p>
                              <p className="text-2xl font-bold text-green-600">
                                {perfResult.improvement.totalTime}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
