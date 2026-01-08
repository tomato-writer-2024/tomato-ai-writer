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
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import { Loader2, Download, Copy, Upload } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 功能标签页 */}
        <div className="mb-8 flex gap-2 rounded-xl bg-white p-2 shadow-md">
          <button
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              activeTab === 'write'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BrandIcons.Writing size={18} />
            章节撰写
          </button>
          <button
            onClick={() => setActiveTab('polish')}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              activeTab === 'polish'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BrandIcons.Sparkles size={18} />
            精修润色
          </button>
          <button
            onClick={() => setActiveTab('continue')}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all ${
              activeTab === 'continue'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BrandIcons.Zap size={18} />
            智能续写
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 左侧：输入区 */}
          <div className="space-y-6">
            {/* 章节信息 */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                    <BrandIcons.Book size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">章节信息</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    type="number"
                    label="章节号"
                    value={chapterNum.toString()}
                    onChange={(e) => setChapterNum(parseInt(e.target.value) || 1)}
                    placeholder="1"
                    fullWidth
                  />
                  <Select
                    label="目标字数"
                    value={wordCount.toString()}
                    onChange={(e) => setWordCount(parseInt(e.target.value) || 2500)}
                    options={[
                      { value: '2000', label: '2000字' },
                      { value: '2500', label: '2500字' },
                      { value: '3000', label: '3000字' },
                      { value: '4000', label: '4000字' },
                      { value: '5000', label: '5000字' },
                    ]}
                    fullWidth
                  />
                </div>
              </CardBody>
            </Card>

            {/* 故事背景 */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-2">
                    <BrandIcons.AI size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">故事背景</h3>
                </div>
                <Textarea
                  value={storyContext}
                  onChange={(e) => setStoryContext(e.target.value)}
                  rows={4}
                  placeholder="输入故事世界观、背景设定等..."
                  fullWidth
                />
              </CardBody>
            </Card>

            {/* 角色信息 */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-gradient-to-br from-pink-100 to-orange-100 p-2">
                    <BrandIcons.Sparkles size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">角色信息</h3>
                </div>
                <Textarea
                  value={characterInfo}
                  onChange={(e) => setCharacterInfo(e.target.value)}
                  rows={4}
                  placeholder="输入主要角色的性格、能力、关系等..."
                  fullWidth
                />
              </CardBody>
            </Card>

            {/* 大纲 */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 p-2">
                    <BrandIcons.Export size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">本章大纲</h3>
                </div>
                <Textarea
                  value={plotOutline}
                  onChange={(e) => setPlotOutline(e.target.value)}
                  rows={4}
                  placeholder="输入本章的主要情节发展..."
                  fullWidth
                />
              </CardBody>
            </Card>

            {/* 创作提示 */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 p-2">
                    <BrandIcons.Zap size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">创作提示</h3>
                </div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  placeholder="输入本章的具体创作要求，如：主角发现金手指，系统激活，获得超强能力..."
                  fullWidth
                />
              </CardBody>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <GradientButton
                onClick={handleGenerate}
                isLoading={isLoading}
                icon={<BrandIcons.Zap size={18} />}
                fullWidth
              >
                AI生成章节
              </GradientButton>
              {activeTab === 'write' && (
                <Button
                  onClick={handlePolish}
                  disabled={isLoading || !generatedContent}
                  variant="outline"
                  icon={<BrandIcons.Sparkles size={18} />}
                  fullWidth
                >
                  {isLoading ? '润色中...' : '精修润色'}
                </Button>
              )}
              {activeTab === 'continue' && (
                <Button
                  onClick={handleContinue}
                  disabled={isLoading || !generatedContent}
                  variant="outline"
                  icon={<BrandIcons.Efficiency size={18} />}
                  fullWidth
                >
                  {isLoading ? '续写中...' : '智能续写'}
                </Button>
              )}
            </div>
          </div>

          {/* 右侧：输出区 */}
          <Card>
            <div className="flex items-center justify-between border-b border-gray-200/50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                  <BrandIcons.Writing size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
              </div>
              <div className="flex gap-2">
                {/* 导入按钮 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.txt"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting || isLoading}
                  variant="ghost"
                  icon={isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  size="sm"
                  title="导入文件"
                >
                  {isImporting ? '导入中...' : '导入'}
                </Button>

                {/* 复制按钮 */}
                <Button
                  onClick={handleCopy}
                  disabled={!generatedContent}
                  variant="ghost"
                  icon={<Copy size={16} />}
                  size="sm"
                  title="复制内容"
                >
                  复制
                </Button>

                {/* 导出菜单 */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={!generatedContent}
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
                        onClick={() => handleExport('word')}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors first:rounded-t-xl"
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
                        onClick={() => handleExport('pdf')}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-colors"
                      >
                        <div className="rounded-lg bg-red-100 p-1.5">
                          <Download size={16} className="text-red-600" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">PDF 文档</span>
                          <span className="text-xs text-gray-500">.pdf 格式</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleExport('txt')}
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

            {/* 统计数据展示 */}
            {contentStats && (
              <div className="border-b border-gray-200/50 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <BrandIcons.Book size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">字数统计</p>
                      <p className="text-lg font-bold text-gray-900">{contentStats.wordCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <BrandIcons.Quality size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">质量评分</p>
                      <p className="text-lg font-bold text-gray-900">{contentStats.qualityScore}分</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <BrandIcons.Stats size={24} className="text-pink-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">预估完读率</p>
                      <p className="text-lg font-bold text-gray-900">{contentStats.completionRate}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <BrandIcons.Shuangdian size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">爽点数量</p>
                      <p className="text-lg font-bold text-gray-900">{contentStats.shuangdianCount}个</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <CardBody className="min-h-[600px]">
              {isLoading ? (
                <div className="flex min-h-[500px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
                      <BrandIcons.Writing size={40} className="text-indigo-600 animate-pulse" />
                    </div>
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
                <div className="flex min-h-[500px] items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                      <BrandIcons.Book size={40} />
                    </div>
                    <p>输入创作信息，点击"AI生成章节"开始创作</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
