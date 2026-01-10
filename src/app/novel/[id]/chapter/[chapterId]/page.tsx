'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Loader2, FileText, Clock, Star, Target, Flame, Eye, Copy, Download, Trash2, CheckCircle, AlertCircle, BarChart3, Zap } from 'lucide-react';
import { BrandIcons } from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import { exportAsWord, exportAsTxt } from '@/lib/fileUtils';

interface Novel {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  novelId: string;
  chapterNum: number;
  title: string;
  content: string;
  wordCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContentStats {
  wordCount: number;
  qualityScore: number;
  completionRate: number;
  shuangdianCount: number;
  estimatedReadTime: number;
}

export default function ChapterEditorPage() {
  const router = useRouter();
  const params = useParams();
  const novelId = params.id as string;
  const chapterId = params.chapterId as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // AI生成相关
  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState(2500);
  const [storyContext, setStoryContext] = useState('');
  const [characterInfo, setCharacterInfo] = useState('');
  const [plotOutline, setPlotOutline] = useState('');

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

  // 加载章节信息
  useEffect(() => {
    if (chapterId && novelId) {
      loadChapter();
      loadNovel();
    }
  }, [chapterId, novelId]);

  // 自动保存（debounce）
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 30000); // 30秒后自动保存

    return () => clearTimeout(timer);
  }, [title, content, hasChanges]);

  const loadChapter = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chapters/${chapterId}`);
      if (!response.ok) {
        throw new Error('加载章节失败');
      }

      const result = await response.json();
      if (result.success && result.data) {
        const ch = result.data;
        setChapter(ch);
        setTitle(ch.title);
        setContent(ch.content);
        setIsPublished(ch.isPublished);
        setContentStats(calculateContentStats(ch.content));
        setHasChanges(false);
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('加载章节失败:', error);
      alert('加载章节失败，请刷新重试');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNovel = async () => {
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
    }
  };

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

  const handleSave = async (autoSave = false) => {
    if (!title.trim() || !content.trim()) {
      if (!autoSave) {
        alert('标题和内容不能为空');
      }
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content,
          wordCount: content.length,
          isPublished,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存章节失败');
      }

      const result = await response.json();
      if (result.success) {
        setHasChanges(false);
        setSaveStatus('saved');
        if (!autoSave) {
          alert('章节保存成功！');
          loadChapter(); // 重新加载以更新updatedAt
        }
      } else {
        throw new Error(result.error || '保存章节失败');
      }
    } catch (error) {
      console.error('保存章节失败:', error);
      setSaveStatus('unsaved');
      if (!autoSave) {
        alert(error instanceof Error ? error.message : '保存失败，请稍后重试');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async () => {
    await handleSave(true);
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个章节吗？此操作不可恢复！')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '删除章节失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('章节删除成功！');
        router.push(`/novel/${novelId}`);
      } else {
        throw new Error(result.error || '删除章节失败');
      }
    } catch (error) {
      console.error('删除章节失败:', error);
      alert(error instanceof Error ? error.message : '删除失败，请稍后重试');
    } finally {
      setIsDeleting(false);
    }
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
              setContentStats(calculateContentStats(generatedText));
            }
          }
        }
      }

      setHasChanges(true);
      setSaveStatus('unsaved');
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIPolish = async () => {
    if (!content.trim()) {
      alert('请先输入要润色的内容');
      return;
    }

    setIsPolishing(true);
    try {
      const response = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          style: 'tomato',
        }),
      });

      if (!response.ok) {
        throw new Error('AI润色失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let polishedText = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;

        const lines = accumulatedText.split('\n');
        accumulatedText = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]' || data === '[OPTIMIZED]') {
              continue;
            }
            if (data) {
              polishedText += data;
              setContent(polishedText);
              setContentStats(calculateContentStats(polishedText));
            }
          }
        }
      }

      setHasChanges(true);
      setSaveStatus('unsaved');
    } catch (error) {
      console.error('AI润色失败:', error);
      alert('AI润色失败，请稍后重试');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleAIContinue = async () => {
    if (!content.trim()) {
      alert('请先输入一些内容作为续写的上下文');
      return;
    }

    setIsContinuing(true);
    try {
      const response = await fetch('/api/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          storyContext,
          characterInfo,
          plotOutline,
          wordCount: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('AI续写失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let continuedText = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;

        const lines = accumulatedText.split('\n');
        accumulatedText = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]' || data === '[OPTIMIZED]') {
              continue;
            }
            if (data) {
              continuedText += data;
              setContent(content + continuedText);
              setContentStats(calculateContentStats(content + continuedText));
            }
          }
        }
      }

      setHasChanges(true);
      setSaveStatus('unsaved');
    } catch (error) {
      console.error('AI续写失败:', error);
      alert('AI续写失败，请稍后重试');
    } finally {
      setIsContinuing(false);
    }
  };

  const handleExportWord = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请先填写标题和内容');
      return;
    }

    try {
      await exportAsWord(content, `${title}.docx`);
      alert('Word文档导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    }
    setShowExportMenu(false);
  };

  const handleExportTxt = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请先填写标题和内容');
      return;
    }

    try {
      await exportAsTxt(content, `${title}.txt`);
      alert('TXT文档导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    }
    setShowExportMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('内容已复制到剪贴板！');
  };

  if (isLoading) {
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
            <Link
              href={`/novel/${novelId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              返回作品详情
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {chapter?.chapterNum}. {title || '未命名章节'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={16} />
                  已保存
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-sm text-indigo-600">
                  <Loader2 size={16} className="animate-spin" />
                  保存中...
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="flex items-center gap-1 text-sm text-orange-600">
                  <AlertCircle size={16} />
                  未保存
                </span>
              )}
            </div>

            <div className="relative" ref={exportMenuRef}>
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={16} />}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                导出
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100">
                  <button
                    onClick={handleExportWord}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    导出为 Word
                  </button>
                  <button
                    onClick={handleExportTxt}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    导出为 TXT
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Copy size={16} />}
              onClick={handleCopy}
            >
              复制
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Save size={16} />}
              onClick={() => handleSave()}
              isLoading={isSaving}
            >
              保存
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              删除
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* 主编辑区 */}
          <div className="lg:col-span-2">
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <Input
                    placeholder="章节标题"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setHasChanges(true);
                      setSaveStatus('unsaved');
                    }}
                  />

                  <Textarea
                    placeholder="开始创作你的章节内容..."
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setHasChanges(true);
                      setSaveStatus('unsaved');
                      setContentStats(calculateContentStats(e.target.value));
                    }}
                    rows={20}
                    className="min-h-[500px] font-mono text-base leading-relaxed"
                  />
                </div>
              </CardBody>
            </Card>

            {/* 内容统计卡片 */}
            {contentStats && (
              <Card className="mt-6">
                <CardBody>
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <BarChart3 size={20} className="text-indigo-600" />
                    内容统计
                  </h3>
                  <div className="grid gap-4 md:grid-cols-5">
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {contentStats.wordCount}
                      </div>
                      <div className="text-sm text-gray-600">字数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {contentStats.qualityScore}
                      </div>
                      <div className="text-sm text-gray-600">质量评分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {contentStats.completionRate}%
                      </div>
                      <div className="text-sm text-gray-600">完读率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {contentStats.shuangdianCount}
                      </div>
                      <div className="text-sm text-gray-600">爽点数量</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {Math.round(contentStats.estimatedReadTime / 60)}
                      </div>
                      <div className="text-sm text-gray-600">阅读时长(分)</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
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

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="write">撰写</TabsTrigger>
                    <TabsTrigger value="polish">润色</TabsTrigger>
                    <TabsTrigger value="continue">续写</TabsTrigger>
                  </TabsList>

                  <TabsContent value="write">
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
                      <Select
                        label="生成字数"
                        fullWidth
                        options={[
                          { value: '1000', label: '1000字' },
                          { value: '2000', label: '2000字' },
                          { value: '2500', label: '2500字' },
                          { value: '3000', label: '3000字' },
                          { value: '5000', label: '5000字' },
                        ]}
                        value={wordCount.toString()}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWordCount(parseInt(e.target.value))}
                      />
                      <GradientButton
                        fullWidth
                        icon={<Sparkles size={18} />}
                        onClick={handleAIGenerate}
                        isLoading={isGenerating}
                      >
                        AI生成
                      </GradientButton>
                    </div>
                  </TabsContent>

                  <TabsContent value="polish">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        智能润色将优化语言表达，提升内容的流畅性和可读性。
                      </p>
                      <GradientButton
                        fullWidth
                        icon={<Sparkles size={18} />}
                        onClick={handleAIPolish}
                        isLoading={isPolishing}
                      >
                        AI润色
                      </GradientButton>
                    </div>
                  </TabsContent>

                  <TabsContent value="continue">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        基于当前内容智能续写，保持剧情连贯性和风格一致。
                      </p>
                      <Textarea
                        placeholder="续写提示（可选）"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                      />
                      <GradientButton
                        fullWidth
                        icon={<Sparkles size={18} />}
                        onClick={handleAIContinue}
                        isLoading={isContinuing}
                      >
                        AI续写
                      </GradientButton>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardBody>
            </Card>

            {/* 章节信息 */}
            {chapter && (
              <Card>
                <CardBody>
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <FileText size={20} className="text-indigo-600" />
                    章节信息
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">章节序号</span>
                      <span className="font-medium text-gray-900">
                        第 {chapter.chapterNum} 章
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">字数</span>
                      <span className="font-medium text-gray-900">
                        {chapter.wordCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">状态</span>
                      <Badge variant={isPublished ? 'success' : 'warning'}>
                        {isPublished ? '已发布' : '草稿'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">创建时间</span>
                      <span className="font-medium text-gray-900">
                        {new Date(chapter.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">更新时间</span>
                      <span className="font-medium text-gray-900">
                        {new Date(chapter.updatedAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* 快捷操作 */}
            <Card>
              <CardBody>
                <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                  <Zap size={20} className="text-orange-600" />
                  快捷操作
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleSave()}
                  >
                    手动保存
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setIsPublished(!isPublished)}
                  >
                    {isPublished ? '设为草稿' : '发布章节'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={handleCopy}
                  >
                    复制全文
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
