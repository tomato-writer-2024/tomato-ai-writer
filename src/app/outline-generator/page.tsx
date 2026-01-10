'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, FileText, Sparkles, Crown, Star, Copy, Download, RefreshCw, Zap, Target, BookOpen, ChevronRight, Plus, Minus, List, Layers, TrendingUp } from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  summary: string;
  keyEvents: string[];
  wordCount: number;
}

interface NovelOutline {
  title: string;
  genre: string;
  coreTheme: string;
  protagonist: string;
  premise: string;
  plotStructure: string;
  chapters: Chapter[];
  climax: string;
  resolution: string;
  themes: string[];
}

export default function OutlineGeneratorPage() {
  const [novelTitle, setNovelTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [protagonist, setProtagonist] = useState('');
  const [premise, setPremise] = useState('');
  const [chapterCount, setChapterCount] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState<NovelOutline | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const genres = [
    { value: 'xuanhuan', label: '玄幻' },
    { value: 'wuxia', label: '武侠' },
    { value: 'xianxia', label: '仙侠' },
    { value: 'dushi', label: '都市' },
    { value: 'lishi', label: '历史' },
    { value: 'junshi', label: '军事' },
    { value: 'kehuan', label: '科幻' },
    { value: 'lingyi', label: '灵异' },
  ];

  const handleGenerate = async () => {
    if (!novelTitle.trim()) {
      alert('请输入小说标题');
      return;
    }

    if (!genre) {
      alert('请选择小说题材');
      return;
    }

    if (!protagonist.trim()) {
      alert('请输入主角设定');
      return;
    }

    if (!premise.trim()) {
      alert('请输入故事核心设定');
      return;
    }

    setIsGenerating(true);
    setOutline(null);

    try {
      const response = await fetch('/api/outline-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelTitle,
          genre,
          protagonist,
          premise,
          chapterCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const result = await response.json();
      if (result.success) {
        setOutline(result.data);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板');
  };

  const handleExport = async () => {
    if (!outline) {
      alert('没有内容可导出');
      return;
    }

    setIsExporting(true);
    try {
      const content = `小说大纲：${outline.title}\n\n` +
        `题材：${genres.find(g => g.value === outline.genre)?.label}\n` +
        `主角：${outline.protagonist}\n` +
        `核心主题：${outline.coreTheme}\n\n` +
        `故事前提：\n${outline.premise}\n\n` +
        `情节结构：\n${outline.plotStructure}\n\n` +
        `章节大纲：\n${outline.chapters.map((ch, i) => 
          `第${ch.id}章 ${ch.title}\n${ch.summary}\n核心事件：\n${ch.keyEvents.map(e => `  • ${e}`).join('\n')}\n预计字数：${ch.wordCount}\n`
        ).join('\n')}\n\n` +
        `高潮：\n${outline.climax}\n\n` +
        `结局：\n${outline.resolution}\n\n` +
        `主题元素：\n${outline.themes.map(t => `  • ${t}`).join('\n')}`;

      const filename = `小说大纲_${outline.title}`;

      const response = await fetch('/api/files/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <FileText className="w-8 h-8" />
            智能大纲生成
          </h1>
          <p className="mt-2 text-gray-600">
            生成完整小说大纲和章节规划，构建精彩的故事框架
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
                      小说标题
                    </label>
                    <Input
                      value={novelTitle}
                      onChange={(e) => setNovelTitle(e.target.value)}
                      placeholder="请输入小说标题..."
                      icon={<FileText size={20} />}
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
                        章节数量
                      </label>
                      <Input
                        type="number"
                        value={chapterCount}
                        onChange={(e) => setChapterCount(Number(e.target.value))}
                        placeholder="50"
                        min={10}
                        max={500}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主角设定
                    </label>
                    <Textarea
                      value={protagonist}
                      onChange={(e) => setProtagonist(e.target.value)}
                      placeholder="请描述主角的性格、能力、背景等..."
                      className="min-h-[80px] w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      故事核心设定
                    </label>
                    <Textarea
                      value={premise}
                      onChange={(e) => setPremise(e.target.value)}
                      placeholder="请描述故事的核心设定、世界观、主要冲突等..."
                      className="min-h-[120px] w-full"
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isGenerating ? '生成中...' : '生成大纲'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-6">
            {outline && (
              <>
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{outline.title}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Copy size={16} />}
                          onClick={() => handleCopy(JSON.stringify(outline, null, 2))}
                        >
                          复制
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Download size={16} />}
                          onClick={handleExport}
                          disabled={isExporting}
                        >
                          {isExporting ? '导出中...' : '导出'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{genres.find(g => g.value === outline.genre)?.label}</Badge>
                        <Badge variant="secondary">{outline.chapters.length} 章</Badge>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">主角</h4>
                        <p className="text-gray-700">{outline.protagonist}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">核心主题</h4>
                        <p className="text-gray-700">{outline.coreTheme}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">故事前提</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{outline.premise}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">情节结构</h4>
                        <p className="text-gray-700 leading-relaxed">{outline.plotStructure}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Layers size={20} className="text-cyan-600" />
                      章节规划（{outline.chapters.length}章）
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {outline.chapters.slice(0, 20).map((chapter) => (
                        <div key={chapter.id} className="p-3 rounded-lg bg-gray-50 hover:bg-cyan-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">第{chapter.id}章 {chapter.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{chapter.summary}</div>
                              <div className="text-xs text-gray-500 mt-2">
                                预计字数: {chapter.wordCount}
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {chapter.keyEvents.length} 个事件
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {outline.chapters.length > 20 && (
                        <div className="text-center text-sm text-gray-600 py-4">
                          ...还有 {outline.chapters.length - 20} 章
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp size={20} className="text-cyan-600" />
                      高潮与结局
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">高潮</h5>
                        <p className="text-gray-700 text-sm">{outline.climax}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">结局</h5>
                        <p className="text-gray-700 text-sm">{outline.resolution}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {!outline && !isGenerating && (
              <Card>
                <CardBody className="py-16 text-center">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待生成大纲
                  </h3>
                  <p className="text-gray-600">
                    输入小说信息，AI将为你生成完整的大纲和章节规划
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
