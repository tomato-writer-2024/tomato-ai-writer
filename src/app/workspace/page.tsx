'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  readFileContent,
  exportAsWord,
  exportAsTxt,
} from '@/lib/fileUtils';
import BrandIcons from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import { Loader2, Download, Copy, Upload, Save, Sparkles, FileText, Book, Zap, Star, Target, Flame, Eye, Plus, ChevronRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface ContentStats {
  wordCount: number;
  qualityScore: number;
  completionRate: number;
  shuangdianCount: number;
  estimatedReadTime: number;
}

interface Novel {
  id: string;
  title: string;
}

export default function WorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [originalContent, setOriginalContent] = useState('');
  const [polishedContent, setPolishedContent] = useState('');
  const [storyContext, setStoryContext] = useState('');
  const [chapterOutline, setChapterOutline] = useState('');
  const [bookOutline, setBookOutline] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAnalysisMenu, setShowAnalysisMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const analysisMenuRef = useRef<HTMLDivElement>(null);

  // 作品和章节相关状态
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (analysisMenuRef.current && !analysisMenuRef.current.contains(event.target as Node)) {
        setShowAnalysisMenu(false);
      }
    };

    if (showExportMenu || showAnalysisMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu, showAnalysisMenu]);

  // 加载作品列表
  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      const response = await fetch('/api/novels', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setNovels(result.data);
        }
      }
    } catch (error) {
      console.error('加载作品列表失败:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      alert('请输入作品标题');
      return;
    }

    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProjectTitle.trim(),
          description: '',
          genre: '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '创建作品失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('作品创建成功！');
        setShowNewProjectModal(false);
        setNewProjectTitle('');
        loadNovels();
        setSelectedNovelId(result.data.id);
      }
    } catch (error) {
      console.error('创建作品失败:', error);
      alert(error instanceof Error ? error.message : '创建作品失败，请稍后重试');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const content = await readFileContent(file);
      setOriginalContent(content);
      setContentStats(calculateContentStats(content));
      alert('文件导入成功！');
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalysis = async (type: 'original' | 'plot' | 'structure') => {
    if (!originalContent.trim()) {
      alert('请先导入原稿');
      return;
    }

    if (!selectedNovelId) {
      alert('请先选择作品');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: originalContent,
          type,
          context: {
            storyContext,
            chapterOutline,
            bookOutline,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('分析失败');
      }

      const result = await response.json();
      if (result.success) {
        setAnalysisResult(result.data);
        alert('分析完成！');
      } else {
        throw new Error(result.error || '分析失败');
      }
    } catch (error) {
      console.error('分析失败:', error);
      alert('分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
      setShowAnalysisMenu(false);
    }
  };

  const handlePolish = async (type: 'full' | 'chapter' | 'batch') => {
    if (!originalContent.trim()) {
      alert('请先导入原稿');
      return;
    }

    if (!selectedNovelId) {
      alert('请先选择作品');
      return;
    }

    setIsPolishing(true);
    setPolishedContent('');

    try {
      const response = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: originalContent,
          type,
          context: {
            storyContext,
            chapterOutline,
            bookOutline,
            analysisResult,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('润色失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // 检查是否是完成标记
        if (chunk.includes('[OPTIMIZED]')) {
          const content = chunk.replace('[OPTIMIZED]', '');
          fullContent += content;
        } else {
          fullContent += chunk;
        }

        setPolishedContent(fullContent);

        // 实时更新内容统计
        setContentStats(calculateContentStats(fullContent));
      }

      alert('润色完成！');

    } catch (error) {
      console.error('润色失败:', error);
      alert('润色失败，请稍后重试');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(polishedContent || originalContent);
    alert('已复制到剪贴板');
  };

  const handleExport = async (format: 'word' | 'txt', content: string) => {
    if (!content.trim()) {
      alert('没有内容可导出');
      return;
    }

    const filename = selectedNovelId ? `精修作品` : `精修内容`;

    try {
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
        setShowExportMenu(false);
        alert('导出成功！');
      } else {
        throw new Error(result.error || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 计算内容统计
  const calculateContentStats = (content: string): ContentStats => {
    const wordCount = content.length;

    // 计算爽点数量
    const shuangdianKeywords = [
      '打脸', '碾压', '震惊', '恐怖', '变态',
      '牛逼', '炸裂', '秒杀', '无敌', '巅峰',
      '突破', '进阶', '蜕变', '觉醒', '爆发',
      '美女', '心动', '脸红', '迷恋', '痴迷',
      '财富', '宝物', '神药', '秘籍', '传承',
      '智商', '算计', '布局', '谋略', '智慧',
      '反差', '逆袭', '翻身', '超越',
    ];
    let shuangdianCount = 0;
    shuangdianKeywords.forEach((keyword) => {
      shuangdianCount += (content.match(new RegExp(keyword, 'g')) || []).length;
    });

    // 计算完读率（简化版算法）
    const density = shuangdianCount / (wordCount / 500);
    const densityScore = Math.min(30, density * 15);

    const paragraphs = content.split('\n').filter((p) => p.trim().length > 0);
    const avgParaLength = wordCount / (paragraphs.length || 1);
    const lengthScore = avgParaLength >= 50 && avgParaLength <= 150 ? 20 : 10;

    const emotionWords = ['爽', '炸裂', '牛逼', '震撼', '感动', '期待', '紧张', '激动', '兴奋'];
    let emotionCount = 0;
    emotionWords.forEach((word) => {
      emotionCount += (content.match(new RegExp(word, 'g')) || []).length;
    });
    const emotionScore = Math.min(15, emotionCount * 2);

    const lastParagraph = paragraphs[paragraphs.length - 1] || '';
    const hasHook = lastParagraph.includes('吗') || lastParagraph.includes('？') || lastParagraph.includes('...');
    const hookScore = hasHook ? 15 : 5;

    const totalScore = densityScore + lengthScore + emotionScore + hookScore;
    const completionRate = 60 + (totalScore / 100) * 40;

    // 计算质量评分
    const qualityScore = Math.min(100, Math.max(0,
      (wordCount >= 1000 ? 20 : (wordCount / 1000) * 20) +
      (completionRate * 0.4) +
      Math.min(20, density * 10) +
      15
    ));

    // 估算阅读时间（500字/分钟）
    const estimatedReadTime = (wordCount / 500) * 60;

    return {
      wordCount,
      qualityScore: Math.round(qualityScore),
      completionRate: Math.round(completionRate),
      shuangdianCount,
      estimatedReadTime: Math.round(estimatedReadTime),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                精修润色工作台
              </h1>
              <p className="mt-2 text-gray-600">专业的AI文本润色工具，提升作品质量</p>
            </div>

            {/* 新建项目按钮 */}
            <GradientButton
              onClick={() => setShowNewProjectModal(true)}
              icon={<Plus size={18} />}
            >
              新建项目
            </GradientButton>
          </div>
        </div>

        {/* 作品选择器 */}
        <div className="mb-8">
          <Card>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100">
                  <Book size={24} className="text-cyan-600" />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    选择作品
                  </label>
                  <Select
                    value={selectedNovelId}
                    onChange={(e) => setSelectedNovelId(e.target.value)}
                    options={[
                      { value: '', label: '请先选择或创建作品' },
                      ...novels.map((novel) => ({
                        value: novel.id,
                        label: novel.title,
                      })),
                    ]}
                    fullWidth
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 左侧：输入区 */}
          <div className="space-y-6">
            {/* 原稿正文内容 */}
            <Card>
              <div className="flex items-center justify-between border-b border-gray-200/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100">
                    <FileText size={20} className="text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">原稿正文内容</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf,.txt"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    variant="outline"
                    size="sm"
                    icon={<Upload size={16} />}
                  >
                    {isImporting ? '导入中...' : '导入文件'}
                  </Button>
                  <Button
                    onClick={handleCopy}
                    disabled={!originalContent}
                    variant="ghost"
                    size="sm"
                    icon={<Copy size={16} />}
                  >
                    复制
                  </Button>
                </div>
              </div>
              <CardBody>
                <Textarea
                  value={originalContent}
                  onChange={(e) => {
                    setOriginalContent(e.target.value);
                    setContentStats(calculateContentStats(e.target.value));
                  }}
                  rows={15}
                  placeholder="在此粘贴原稿内容，或点击「导入文件」上传文档..."
                  fullWidth
                  className="text-gray-900"
                />
                {contentStats && (
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                    <span>字数: {contentStats.wordCount}</span>
                    <span>质量: {contentStats.qualityScore}分</span>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 章节剧情梗概 */}
            <Card>
              <div className="flex items-center gap-3 border-b border-gray-200/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                  <Sparkles size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">章节剧情梗概</h3>
              </div>
              <CardBody>
                <Textarea
                  value={chapterOutline}
                  onChange={(e) => setChapterOutline(e.target.value)}
                  rows={5}
                  placeholder="输入本章的剧情梗概，AI会参考这些信息进行润色..."
                  fullWidth
                />
              </CardBody>
            </Card>

            {/* 本书大纲 */}
            <Card>
              <div className="flex items-center gap-3 border-b border-gray-200/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100">
                  <Book size={20} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">本书大纲</h3>
              </div>
              <CardBody>
                <Textarea
                  value={bookOutline}
                  onChange={(e) => setBookOutline(e.target.value)}
                  rows={5}
                  placeholder="输入本书的整体大纲、世界观设定、角色关系等..."
                  fullWidth
                />
              </CardBody>
            </Card>

            {/* 故事背景 */}
            <Card>
              <div className="flex items-center gap-3 border-b border-gray-200/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Target size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">故事背景</h3>
              </div>
              <CardBody>
                <Textarea
                  value={storyContext}
                  onChange={(e) => setStoryContext(e.target.value)}
                  rows={4}
                  placeholder="输入故事世界观、背景设定等额外信息..."
                  fullWidth
                />
              </CardBody>
            </Card>
          </div>

          {/* 右侧：分析和润色区 */}
          <div className="space-y-6">
            {/* 分析结果 */}
            <Card>
              <div className="flex items-center justify-between border-b border-gray-200/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                    <Eye size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">分析结果</h3>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowAnalysisMenu(!showAnalysisMenu)}
                    disabled={!originalContent || !selectedNovelId}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <RefreshCw size={16} />
                    开始分析
                    <svg
                      className={`h-4 w-4 transition-transform ${showAnalysisMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showAnalysisMenu && (
                    <div ref={analysisMenuRef} className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl animate-fadeIn">
                      <button
                        onClick={() => handleAnalysis('original')}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors first:rounded-t-xl"
                      >
                        <div className="rounded-lg bg-green-100 p-1.5">
                          <Eye size={16} className="text-green-600" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">原稿分析</span>
                          <span className="text-xs text-gray-500">分析内容质量</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleAnalysis('plot')}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
                      >
                        <div className="rounded-lg bg-purple-100 p-1.5">
                          <Sparkles size={16} className="text-purple-600" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">剧情分析</span>
                          <span className="text-xs text-gray-500">分析情节发展</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleAnalysis('structure')}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors last:rounded-b-xl"
                      >
                        <div className="rounded-lg bg-blue-100 p-1.5">
                          <Target size={16} className="text-blue-600" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">结构分析</span>
                          <span className="text-xs text-gray-500">分析章节结构</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <CardBody className="min-h-[200px]">
                {isAnalyzing ? (
                  <div className="flex min-h-[180px] items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100">
                        <Eye size={32} className="text-green-600 animate-pulse" />
                      </div>
                      <p className="text-gray-600">AI正在分析中，请稍候...</p>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-4">
                    {analysisResult.summary && (
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">内容摘要</h4>
                        <p className="text-sm text-gray-600">{analysisResult.summary}</p>
                      </div>
                    )}
                    {analysisResult.suggestions && (
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">修改建议</h4>
                        <ul className="space-y-2">
                          {analysisResult.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <ChevronRight size={16} className="mt-0.5 text-cyan-600 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center text-gray-400">
                    <div className="text-center">
                      <AlertCircle size={32} className="mx-auto mb-2" />
                      <p>请先导入原稿并开始分析</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 润色结果 */}
            <Card>
              <div className="flex items-center justify-between border-b border-gray-200/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                    <Sparkles size={20} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">润色结果</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    disabled={!polishedContent}
                    variant="ghost"
                    size="sm"
                    icon={<Copy size={16} />}
                  >
                    复制
                  </Button>
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={!polishedContent}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Download size={16} />
                      导出
                      <svg
                        className={`h-4 w-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {showExportMenu && (
                      <div ref={exportMenuRef} className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-xl animate-fadeIn">
                        <button
                          onClick={() => handleExport('word', polishedContent)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors first:rounded-t-xl"
                        >
                          <div className="rounded-lg bg-blue-100 p-1.5">
                            <Download size={16} className="text-blue-600" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Word 文档</span>
                            <span className="text-xs text-gray-500">.docx 格式</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExport('txt', polishedContent)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 transition-colors last:rounded-b-xl"
                        >
                          <div className="rounded-lg bg-gray-100 p-1.5">
                            <Download size={16} className="text-gray-600" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">TXT 文档</span>
                            <span className="text-xs text-gray-500">纯文本格式</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <CardBody className="min-h-[400px]">
                {isPolishing ? (
                  <div className="flex min-h-[380px] items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                        <Sparkles size={40} className="text-amber-600 animate-pulse" />
                      </div>
                      <p className="text-gray-600">AI正在润色中，请稍候...</p>
                    </div>
                  </div>
                ) : polishedContent ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                      {polishedContent}
                    </pre>
                  </div>
                ) : (
                  <div className="flex min-h-[380px] items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Sparkles size={32} className="mx-auto mb-2" />
                      <p>润色结果将显示在这里</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 润色操作按钮 */}
            <div className="grid gap-4 md:grid-cols-3">
              <GradientButton
                onClick={() => handlePolish('full')}
                isLoading={isPolishing}
                disabled={!originalContent || !selectedNovelId}
                icon={<Sparkles size={18} />}
              >
                全文精修
              </GradientButton>
              <Button
                onClick={() => handlePolish('chapter')}
                isLoading={isPolishing}
                disabled={!originalContent || !selectedNovelId}
                variant="outline"
                icon={<Book size={18} />}
              >
                单章精修
              </Button>
              <Button
                onClick={() => handlePolish('batch')}
                isLoading={isPolishing}
                disabled={!originalContent || !selectedNovelId}
                variant="outline"
                icon={<Zap size={18} />}
              >
                批量精修
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 新建项目弹窗 */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">新建作品</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="作品标题"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="例如：都市神医"
                fullWidth
              />
              <div className="flex gap-3">
                <GradientButton
                  onClick={handleCreateProject}
                  fullWidth
                >
                  创建
                </GradientButton>
                <Button
                  onClick={() => setShowNewProjectModal(false)}
                  variant="outline"
                  fullWidth
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
