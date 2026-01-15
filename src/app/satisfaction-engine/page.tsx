'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, Star, Sparkles, Crown, Copy, Download, RefreshCw, Zap, Target, TrendingUp, Flame, Award, Heart, BookOpen } from 'lucide-react';

interface SatisfactionAnalysis {
  originalContent: string;
  optimizedContent: string;
  satisfactionScore: number;
  keySatisfactionPoints: Array<{
    type: string;
    location: string;
    intensity: number;
    description: string;
    suggestion: string;
  }>;
  improvements: Array<{
    type: string;
    original: string;
    optimized: string;
    reason: string;
  }>;
  estimatedCompletionRate: number;
  targetAudience: string;
}

export default function SatisfactionEnginePage() {
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('');
  const [optimizationType, setOptimizationType] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SatisfactionAnalysis | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const genres = [
    { value: 'xuanhuan', label: '玄幻' },
    { value: 'wuxia', label: '武侠' },
    { value: 'xianxia', label: '仙侠' },
    { value: 'dushi', label: '都市' },
    { value: 'lishi', label: '历史' },
    { value: 'junshi', label: '军事' },
    { value: 'kehuan', label: '科幻' },
  ];

  const optimizationTypes = [
    { value: 'light', label: '轻度优化', desc: '保留原意，微调表达' },
    { value: 'medium', label: '中度优化', desc: '增强爽点，优化节奏' },
    { value: 'heavy', label: '重度优化', desc: '全面重构，爆款升级' },
  ];

  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert('请输入需要优化的内容');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/satisfaction-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          genre,
          optimizationType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '优化失败');
      }

      const result = await response.json();
      if (result.success) {
        setAnalysis(result.data);
      } else {
        throw new Error(result.error || '优化失败');
      }
    } catch (error) {
      console.error('优化失败:', error);
      alert(error instanceof Error ? error.message : '优化失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板');
  };

  const handleExport = async (exportContent: string) => {
    if (!exportContent.trim()) {
      alert('没有内容可导出');
      return;
    }

    setIsExporting(true);
    try {
      const filename = `爽点优化_${new Date().toLocaleDateString()}`;

      const response = await fetch('/api/files/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: exportContent,
          format: 'txt',
          filename,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '导出失败');
      }

      const result = await response.json();
      if (result.success && result.data.url) {
        window.open(result.data.url, '_blank');
        alert('导出成功！');
      } else {
        throw new Error(result.error || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Star className="w-8 h-8" />
            爽点优化引擎
          </h1>
          <p className="mt-2 text-gray-600">
            智能识别和优化爽点，提升完读率和读者满意度
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入配置区 */}
          <div className="space-y-6">
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      原稿内容
                    </label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="请输入需要优化的内容..."
                      className="min-h-[250px] w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        小说题材
                      </label>
                      <Select
                        value={genre}
                        onChange={(value) => setGenre(value as any)}
                        placeholder="请选择题材"
                        options={genres.map(g => ({ value: g.value, label: g.label }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        优化程度
                      </label>
                      <Select
                        value={optimizationType}
                        onChange={(value) => setOptimizationType(value as any)}
                        options={optimizationTypes.map(t => ({ value: t.value, label: t.label }))}
                      />
                    </div>
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    icon={isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isAnalyzing ? '优化中...' : '开始优化'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 优化程度说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                  优化程度说明
                </h3>
                <div className="space-y-3">
                  {optimizationTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        optimizationType === type.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setOptimizationType(type.value as any)}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.desc}</div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-6">
            {analysis && (
              <>
                {/* 评分卡片 */}
                <Card>
                  <CardBody>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">优化结果</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 text-center">
                        <div className="text-3xl font-bold text-cyan-600 mb-1">
                          {analysis.satisfactionScore}
                        </div>
                        <div className="text-sm text-gray-600">爽点评分</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {analysis.estimatedCompletionRate}%
                        </div>
                        <div className="text-sm text-gray-600">预计完读率</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">目标读者</div>
                      <Badge variant="secondary">{analysis.targetAudience}</Badge>
                    </div>
                  </CardBody>
                </Card>

                {/* 优化后内容 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-cyan-600" />
                        优化后内容
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Copy size={16} />}
                          onClick={() => handleCopy(analysis.optimizedContent)}
                        >
                          复制
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Download size={16} />}
                          onClick={() => handleExport(analysis.optimizedContent)}
                          disabled={isExporting}
                        >
                          {isExporting ? '导出中...' : '导出'}
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 max-h-80 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {analysis.optimizedContent}
                      </pre>
                    </div>
                  </CardBody>
                </Card>

                {/* 爽点分析 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-cyan-600" />
                      爽点分析 ({analysis.keySatisfactionPoints.length})
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {analysis.keySatisfactionPoints.map((point, index) => (
                        <div key={index} className="p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {point.type}
                              </Badge>
                              <span className="text-sm text-gray-600">{point.location}</span>
                            </div>
                            <div className={`w-12 h-2 rounded-full ${getIntensityColor(point.intensity)}`} />
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{point.description}</p>
                          <div className="text-xs text-cyan-600 bg-cyan-50 p-2 rounded">
                            <Target size={12} className="inline mr-1" />
                            {point.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* 改进点 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-cyan-600" />
                      改进点 ({analysis.improvements.length})
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {analysis.improvements.map((improvement, index) => (
                        <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {improvement.type}
                            </Badge>
                          </div>
                          <div className="text-sm mb-1">
                            <span className="text-gray-500">原文：</span>
                            <span className="text-gray-700 line-through">{improvement.original}</span>
                          </div>
                          <div className="text-sm mb-1">
                            <span className="text-green-600">优化：</span>
                            <span className="text-gray-900 font-medium">{improvement.optimized}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {improvement.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {!analysis && !isAnalyzing && (
              <Card>
                <CardBody className="py-16 text-center">
                  <Star size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待优化
                  </h3>
                  <p className="text-gray-600">
                    输入原稿内容，AI将为你分析爽点并优化
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
