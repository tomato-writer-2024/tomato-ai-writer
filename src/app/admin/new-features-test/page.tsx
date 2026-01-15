'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardBody } from '@/components/Card';
import Button from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3,
  FileText,
  Star,
  Target,
  Clock,
} from 'lucide-react';

interface FeatureTestReport {
  featureName: string;
  summary: {
    totalTests: number;
    successCount: number;
    failedCount: number;
    successRate: number;
    avgResponseTime: number;
    avgQualityScore: number;
    avgReadRate: number;
  };
  genreBreakdown: Record<string, any>;
  results: any[];
  issues: string[];
  recommendations: string[];
}

interface TestSummary {
  totalFeatures: number;
  totalTests: number;
  totalSuccess: number;
  overallSuccessRate: number;
  avgQualityScore: number;
  avgReadRate: number;
}

export default function NewFeaturesTestReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<FeatureTestReport[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [testCount, setTestCount] = useState(100);
  const [selectedReport, setSelectedReport] = useState<FeatureTestReport | null>(null);

  // 功能名称映射
  const featureNames: Record<string, string> = {
    'characters': '角色设定系统',
    'world-building': '世界观构建器',
    'outline-generator': '智能大纲生成',
    'relationship-map': '人物关系图谱',
    'writer-block': '卡文诊断助手',
    'satisfaction-engine': '爽点优化引擎',
    'style-simulator': '文风模拟器',
    'plot-twist': '情节反转建议器',
    'ending-generator': '智能结局生成',
    'title-generator': '书名生成器',
    'cover-generator': '封面描述生成',
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setIsLoading(true);
    setReports([]);
    setSelectedReport(null);

    try {
      const response = await fetch('/api/test/new-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCount }),
      });

      if (!response.ok) {
        throw new Error('测试执行失败');
      }

      const result = await response.json();

      if (result.success) {
        setReports(result.data);
        setSummary(result.summary);
      } else {
        throw new Error(result.error || '测试执行失败');
      }
    } catch (error) {
      console.error('执行测试失败:', error);
      alert(error instanceof Error ? error.message : '执行测试失败，请稍后重试');
    } finally {
      setIsRunning(false);
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (reports.length === 0) {
      alert('没有可导出的报告');
      return;
    }

    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `新功能测试报告_${new Date().toLocaleString('zh-CN').replace(/[\/:]/g, '-')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateReportContent = (): string => {
    let content = `新功能模块千例测试报告\n`;
    content += `生成时间：${new Date().toLocaleString('zh-CN')}\n`;
    content += `${'='.repeat(80)}\n\n`;

    if (summary) {
      content += `总体统计\n`;
      content += `${'='.repeat(40)}\n`;
      content += `功能数量：${summary.totalFeatures}\n`;
      content += `总测试数：${summary.totalTests}\n`;
      content += `成功数：${summary.totalSuccess}\n`;
      content += `成功率：${summary.overallSuccessRate.toFixed(2)}%\n`;
      content += `平均质量分：${summary.avgQualityScore.toFixed(2)}\n`;
      content += `平均完读率：${summary.avgReadRate.toFixed(2)}%\n\n`;
    }

    content += `各功能详情\n`;
    content += `${'='.repeat(80)}\n\n`;

    reports.forEach((report, index) => {
      content += `[${index + 1}] ${featureNames[report.featureName] || report.featureName}\n`;
      content += `${'='.repeat(40)}\n`;
      content += `测试数量：${report.summary.totalTests}\n`;
      content += `成功数：${report.summary.successCount}\n`;
      content += `失败数：${report.summary.failedCount}\n`;
      content += `成功率：${report.summary.successRate.toFixed(2)}%\n`;
      content += `平均响应时间：${report.summary.avgResponseTime.toFixed(0)}ms\n`;
      content += `平均质量分：${report.summary.avgQualityScore.toFixed(2)}\n`;
      content += `平均完读率：${report.summary.avgReadRate.toFixed(2)}%\n\n`;

      if (report.issues.length > 0) {
        content += `问题：\n`;
        report.issues.forEach(issue => {
          content += `  - ${issue}\n`;
        });
        content += `\n`;
      }

      if (report.recommendations.length > 0) {
        content += `建议：\n`;
        report.recommendations.forEach(rec => {
          content += `  - ${rec}\n`;
        });
        content += `\n`;
      }

      content += `题材分布：\n`;
      Object.entries(report.genreBreakdown).forEach(([genre, data]: [string, any]) => {
        content += `  ${genre}: ${data.totalTests}测试，成功率${((data.successCount / data.totalTests) * 100).toFixed(2)}%，质量分${data.avgQualityScore.toFixed(2)}，完读率${data.avgReadRate.toFixed(2)}%\n`;
      });

      content += `\n${'='.repeat(80)}\n\n`;
    });

    return content;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-600" />
              新功能模块千例测试报告
            </h1>
            <p className="mt-2 text-slate-600">
              仅在后台显示，用于验证11个核心功能模块的生成质量
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={testCount}
              onChange={(e) => setTestCount(Number(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              disabled={isRunning}
            >
              <option value={100}>100例测试</option>
              <option value={500}>500例测试</option>
              <option value={1000}>1000例测试（推荐）</option>
              <option value={2000}>2000例测试</option>
            </select>
            <Button
              onClick={handleRunTests}
              disabled={isRunning}
              icon={isRunning ? <Loader2 size={18} /> : <Play size={18} />}
              className={isRunning ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isRunning ? '测试中...' : '运行测试'}
            </Button>
            {reports.length > 0 && (
              <Button
                onClick={exportReport}
                icon={<Download size={18} />}
                variant="secondary"
              >
                导出报告
              </Button>
            )}
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <Card className="mb-8">
            <CardBody className="py-12 text-center">
              <Loader2 className="w-12 h-12 text-cyan-600 mx-auto mb-4 animate-spin" />
              <p className="text-lg text-slate-600">
                正在执行测试，这可能需要几分钟时间...
              </p>
            </CardBody>
          </Card>
        )}

        {/* 总体统计 */}
        {summary && reports.length > 0 && (
          <Card className="mb-8 border-2 border-cyan-200">
            <CardBody className="py-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">总体统计</h2>
              <div className="grid gap-6 md:grid-cols-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-600">{summary.totalFeatures}</div>
                  <div className="text-sm text-slate-600 mt-2">功能数量</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{summary.totalTests}</div>
                  <div className="text-sm text-slate-600 mt-2">总测试数</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getSuccessRateColor(summary.overallSuccessRate)}`}>
                    {summary.overallSuccessRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-600 mt-2">成功率</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getQualityScoreColor(summary.avgQualityScore)}`}>
                    {summary.avgQualityScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">平均质量分</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getQualityScoreColor(summary.avgReadRate)}`}>
                    {summary.avgReadRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-600 mt-2">平均完读率</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">
                    {reports.reduce((sum, r) => sum + r.summary.successCount, 0)}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">成功数</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* 功能列表 */}
        {reports.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">各功能详情</h2>

            {reports.map((report, index) => (
              <Card
                key={report.featureName}
                className={`border-2 cursor-pointer transition-all ${
                  selectedReport?.featureName === report.featureName
                    ? 'border-cyan-500 shadow-lg'
                    : 'border-slate-200 hover:border-cyan-300'
                }`}
                onClick={() => setSelectedReport(selectedReport?.featureName === report.featureName ? null : report)}
              >
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        report.summary.successRate >= 95
                          ? 'bg-green-100 text-green-600'
                          : report.summary.successRate >= 80
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {report.summary.successRate >= 95 ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <XCircle size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {featureNames[report.featureName] || report.featureName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                          <span>{report.summary.totalTests} 测试</span>
                          <span>•</span>
                          <span className={getSuccessRateColor(report.summary.successRate)}>
                            成功率 {report.summary.successRate.toFixed(2)}%
                          </span>
                          <span>•</span>
                          <span className={getQualityScoreColor(report.summary.avgQualityScore)}>
                            质量分 {report.summary.avgQualityScore.toFixed(2)}
                          </span>
                          <span>•</span>
                          <span className={getQualityScoreColor(report.summary.avgReadRate)}>
                            完读率 {report.summary.avgReadRate.toFixed(2)}%
                          </span>
                          <span>•</span>
                          <span>
                            响应时间 {report.summary.avgResponseTime.toFixed(0)}ms
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.issues.length > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <AlertTriangle size={14} />
                          {report.issues.length} 个问题
                        </Badge>
                      )}
                      <Badge variant={report.summary.successRate >= 90 ? 'secondary' : 'outline'}>
                        {report.summary.successRate >= 90 ? '优秀' : '需改进'}
                      </Badge>
                    </div>
                  </div>

                  {/* 展开详情 */}
                  {selectedReport?.featureName === report.featureName && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      {/* 指标卡片 */}
                      <div className="grid gap-4 md:grid-cols-4 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={20} className="text-green-600" />
                            <span className="text-sm text-green-700">成功率</span>
                          </div>
                          <div className={`text-3xl font-bold ${getSuccessRateColor(report.summary.successRate)}`}>
                            {report.summary.successRate.toFixed(2)}%
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {report.summary.successCount}/{report.summary.totalTests} 通过
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Star size={20} className="text-blue-600" />
                            <span className="text-sm text-blue-700">质量分</span>
                          </div>
                          <div className={`text-3xl font-bold ${getQualityScoreColor(report.summary.avgQualityScore)}`}>
                            {report.summary.avgQualityScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            目标: 85分
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Target size={20} className="text-purple-600" />
                            <span className="text-sm text-purple-700">完读率</span>
                          </div>
                          <div className={`text-3xl font-bold ${getQualityScoreColor(report.summary.avgReadRate)}`}>
                            {report.summary.avgReadRate.toFixed(2)}%
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            目标: 65%
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={20} className="text-orange-600" />
                            <span className="text-sm text-orange-700">响应时间</span>
                          </div>
                          <div className="text-3xl font-bold text-orange-600">
                            {report.summary.avgResponseTime.toFixed(0)}ms
                          </div>
                          <div className="text-xs text-orange-600 mt-1">
                            目标: &lt;3000ms
                          </div>
                        </div>
                      </div>

                      {/* 题材分布 */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-3">题材分布</h4>
                        <div className="grid gap-3 md:grid-cols-4">
                          {Object.entries(report.genreBreakdown).map(([genre, data]: [string, any]) => (
                            <div
                              key={genre}
                              className="bg-slate-50 rounded-lg p-3 text-sm"
                            >
                              <div className="font-semibold text-slate-900">{genre}</div>
                              <div className="text-slate-600 mt-1">
                                {data.totalTests} 测试 • {data.successCount} 成功
                              </div>
                              <div className="flex gap-2 mt-2">
                                <span className="text-blue-600">
                                  质量: {data.avgQualityScore.toFixed(1)}
                                </span>
                                <span className="text-purple-600">
                                  完读: {data.avgReadRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 问题和建议 */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {report.issues.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              <AlertTriangle size={20} className="text-red-600" />
                              发现的问题
                            </h4>
                            <ul className="space-y-2">
                              {report.issues.map((issue, i) => (
                                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5">•</span>
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {report.recommendations.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              <TrendingUp size={20} className="text-green-600" />
                              优化建议
                            </h4>
                            <ul className="space-y-2">
                              {report.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">•</span>
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
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && reports.length === 0 && (
          <Card>
            <CardBody className="py-20 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无测试报告</h3>
              <p className="text-slate-600 mb-6">
                点击"运行测试"按钮开始执行千例测试
              </p>
              <Button onClick={handleRunTests} icon={<Play size={18} />}>
                开始测试
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
