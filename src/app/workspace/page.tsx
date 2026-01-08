'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  readFileContent,
  exportAsWord,
  exportAsPdf,
  exportAsTxt,
} from '@/lib/fileUtils';
import BrandIcons from '@/lib/brandIcons';
import {
  FileText,
  Copy,
  Download,
  Upload,
  X,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';

interface ContentStats {
  wordCount: number;
  qualityScore: number;
  completionRate: number;
  shuangdianCount: number;
  estimatedReadTime: number;
}

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState('write');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chapterNum, setChapterNum] = useState(1);
  const [storyContext, setStoryContext] = useState('');
  const [characterInfo, setCharacterInfo] = useState('');
  const [plotOutline, setPlotOutline] = useState('');
  const [wordCount, setWordCount] = useState(2500);
  const [isImporting, setIsImporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭导出菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入创作提示');
      return;
    }

    setIsLoading(true);
    setGeneratedContent('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chapter',
          prompt,
          chapterNum,
          context: storyContext,
          characters: characterInfo,
          outline: plotOutline,
          wordCount,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
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
        fullContent += chunk;
        setGeneratedContent(fullContent);
      }

      // 计算内容统计
      setContentStats(calculateContentStats(fullContent));

    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePolish = async () => {
    if (!generatedContent.trim()) {
      alert('请先生成内容');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: generatedContent }),
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
        fullContent += chunk;
        setGeneratedContent(fullContent);
      }

      // 计算内容统计
      setContentStats(calculateContentStats(fullContent));

    } catch (error) {
      console.error('润色失败:', error);
      alert('润色失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!generatedContent.trim()) {
      alert('请先生成内容');
      return;
    }

    setIsLoading(true);
    const originalContent = generatedContent; // 保存原始内容
    try {
      const response = await fetch('/api/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedContent,
          context: storyContext,
          characters: characterInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('续写失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let newContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        newContent += chunk;
        // 只更新新累积的内容，避免重复
        const fullContent = originalContent + '\n\n' + newContent;
        setGeneratedContent(fullContent);

        // 计算内容统计
        setContentStats(calculateContentStats(fullContent));
      }

    } catch (error) {
      console.error('续写失败:', error);
      alert('续写失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('已复制到剪贴板');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `第${chapterNum}章.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const content = await readFileContent(file);
      setGeneratedContent(content);
      // 计算内容统计
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

  const handleExport = async (format: 'word' | 'pdf' | 'txt') => {
    if (!generatedContent.trim()) {
      alert('没有内容可导出');
      return;
    }

    const filename = `第${chapterNum}章.${format === 'word' ? 'docx' : format}`;

    try {
      switch (format) {
        case 'word':
          await exportAsWord(generatedContent, filename);
          break;
        case 'pdf':
          exportAsPdf(generatedContent, filename);
          break;
        case 'txt':
          exportAsTxt(generatedContent, filename);
          break;
      }
      setShowExportMenu(false);
      alert('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                <BrandIcons.Logo size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">番茄AI写作助手</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">剩余生成次数: 5/5</span>
              <Link href="/pricing" className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-md">
                升级VIP
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 功能标签页 */}
        <div className="mb-8 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('write')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'write'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            章节撰写
          </button>
          <button
            onClick={() => setActiveTab('polish')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'polish'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            精修润色
          </button>
          <button
            onClick={() => setActiveTab('continue')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'continue'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            智能续写
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 左侧：输入区 */}
          <div className="space-y-6">
            {/* 章节信息 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">章节信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">章节号</label>
                  <input
                    type="number"
                    value={chapterNum}
                    onChange={(e) => setChapterNum(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">目标字数</label>
                  <input
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value) || 2500)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="2500"
                  />
                </div>
              </div>
            </div>

            {/* 故事背景 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">故事背景</h3>
              <textarea
                value={storyContext}
                onChange={(e) => setStoryContext(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="输入故事世界观、背景设定等..."
              />
            </div>

            {/* 角色信息 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">角色信息</h3>
              <textarea
                value={characterInfo}
                onChange={(e) => setCharacterInfo(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="输入主要角色的性格、能力、关系等..."
              />
            </div>

            {/* 大纲 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">本章大纲</h3>
              <textarea
                value={plotOutline}
                onChange={(e) => setPlotOutline(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="输入本章的主要情节发展..."
              />
            </div>

            {/* 创作提示 */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">创作提示</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="输入本章的具体创作要求，如：主角发现金手指，系统激活，获得超强能力..."
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? '生成中...' : 'AI生成章节'}
              </button>
              {activeTab === 'write' && (
                <button
                  onClick={handlePolish}
                  disabled={isLoading || !generatedContent}
                  className="flex-1 rounded-lg border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '润色中...' : '精修润色'}
                </button>
              )}
              {activeTab === 'continue' && (
                <button
                  onClick={handleContinue}
                  disabled={isLoading || !generatedContent}
                  className="flex-1 rounded-lg border-2 border-purple-600 px-6 py-3 font-semibold text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '续写中...' : '智能续写'}
                </button>
              )}
            </div>
          </div>

          {/* 右侧：输出区 */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
              <div className="flex gap-2">
                {/* 导入按钮 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.txt"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting || isLoading}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <>
                      <Zap className="animate-spin" size={16} />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      导入
                    </>
                  )}
                </button>

                {/* 复制按钮 */}
                <button
                  onClick={handleCopy}
                  disabled={!generatedContent}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy size={16} />
                  复制
                </button>

                {/* 导出菜单 */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={!generatedContent}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div ref={exportMenuRef} className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                      <button
                        onClick={() => handleExport('word')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FileText size={16} className="text-blue-600" />
                        Word 文档
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FileText size={16} className="text-red-600" />
                        PDF 文档
                      </button>
                      <button
                        onClick={() => handleExport('txt')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FileText size={16} className="text-gray-600" />
                        TXT 文档
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 统计数据展示 */}
            {contentStats && (
              <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <FileText className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">字数统计</p>
                      <p className="text-lg font-bold text-gray-900">{contentStats.wordCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <Award className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">质量评分</p>
                      <p className="text-lg font-bold text-gray-900">{contentStats.qualityScore}分</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <TrendingUp className="text-pink-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">预估完读率</p>
                      <p className="text-lg font-bold text-gray-900">{contentStats.completionRate}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <Zap className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">爽点数量</p>
                      <p className="text-lg font-bold text-gray-900">{contentStats.shuangdianCount}个</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6">
              {isLoading ? (
                <div className="flex min-h-[600px] items-center justify-center">
                  <div className="text-center">
                    <BrandIcons.Writing size={64} className="mx-auto mb-4 text-indigo-600 animate-pulse" />
                    <p className="text-gray-600">AI正在创作中，请稍候...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="flex min-h-[600px] items-center justify-center">
                  <div className="text-center text-gray-400">
                    <FileText size={64} className="mx-auto mb-4" />
                    <p>输入创作信息，点击"AI生成章节"开始创作</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
