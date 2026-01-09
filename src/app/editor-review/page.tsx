'use client';

import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, FileText, Star, User, BookOpen, Layers, TrendingUp, AlertCircle, CheckCircle2, Download, Copy, RefreshCw, Eye, ChevronRight, Award, Target, Zap } from 'lucide-react';

interface ReviewResult {
  overallScore: {
    editorScore: number;
    readerScore: number;
    combinedScore: number;
    bookReviewTarget: number;
    chapterReviewTarget: number;
  };
  contentAnalysis: {
    wordCount: number;
    plotDensity: number;
    characterDepth: number;
    emotionalResonance: number;
    writingStyle: number;
    originality: number;
    marketFit: number;
    completionPrediction: number;
  };
  editorFeedback: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    suggestions: string[];
  };
  readerFeedback: {
    readingExperience: string;
    engagementLevel: string;
    emotionalImpact: string;
    pageTurnerFactor: string;
    recommendationLikelihood: string;
  };
  marketAnalysis: {
    genre: string;
    targetAudience: string;
    competitiveness: string;
    monetizationPotential: string;
    viralPotential: string;
  };
  actionableInsights: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    insight: string;
    action: string;
  }[];
}

export default function EditorReviewPage() {
  const [inputContent, setInputContent] = useState('');
  const [novelTitle, setNovelTitle] = useState('');
  const [reviewType, setReviewType] = useState<'outline' | 'chapter' | 'fulltext'>('chapter');
  const [genre, setGenre] = useState('');
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleReview = async () => {
    if (!inputContent.trim()) {
      alert('请输入或导入内容');
      return;
    }

    if (!genre) {
      alert('请选择小说题材');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/editor/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputContent,
          novelTitle: novelTitle || '未命名作品',
          reviewType,
          genre,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '审稿失败');
      }

      const result = await response.json();
      if (result.success) {
        setReviewResult(result.data);
      } else {
        throw new Error(result.error || '审稿失败');
      }
    } catch (error) {
      console.error('审稿失败:', error);
      alert(error instanceof Error ? error.message : '审稿失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reviewResult) return;
    const text = JSON.stringify(reviewResult, null, 2);
    navigator.clipboard.writeText(text);
    alert('审稿结果已复制到剪贴板');
  };

  const handleExport = async (format: 'word' | 'txt') => {
    if (!reviewResult) {
      alert('没有审稿结果可导出');
      return;
    }

    setIsExporting(true);
    try {
      const content = generateReportContent(reviewResult);
      const filename = `${novelTitle || '编辑审稿报告'}`;

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

  const generateReportContent = (result: ReviewResult): string => {
    return `
${'='.repeat(80)}
${novelTitle || '未命名作品'} - 编辑审稿报告
${'='.repeat(80)}

一、综合评分
编辑评分（40%权重）：${result.overallScore.editorScore}/100
读者评分（60%权重）：${result.overallScore.readerScore}/100
综合得分：${result.overallScore.combinedScore}/100
书评目标：${result.overallScore.bookReviewTarget}/9.8
章评目标：${result.overallScore.chapterReviewTarget}/9.8

二、内容分析
字数统计：${result.contentAnalysis.wordCount}
情节密度：${result.contentAnalysis.plotDensity}/100
人物深度：${result.contentAnalysis.characterDepth}/100
情感共鸣：${result.contentAnalysis.emotionalResonance}/100
文笔风格：${result.contentAnalysis.writingStyle}/100
原创性：${result.contentAnalysis.originality}/100
市场契合度：${result.contentAnalysis.marketFit}/100
完读率预测：${result.contentAnalysis.completionPrediction}%

三、编辑反馈
优势：
${result.editorFeedback.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}
不足：
${result.editorFeedback.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}
改进建议：
${result.editorFeedback.improvements.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}
优化方向：
${result.editorFeedback.suggestions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

四、读者反馈
阅读体验：${result.readerFeedback.readingExperience}
投入程度：${result.readerFeedback.engagementLevel}
情感冲击：${result.readerFeedback.emotionalImpact}
追读欲望：${result.readerFeedback.pageTurnerFactor}
推荐意愿：${result.readerFeedback.recommendationLikelihood}

五、市场分析
题材分类：${result.marketAnalysis.genre}
目标读者：${result.marketAnalysis.targetAudience}
竞争激烈程度：${result.marketAnalysis.competitiveness}
变现潜力：${result.marketAnalysis.monetizationPotential}
传播潜力：${result.marketAnalysis.viralPotential}

六、可执行洞察
${result.actionableInsights.map((insight, i) => `
[${insight.priority === 'high' ? '高' : insight.priority === 'medium' ? '中' : '低'}优先级] ${insight.category}
${insight.insight}
行动建议：${insight.action}
`).join('\n')}

${'='.repeat(80)}
报告生成时间：${new Date().toLocaleString('zh-CN')}
${'='.repeat(80)}
`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.5) return 'text-green-600';
    if (score >= 9.0) return 'text-blue-600';
    if (score >= 8.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number, target: number) => {
    if (score >= target) return { text: '达成', variant: 'success' as const };
    if (score >= target - 0.3) return { text: '接近', variant: 'default' as const };
    return { text: '未达标', variant: 'danger' as const };
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return { text: '高', variant: 'danger' as const };
      case 'medium':
        return { text: '中', variant: 'warning' as const };
      case 'low':
        return { text: '低', variant: 'default' as const };
      default:
        return { text: '-', variant: 'default' as const };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Award className="w-8 h-8" />
            模拟编辑审稿
          </h1>
          <p className="mt-2 text-gray-600">
            双视角专业审稿，预测书评章评9.8分+，打造爆款作品
          </p>
        </div>

        {!reviewResult ? (
          <div className="space-y-6">
            {/* 输入区域 */}
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        审稿类型
                      </label>
                      <Select
                        value={reviewType}
                        onChange={(e) => setReviewType(e.target.value as any)}
                        options={[
                          { value: 'outline', label: '大纲审稿' },
                          { value: 'chapter', label: '章节审稿' },
                          { value: 'fulltext', label: '全文审稿' },
                        ]}
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
                      内容
                    </label>
                    <Textarea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder={
                        reviewType === 'outline'
                          ? '请输入大纲内容...'
                          : reviewType === 'chapter'
                          ? '请输入章节内容...'
                          : '请输入全文内容...'
                      }
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
                          <FileText className="w-4 h-4" />
                          导入TXT文件
                        </button>
                      </div>
                    </div>
                  </div>

                  <GradientButton
                    onClick={handleReview}
                    disabled={isLoading || !inputContent.trim() || !genre}
                    className="w-full py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        审稿中...
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5 mr-2" />
                        开始审稿
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
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">双视角评分</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        编辑专业视角（40%）+ 读者体验视角（60%），全面评估内容质量
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">9.8分目标预测</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        预测书评章评得分，为达成9.8分+爆款提供明确方向
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">可执行洞察</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        基于数据分析提供优先级明确的改进建议
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
                    <p className="mt-1 text-gray-600">双视角审稿报告</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setReviewResult(null)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重新审稿
                    </Button>
                  </div>
                </div>

                {/* 双视角评分 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-cyan-600" />
                        <span className="font-semibold text-gray-900">编辑视角（40%）</span>
                      </div>
                      <Badge variant="outline">专业审稿</Badge>
                    </div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {reviewResult.overallScore.editorScore}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      评分 / 100
                    </div>
                    <div className="space-y-2">
                      {['情节密度', '人物深度', '文笔风格', '原创性'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item}</span>
                          <span className="font-medium text-gray-900">优秀</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-gray-900">读者视角（60%）</span>
                      </div>
                      <Badge variant="outline">用户体验</Badge>
                    </div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {reviewResult.overallScore.readerScore}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      评分 / 100
                    </div>
                    <div className="space-y-2">
                      {['阅读体验', '情感冲击', '追读欲望', '推荐意愿'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item}</span>
                          <span className="font-medium text-gray-900">强烈</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 综合得分和目标 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {reviewResult.overallScore.combinedScore}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">综合得分</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {reviewResult.overallScore.bookReviewTarget}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">书评预测 / 9.8</div>
                    <Badge
                      variant={getScoreBadge(reviewResult.overallScore.bookReviewTarget, 9.8).variant}
                      className="mt-1"
                    >
                      {getScoreBadge(reviewResult.overallScore.bookReviewTarget, 9.8).text}
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {reviewResult.overallScore.chapterReviewTarget}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">章评预测 / 9.8</div>
                    <Badge
                      variant={getScoreBadge(reviewResult.overallScore.chapterReviewTarget, 9.8).variant}
                      className="mt-1"
                    >
                      {getScoreBadge(reviewResult.overallScore.chapterReviewTarget, 9.8).text}
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      {reviewResult.contentAnalysis.completionPrediction}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">完读率预测</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 内容分析 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  内容分析
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {reviewResult.contentAnalysis.wordCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">字数统计</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {reviewResult.contentAnalysis.plotDensity}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">情节密度</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {reviewResult.contentAnalysis.characterDepth}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">人物深度</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {reviewResult.contentAnalysis.emotionalResonance}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">情感共鸣</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {reviewResult.contentAnalysis.writingStyle}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">文笔风格</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {reviewResult.contentAnalysis.originality}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">原创性</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {reviewResult.contentAnalysis.marketFit}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">市场契合度</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {reviewResult.contentAnalysis.completionPrediction}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">完读率预测</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 编辑反馈 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  编辑反馈
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">优势</h4>
                    <div className="space-y-2">
                      {reviewResult.editorFeedback.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      不足
                    </h4>
                    <div className="space-y-2">
                      {reviewResult.editorFeedback.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">改进建议</h4>
                    <div className="space-y-2">
                      {reviewResult.editorFeedback.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">优化方向</h4>
                    <div className="space-y-2">
                      {reviewResult.editorFeedback.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                          <Zap className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 读者反馈 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  读者反馈
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">阅读体验</div>
                    <div className="text-gray-900">{reviewResult.readerFeedback.readingExperience}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">投入程度</div>
                    <div className="text-gray-900">{reviewResult.readerFeedback.engagementLevel}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">情感冲击</div>
                    <div className="text-gray-900">{reviewResult.readerFeedback.emotionalImpact}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">追读欲望</div>
                    <div className="text-gray-900">{reviewResult.readerFeedback.pageTurnerFactor}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg md:col-span-2">
                    <div className="text-sm text-gray-500 mb-1">推荐意愿</div>
                    <div className="text-gray-900">{reviewResult.readerFeedback.recommendationLikelihood}</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 市场分析 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  市场分析
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">题材分类</div>
                    <div className="font-medium text-gray-900">{reviewResult.marketAnalysis.genre}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">目标读者</div>
                    <div className="font-medium text-gray-900">{reviewResult.marketAnalysis.targetAudience}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">竞争激烈程度</div>
                    <div className="font-medium text-gray-900">{reviewResult.marketAnalysis.competitiveness}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">变现潜力</div>
                    <div className="font-medium text-gray-900">{reviewResult.marketAnalysis.monetizationPotential}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <div className="text-sm text-gray-500 mb-1">传播潜力</div>
                    <div className="font-medium text-gray-900">{reviewResult.marketAnalysis.viralPotential}</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 可执行洞察 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  可执行洞察
                </h3>
                <div className="space-y-3">
                  {reviewResult.actionableInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityBadge(insight.priority).variant} size="sm">
                            {getPriorityBadge(insight.priority).text}优先级
                          </Badge>
                          <span className="font-medium text-gray-900">{insight.category}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{insight.insight}</p>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-600 font-medium">行动：{insight.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
