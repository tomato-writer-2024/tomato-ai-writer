'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  FileText,
  Plus,
  BookOpen,
  Settings,
  Zap,
  Star,
  Flame,
  Target,
} from 'lucide-react';
import { BrandIcons } from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea } from '@/components/Input';
import FileUploader from '@/components/FileUploader';
import { QuickExportButton } from '@/components/FileExporter';
import { CHAPTER_WRITING_PROMPTS } from '@/lib/prompts';

interface Novel {
  id: string;
  title: string;
}

interface GenerationStats {
  currentWords: number;
  targetWords: number;
  satisfactionPoints: number;
  pacingAnchors: number;
}

export default function NewChapterPage() {
  const router = useRouter();
  const params = useParams();
  const novelId = params.id as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoadingNovel, setIsLoadingNovel] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [chapterNum, setChapterNum] = useState(1);

  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // 文件导入导出相关
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [importedFilename, setImportedFilename] = useState('');

  // AI生成相关
  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState(2500);
  const [storyContext, setStoryContext] = useState('');
  const [characterInfo, setCharacterInfo] = useState('');
  const [plotOutline, setPlotOutline] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // AI操作状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // 生成统计
  const [stats, setStats] = useState<GenerationStats>({
    currentWords: 0,
    targetWords: 2500,
    satisfactionPoints: 0,
    pacingAnchors: 0,
  });

  useEffect(() => {
    if (novelId) {
      loadNovel();
      loadNextChapterNum();
    }
  }, [novelId]);

  useEffect(() => {
    // 更新统计信息
    setStats((prev) => ({
      ...prev,
      currentWords: content.length,
      targetWords: wordCount,
    }));

    // 计算进度
    if (wordCount > 0) {
      const progress = Math.min((content.length / wordCount) * 100, 100);
      setGenerationProgress(progress);
    }
  }, [content, wordCount]);

  const loadNovel = async () => {
    setIsLoadingNovel(true);
    try {
      const response = await fetch(`/api/novels/${novelId}`);
      if (!response.ok) {
        throw new Error('加载作品信息失败');
      }

      const result = await response.json();
      if (result.success) {
        setNovel(result.data);
      }
    } catch (error) {
      console.error('加载作品信息失败:', error);
      alert('加载作品信息失败，请刷新重试');
    } finally {
      setIsLoadingNovel(false);
    }
  };

  const loadNextChapterNum = async () => {
    try {
      const response = await fetch(`/api/chapters?novelId=${novelId}&limit=1`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          const latestChapter = result.data[0];
          setChapterNum(latestChapter.chapterNum + 1);
        }
      }
    } catch (error) {
      console.error('加载章节序号失败:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('请输入章节标题');
      return;
    }

    if (!content.trim()) {
      alert('请输入章节内容');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId,
          chapterNum,
          title: title.trim(),
          content,
          wordCount: content.length,
          isPublished,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '创建章节失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('章节创建成功！');
        router.push(`/novel/${novelId}/chapter/${result.data.id}`);
      } else {
        throw new Error(result.error || '创建章节失败');
      }
    } catch (error) {
      console.error('创建章节失败:', error);
      alert(error instanceof Error ? error.message : '创建章节失败，请稍后重试');
    } finally {
      setIsCreating(false);
    }
  };

  const handleContentLoaded = (importedContent: string, filename: string) => {
    setContent(content + '\n\n' + importedContent);
    setImportedFilename(filename);
    setShowFileUpload(false);
    alert(`文件 "${filename}" 导入成功！内容已添加到章节末尾。`);
  };

  const handleAIGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入写作提示');
      return;
    }

    setIsGenerating(true);
    setContent('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          storyContext,
          characterInfo,
          plotOutline,
          wordCount,
          mode: 'write',
          promptTemplate: selectedTemplate,
          chapterTitle: title,
        }),
      });

      if (!response.ok) {
        throw new Error('AI生成失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let generatedText = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;

        // 处理SSE数据
        const lines = accumulatedText.split('\n');
        accumulatedText = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]' || data === '[OPTIMIZED]') {
              continue;
            }
            if (data.startsWith('[ERROR]')) {
              throw new Error(data.slice(7));
            }
            if (data) {
              generatedText += data;
              setContent(generatedText);
            }
          }
        }
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      alert(error instanceof Error ? error.message : 'AI生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoadingNovel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50">
        <Loader2 className="animate-spin text-cyan-600" size={40} />
        <p className="ml-4 text-slate-600">加载中...</p>
      </div>
    );
  }

  const selectedTemplateData = CHAPTER_WRITING_PROMPTS.find((t) => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <ArrowLeft size={20} />
                返回
              </button>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-slate-900 dark:text-slate-100 font-medium">新建章节</span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-slate-600 dark:text-slate-400">
                {novel?.title}
              </span>
            </div>

            {content && (
              <div className="flex gap-2">
                <QuickExportButton
                  content={content}
                  format="docx"
                  filename={title || `第${chapterNum}章`}
                  disabled={isGenerating}
                />
                <QuickExportButton
                  content={content}
                  format="pdf"
                  filename={title || `第${chapterNum}章`}
                  disabled={isGenerating}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      <form onSubmit={handleCreate}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 主编辑区 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 章节信息卡片 */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
                <CardBody>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
                        <BookOpen size={24} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                          新建章节
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          目标：9.8分+ / Top3
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 生成进度条 */}
                  {isGenerating && (
                    <div className="mb-6 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 border border-cyan-200 dark:border-cyan-800">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-cyan-600" />
                          <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                            AI正在创作中...
                          </span>
                        </div>
                        <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                          {content.length.toLocaleString()} / {wordCount.toLocaleString()} 字
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-cyan-200 dark:bg-cyan-900 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* 章节序号和标题 */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                          章节序号
                        </label>
                        <Input
                          type="number"
                          value={chapterNum}
                          onChange={(e) => setChapterNum(parseInt(e.target.value) || 1)}
                          min="1"
                          className="text-base"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                          章节标题 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="例如：第1章 惊天奇遇"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="text-base"
                        />
                      </div>
                    </div>

                    {/* 章节内容编辑区 */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          章节内容 <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowFileUpload(!showFileUpload)}
                          className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                        >
                          <Plus size={14} />
                          {showFileUpload ? '隐藏' : '显示'}文件导入
                        </button>
                      </div>
                      <Textarea
                        placeholder="开始创作你的章节内容...
AI将帮你达到9.8分+质量标准，实现各题材Top3目标..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={20}
                        className="min-h-[500px] font-mono text-base leading-relaxed"
                        required
                      />

                      {/* 统计信息 */}
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          {importedFilename && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              ✓ 已导入: {importedFilename}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                          <span>{content.length.toLocaleString()} 字</span>
                          <span>
                            {stats.currentWords > 0
                              ? ((stats.satisfactionPoints / stats.currentWords) * 1000).toFixed(2)
                              : '0.00'}{' '}
                            爽点/千字
                          </span>
                        </div>
                      </div>

                      {/* 文件导入区域 */}
                      {showFileUpload && (
                        <div className="mt-3">
                          <FileUploader
                            onContentLoaded={handleContentLoaded}
                            acceptedTypes={['.txt', '.pdf', '.doc', '.docx']}
                            maxSize={10}
                          />
                        </div>
                      )}
                    </div>

                    {/* 发布选项 */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <label
                        htmlFor="published"
                        className="text-sm text-slate-900 dark:text-slate-100"
                      >
                        立即发布
                      </label>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-4">
                      <GradientButton
                        type="submit"
                        icon={<Save size={18} />}
                        isLoading={isCreating}
                        className="flex-1"
                      >
                        创建章节
                      </GradientButton>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* AI写作助手 */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
                <CardBody>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                      <Sparkles size={20} className="text-purple-600" />
                      AI写作助手
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Settings size={16} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>

                  {/* 模板选择 */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                      创作模式
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedTemplate(e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {CHAPTER_WRITING_PROMPTS.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Textarea
                      placeholder="输入写作提示，例如：主角在修炼中突破..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="text-sm"
                    />
                    {showAdvancedOptions && (
                      <>
                        <Textarea
                          placeholder="故事背景（可选）"
                          value={storyContext}
                          onChange={(e) => setStoryContext(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                        <Textarea
                          placeholder="角色信息（可选）"
                          value={characterInfo}
                          onChange={(e) => setCharacterInfo(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                        <Textarea
                          placeholder="剧情大纲（可选）"
                          value={plotOutline}
                          onChange={(e) => setPlotOutline(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </>
                    )}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                        目标字数
                      </label>
                      <select
                        value={wordCount.toString()}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setWordCount(parseInt(e.target.value))
                        }
                        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="1000">1000字</option>
                        <option value="1500">1500字</option>
                        <option value="2000">2000字</option>
                        <option value="2500">2500字（推荐）</option>
                        <option value="3000">3000字</option>
                        <option value="5000">5000字</option>
                      </select>
                    </div>
                    <GradientButton
                      fullWidth
                      icon={<Sparkles size={18} />}
                      onClick={handleAIGenerate}
                      isLoading={isGenerating}
                      disabled={!prompt.trim()}
                    >
                      AI生成内容
                    </GradientButton>
                  </div>
                </CardBody>
              </Card>

              {/* 质量标准 */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
                <CardBody>
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <Star size={20} className="text-amber-500" />
                    质量目标
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">目标评分</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">9.8分+</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">目标排名</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">Top3</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">节奏锚点</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        1个/500字
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">情节密度</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        1个/2000字
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">爽点密度</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        1个/1000字
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">对话占比</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">40%-45%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">首章完读率</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">60%+</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 当前模板说明 */}
              {selectedTemplateData && (
                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 dark:from-cyan-500/20 dark:to-blue-600/20 backdrop-blur-lg border border-cyan-200/50 dark:border-cyan-800/50">
                  <CardBody>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                        <Target size={18} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {selectedTemplateData.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {selectedTemplateData.description}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* 快捷操作 */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
                <CardBody>
                  <h3 className="mb-4 font-bold text-slate-900 dark:text-slate-100">
                    快捷操作
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => router.push(`/novel/${novelId}`)}
                    >
                      返回作品详情
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => router.push('/workspace')}
                    >
                      前往工作台
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
