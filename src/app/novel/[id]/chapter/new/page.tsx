'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Loader2, FileText, Plus } from 'lucide-react';
import { BrandIcons } from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea } from '@/components/Input';
import Navigation from '@/components/Navigation';
import FileUploader from '@/components/FileUploader';
import { QuickExportButton } from '@/components/FileExporter';

interface Novel {
  id: string;
  title: string;
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

  // AI操作状态
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (novelId) {
      loadNovel();
      loadNextChapterNum();
    }
  }, [novelId]);

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
          // 获取最新章节号+1
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
            if (data) {
              generatedText += data;
              setContent(generatedText);
            }
          }
        }
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoadingNovel) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="ml-4 text-gray-600">加载中...</p>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 顶部导航 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              返回
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">新建章节</span>
          </div>
        </div>

        <form onSubmit={handleCreate}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* 主编辑区 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardBody>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
                        <Plus className="text-white" size={24} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold gradient-text">新建章节</h1>
                        {novel && (
                          <p className="text-sm text-gray-600">作品：{novel.title}</p>
                        )}
                      </div>
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

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        章节序号
                      </label>
                      <Input
                        type="number"
                        value={chapterNum}
                        onChange={(e) => setChapterNum(parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        章节标题 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="例如：第1章 惊天奇遇"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        章节内容 <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="开始创作你的章节内容..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={20}
                        className="min-h-[500px] font-mono text-base leading-relaxed"
                        required
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowFileUpload(!showFileUpload)}
                          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus size={16} />
                          {showFileUpload ? '隐藏' : '显示'}文件导入
                        </button>
                        {importedFilename && (
                          <span className="text-sm text-green-600">
                            ✓ 已导入: {importedFilename}
                          </span>
                        )}
                      </div>
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

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="published"
                        className="text-sm text-gray-700"
                      >
                        立即发布
                      </label>
                    </div>

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
                        variant="secondary"
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
              {/* AI工具 */}
              <Card>
                <CardBody>
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <Sparkles size={20} className="text-purple-600" />
                    AI写作助手
                  </h3>

                  <div className="space-y-4">
                    <Textarea
                      placeholder="输入写作提示，例如：主角在修炼中突破..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                    />
                    <Textarea
                      placeholder="故事背景（可选）"
                      value={storyContext}
                      onChange={(e) => setStoryContext(e.target.value)}
                      rows={3}
                    />
                    <Textarea
                      placeholder="角色信息（可选）"
                      value={characterInfo}
                      onChange={(e) => setCharacterInfo(e.target.value)}
                      rows={2}
                    />
                    <Textarea
                      placeholder="剧情大纲（可选）"
                      value={plotOutline}
                      onChange={(e) => setPlotOutline(e.target.value)}
                      rows={2}
                    />
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        生成字数
                      </label>
                      <select
                        value={wordCount.toString()}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWordCount(parseInt(e.target.value))}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="1000">1000字</option>
                        <option value="2000">2000字</option>
                        <option value="2500">2500字</option>
                        <option value="3000">3000字</option>
                        <option value="5000">5000字</option>
                      </select>
                    </div>
                    <GradientButton
                      fullWidth
                      icon={<Sparkles size={18} />}
                      onClick={handleAIGenerate}
                      isLoading={isGenerating}
                    >
                      AI生成内容
                    </GradientButton>
                  </div>
                </CardBody>
              </Card>

              {/* 创建提示 */}
              <Card>
                <CardBody>
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <FileText size={20} className="text-indigo-600" />
                    创建提示
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 章节序号将自动递增</p>
                    <p>• 标题建议使用"第X章 标题"格式</p>
                    <p>• 字数建议2000-3000字</p>
                    <p>• 内容会自动保存到草稿</p>
                    <p>• 可使用AI助手快速生成</p>
                  </div>
                </CardBody>
              </Card>

              {/* 快捷操作 */}
              <Card>
                <CardBody>
                  <h3 className="mb-4 font-bold text-gray-900">快捷操作</h3>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => router.push(`/novel/${novelId}`)}
                    >
                      返回作品详情
                    </Button>
                    <Button
                      variant="secondary"
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
        </form>
      </div>
    </div>
  );
}
