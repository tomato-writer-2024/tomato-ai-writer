'use client';

import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, Sparkles, Target, BarChart3, TrendingUp, Lightbulb, FileText, Download, Copy, RefreshCw, Zap, Eye, ChevronRight, AlertCircle, CheckCircle2, BookOpen, Layers, Crown, Star, Award, Upload } from 'lucide-react';

interface AnalysisResult {
  plotStructure: {
    overallRating: number;
    openingScore: number;
    developmentScore: number;
    climaxScore: number;
    endingScore: number;
    rhythmControl: string;
    pacingIssues: string[];
  };
  shuangdianDensity: {
    overallRating: number;
    shuangdianCount: number;
    density: number;
    shuangdianTypes: {
      type: string;
      count: number;
      locations: string[];
    }[];
  };
  hookDesign: {
    overallRating: number;
    openingHook: string;
    chapterHooks: {
      chapter: string;
      hookType: string;
      effectiveness: number;
    }[];
  };
  characterDesign: {
    overallRating: number;
    mainCharacter: {
      name: string;
      personality: string;
      growth: string;
    };
    supportingCharacters: {
      name: string;
      role: string;
      traits: string[];
    }[];
  };
  reversalDesign: {
    overallRating: number;
    reversals: {
      type: string;
      location: string;
      effectiveness: number;
    }[];
  };
  explosiveFormulas: {
    formula: string;
    description: string;
    application: string;
    improvement: string;
  }[];
  overallScore: number;
  improvementSuggestions: string[];
  actionableInsights: string[];
}

export default function ExplosiveAnalyzePage() {
  const [inputContent, setInputContent] = useState('');
  const [novelTitle, setNovelTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'plot' | 'shuangdian' | 'hook' | 'character' | 'reversal'>('overview');

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const genres = [
    { value: 'xuanhuan', label: '玄幻' },
    { value: 'wuxia', label: '武侠' },
    { value: 'xianxia', label: '仙侠' },
    { value: 'dushi', label: '都市' },
    { value: 'lishi', label: '历史' },
    { value: 'junshi', label: '军事' },
    { value: 'kehuan', label: '科幻' },
    { value: 'lingyi', label: '灵异' },
    { value: 'youxi', label: '游戏' },
  ];

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setInputContent(text);
      if (!novelTitle) {
        setNovelTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('文件导入失败');
    }
  };

  const handleAnalyze = async () => {
    if (!inputContent.trim()) {
      alert('请输入或导入小说内容');
      return;
    }

    if (!genre) {
      alert('请选择小说题材');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/explosive/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputContent,
          novelTitle: novelTitle || '未命名作品',
          genre,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '分析失败');
      }

      const result = await response.json();
      if (result.success) {
        setAnalysisResult(result.data);
        setSelectedTab('overview');
      } else {
        throw new Error(result.error || '分析失败');
      }
    } catch (error) {
      console.error('分析失败:', error);
      alert(error instanceof Error ? error.message : '分析失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    const text = JSON.stringify(analysisResult, null, 2);
    navigator.clipboard.writeText(text);
    alert('分析结果已复制到剪贴板');
  };

  const handleExport = async (format: 'word' | 'txt') => {
    if (!analysisResult) {
      alert('没有分析结果可导出');
      return;
    }

    setIsExporting(true);
    try {
      const content = generateReportContent(analysisResult);
      const filename = `${novelTitle || '爆款分析报告'}`;

      const response = await fetch('/api/files/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          format,
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

  const generateReportContent = (result: AnalysisResult): string => {
    return `
${'='.repeat(80)}
${novelTitle || '未命名作品'} - 爆款拆解分析报告
${'='.repeat(80)}

一、综合评分
总体得分：${result.overallScore}/100

二、情节结构分析
总体评分：${result.plotStructure.overallRating}/100
- 开篇得分：${result.plotStructure.openingScore}/100
- 发展得分：${result.plotStructure.developmentScore}/100
- 高潮得分：${result.plotStructure.climaxScore}/100
- 结尾得分：${result.plotStructure.endingScore}/100
节奏把控：${result.plotStructure.rhythmControl}
节奏问题：${result.plotStructure.pacingIssues.join('；') || '无明显问题'}

三、爽点密度分析
总体评分：${result.shuangdianDensity.overallRating}/100
爽点数量：${result.shuangdianDensity.shuangdianCount}
爽点密度：${result.shuangdianDensity.density}
爽点类型分布：
${result.shuangdianDensity.shuangdianTypes.map(t => `  - ${t.type}：${t.count}次`).join('\n')}

四、钩子设计分析
总体评分：${result.hookDesign.overallRating}/100
开篇钩子：${result.hookDesign.openingHook}
章节钩子：
${result.hookDesign.chapterHooks.map(h => `  - ${h.chapter}：${h.hookType}（有效性：${h.effectiveness}/10）`).join('\n')}

五、人设分析
总体评分：${result.characterDesign.overallRating}/100
主角设定：
  - 姓名：${result.characterDesign.mainCharacter.name}
  - 性格：${result.characterDesign.mainCharacter.personality}
  - 成长：${result.characterDesign.mainCharacter.growth}
配角设定：
${result.characterDesign.supportingCharacters.map(c => `  - ${c.name}（${c.role}）：${c.traits.join('、')}`).join('\n')}

六、反转设计分析
总体评分：${result.reversalDesign.overallRating}/100
反转设计：
${result.reversalDesign.reversals.map(r => `  - ${r.type}（${r.location}）：有效性${r.effectiveness}/10`).join('\n')}

七、爆款公式应用
${result.explosiveFormulas.map(f => `${f.formula}：${f.description}\n应用情况：${f.application}\n改进建议：${f.improvement}`).join('\n\n')}

八、改进建议
${result.improvementSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

九、可执行洞察
${result.actionableInsights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

${'='.repeat(80)}
报告生成时间：${new Date().toLocaleString('zh-CN')}
${'='.repeat(80)}
`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: '优秀', variant: 'success' as const };
    if (score >= 70) return { text: '良好', variant: 'default' as const };
    if (score >= 60) return { text: '及格', variant: 'warning' as const };
    return { text: '需改进', variant: 'danger' as const };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Award className="w-8 h-8" />
            爆款拆解分析
          </h1>
          <p className="mt-2 text-gray-600">
            深度拆解爆款作品的核心要素，提炼可复制的成功公式
          </p>
        </div>

        {!analysisResult ? (
          <div className="space-y-6">
            {/* 输入区域 */}
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        小说标题
                      </label>
                      <Input
                        type="text"
                        value={novelTitle}
                        onChange={(e) => setNovelTitle(e.target.value)}
                        placeholder="请输入小说标题"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        小说题材
                      </label>
                      <Select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        options={[
                          { value: '', label: '请选择题材' },
                          ...genres,
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      小说内容
                    </label>
                    <Textarea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder="请输入或导入需要分析的小说内容（建议1万字以上以获得更准确的分析结果）..."
                      className="min-h-[400px] w-full"
                    />
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span>字数：{inputContent.length}</span>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImport}
                          accept=".txt"
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Upload className="w-4 h-4" />
                          导入TXT文件
                        </button>
                      </div>
                    </div>
                  </div>

                  <GradientButton
                    onClick={handleAnalyze}
                    disabled={isLoading || !inputContent.trim() || !genre}
                    className="w-full py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        开始爆款拆解
                      </>
                    )}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 功能说明 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">6大分析维度</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        情节结构、爽点密度、节奏把控、钩子设计、人设分析、反转设计
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">5大爆款公式</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        提炼成功作品的爆款公式，提供可复制的创作模板
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">可执行洞察</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        基于数据分析的改进建议和可执行的优化方案
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 综合评分卡片 */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{novelTitle}</h2>
                    <p className="mt-1 text-gray-600">综合评分报告</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAnalysisResult(null)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重新分析
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {analysisResult.overallScore}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">综合得分</div>
                    <div className={`mt-1 text-sm font-semibold ${getScoreColor(analysisResult.overallScore)}`}>
                      {getScoreBadge(analysisResult.overallScore).text}
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {analysisResult.plotStructure.overallRating}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">情节结构</div>
                    <div className={`mt-1 text-sm font-semibold ${getScoreColor(analysisResult.plotStructure.overallRating)}`}>
                      {getScoreBadge(analysisResult.plotStructure.overallRating).text}
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {analysisResult.shuangdianDensity.overallRating}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">爽点密度</div>
                    <div className={`mt-1 text-sm font-semibold ${getScoreColor(analysisResult.shuangdianDensity.overallRating)}`}>
                      {getScoreBadge(analysisResult.shuangdianDensity.overallRating).text}
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {analysisResult.characterDesign.overallRating}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">人设设计</div>
                    <div className={`mt-1 text-sm font-semibold ${getScoreColor(analysisResult.characterDesign.overallRating)}`}>
                      {getScoreBadge(analysisResult.characterDesign.overallRating).text}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 标签页导航 */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8" aria-label="Tabs">
                {[
                  { id: 'overview' as const, label: '综合概览', icon: BarChart3 },
                  { id: 'plot' as const, label: '情节结构', icon: BookOpen },
                  { id: 'shuangdian' as const, label: '爽点分析', icon: Zap },
                  { id: 'hook' as const, label: '钩子设计', icon: Target },
                  { id: 'character' as const, label: '人设分析', icon: Crown },
                  { id: 'reversal' as const, label: '反转设计', icon: Layers },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`${
                      selectedTab === tab.id
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* 标签页内容 */}
            <Card>
              <CardBody>
                {selectedTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        爆款公式应用
                      </h3>
                      <div className="space-y-4">
                        {analysisResult.explosiveFormulas.map((formula, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default">公式 {index + 1}</Badge>
                              <span className="font-semibold text-gray-900">{formula.formula}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">应用情况</div>
                                <div className="text-sm text-gray-700">{formula.application}</div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">改进建议</div>
                                <div className="text-sm text-blue-600">{formula.improvement}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        可执行洞察
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.actionableInsights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <ChevronRight className="w-5 h-5 text-green-600 mt-0.5" />
                            <span className="text-sm text-gray-700">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        改进建议
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.improvementSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-semibold text-yellow-800">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'plot' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-cyan-50 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-600">
                          {analysisResult.plotStructure.openingScore}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">开篇</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisResult.plotStructure.developmentScore}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">发展</div>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">
                          {analysisResult.plotStructure.climaxScore}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">高潮</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisResult.plotStructure.endingScore}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">结尾</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">节奏把控</h4>
                      <p className="text-gray-700">{analysisResult.plotStructure.rhythmControl}</p>
                    </div>

                    {analysisResult.plotStructure.pacingIssues.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          节奏问题
                        </h4>
                        <div className="space-y-2">
                          {analysisResult.plotStructure.pacingIssues.map((issue, index) => (
                            <div key={index} className="p-3 bg-yellow-50 rounded-lg text-sm text-gray-700">
                              {issue}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'shuangdian' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">
                          {analysisResult.shuangdianDensity.shuangdianCount}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">爽点总数</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                          {analysisResult.shuangdianDensity.density}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">每千字爽点</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">
                          {analysisResult.shuangdianDensity.overallRating}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">密度评分</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">爽点类型分布</h4>
                      <div className="space-y-3">
                        {analysisResult.shuangdianDensity.shuangdianTypes.map((type, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{type.type}</span>
                              <Badge variant="default">{type.count}次</Badge>
                            </div>
                            <div className="text-xs text-gray-500">位置：{type.locations.join('、')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'hook' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">开篇钩子</h4>
                      <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                        <p className="text-gray-700">{analysisResult.hookDesign.openingHook}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">章节钩子分析</h4>
                      <div className="space-y-3">
                        {analysisResult.hookDesign.chapterHooks.map((hook, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{hook.chapter}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="default">{hook.hookType}</Badge>
                                <Badge variant={hook.effectiveness >= 8 ? 'success' : hook.effectiveness >= 6 ? 'default' : 'warning'}>
                                  有效性：{hook.effectiveness}/10
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'character' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        主角设定
                      </h4>
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-16">姓名：</span>
                          <span className="font-medium text-gray-900">{analysisResult.characterDesign.mainCharacter.name}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-gray-500 w-16">性格：</span>
                          <span className="text-gray-700">{analysisResult.characterDesign.mainCharacter.personality}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-gray-500 w-16">成长：</span>
                          <span className="text-gray-700">{analysisResult.characterDesign.mainCharacter.growth}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">配角设定</h4>
                      <div className="space-y-3">
                        {analysisResult.characterDesign.supportingCharacters.map((char, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{char.name}</span>
                              <Badge variant="outline">{char.role}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {char.traits.map((trait, idx) => (
                                <Badge key={idx} variant="secondary" size="sm">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'reversal' && (
                  <div className="space-y-6">
                    {analysisResult.reversalDesign.reversals.length > 0 ? (
                      <div className="space-y-4">
                        {analysisResult.reversalDesign.reversals.map((reversal, index) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="default">{reversal.type}</Badge>
                              <Badge variant={reversal.effectiveness >= 8 ? 'success' : reversal.effectiveness >= 6 ? 'default' : 'warning'}>
                                有效性：{reversal.effectiveness}/10
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">位置：{reversal.location}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Layers className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>暂未检测到明显的反转设计</p>
                        <p className="text-sm mt-1">可以考虑添加剧情反转以增强故事张力</p>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 导出按钮 */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => handleExport('word')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    导出Word
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('txt')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    导出TXT
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
