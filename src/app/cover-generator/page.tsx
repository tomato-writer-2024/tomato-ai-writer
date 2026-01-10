'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, Image, Sparkles, Crown, Star, Copy, RefreshCw, Zap, Target, Palette, Camera, Download } from 'lucide-react';

interface CoverDescription {
  title: string;
  description: string;
  style: string;
  colorScheme: string[];
  elements: Array<{
    type: string;
    description: string;
    position: string;
  }>;
  mood: string;
  targetAudience: string;
  aiPrompt: string;
  alternatives: Array<{
    style: string;
    description: string;
  }>;
}

export default function CoverGeneratorPage() {
  const [novelTitle, setNovelTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [coverStyle, setCoverStyle] = useState('');
  const [storyMood, setStoryMood] = useState('');
  const [keyElements, setKeyElements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState<CoverDescription | null>(null);
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

  const coverStyles = [
    { value: 'realistic', label: '写实风', desc: '真实质感，细节丰富' },
    { value: 'illustration', label: '插画风', desc: '绘画风格，艺术性强' },
    { value: 'anime', label: '动漫风', desc: '二次元风格，年轻化' },
    { value: 'minimalist', label: '极简风', desc: '简约设计，留白意境' },
    { value: 'abstract', label: '抽象风', desc: '抽象表达，意境深远' },
    { value: 'cinematic', label: '电影风', desc: '电影质感，场景宏大' },
    { value: 'watercolor', label: '水彩风', desc: '水彩晕染，柔和唯美' },
    { value: 'digital', label: '数字艺术', desc: '数字绘画，科技感强' },
    { value: 'ink', label: '水墨风', desc: '传统水墨，国风浓郁' },
    { value: 'glitch', label: '故障风', desc: '故障艺术，前卫时尚' },
  ];

  const handleGenerate = async () => {
    if (!novelTitle.trim()) {
      alert('请输入小说标题');
      return;
    }

    setIsGenerating(true);
    setDescription(null);

    try {
      const response = await fetch('/api/cover-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelTitle,
          genre,
          coverStyle,
          storyMood: storyMood || '无特定氛围',
          keyElements: keyElements || '无特定元素',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const result = await response.json();
      if (result.success) {
        setDescription(result.data);
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
    if (!description) {
      alert('没有内容可导出');
      return;
    }

    setIsExporting(true);
    try {
      const content = `封面设计方案\n\n` +
        `书名：${description.title}\n\n` +
        `风格：${coverStyles.find(s => s.value === description.style)?.label}\n\n` +
        `描述：\n${description.description}\n\n` +
        `色彩方案：\n${description.colorScheme.map(c => `  • ${c}`).join('\n')}\n\n` +
        `核心元素：\n${description.elements.map(e => `  • ${e.type}: ${e.description} (${e.position})`).join('\n')}\n\n` +
        `氛围：${description.mood}\n` +
        `目标读者：${description.targetAudience}\n\n` +
        `AI绘画提示词：\n${description.aiPrompt}`;

      const filename = `封面描述_${description.title}`;

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
            <Image className="w-8 h-8" />
            封面描述生成器
          </h1>
          <p className="mt-2 text-gray-600">
            生成专业封面描述和AI绘画提示词，打造吸睛封面
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
                      icon={<Image size={20} />}
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
                        封面风格
                      </label>
                      <Select
                        value={coverStyle}
                        onChange={(value) => setCoverStyle(value as any)}
                        placeholder="请选择风格"
                        options={coverStyles.map(s => ({ value: s.value, label: s.label }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      故事氛围（可选）
                    </label>
                    <Textarea
                      value={storyMood}
                      onChange={(e) => setStoryMood(e.target.value)}
                      placeholder="请描述故事氛围，比如：紧张刺激、温馨治愈、神秘悬疑..."
                      className="min-h-[80px] w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      核心元素（可选）
                    </label>
                    <Textarea
                      value={keyElements}
                      onChange={(e) => setKeyElements(e.target.value)}
                      placeholder="请描述希望在封面上体现的核心元素，比如：主角形象、关键道具、背景场景..."
                      className="min-h-[80px] w-full"
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isGenerating ? '生成中...' : '生成封面描述'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 封面风格说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cyan-600" />
                  封面风格说明
                </h3>
                <div className="space-y-2">
                  {coverStyles.map((style) => (
                    <div
                      key={style.value}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        coverStyle === style.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setCoverStyle(style.value)}
                    >
                      <div className="font-semibold text-gray-900">{style.label}</div>
                      <div className="text-sm text-gray-600">{style.desc}</div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-6">
            {description && (
              <>
                {/* 操作按钮 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-cyan-600" />
                        封面描述生成完成
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Copy size={16} />}
                          onClick={() => handleCopy(description.aiPrompt)}
                        >
                          复制提示词
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
                  </CardBody>
                </Card>

                {/* 封面描述 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Image className="w-5 h-5 text-cyan-600" />
                      封面描述
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                        <div className="text-xl font-bold text-gray-900 mb-2">
                          {description.title}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">
                            {coverStyles.find(s => s.value === description.style)?.label}
                          </Badge>
                          <Badge variant="secondary">{description.mood}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {description.description}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">色彩方案</h5>
                        <div className="flex flex-wrap gap-2">
                          {description.colorScheme.map((color, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">核心元素</h5>
                        <div className="space-y-2">
                          {description.elements.map((element, index) => (
                            <div key={index} className="p-3 rounded-lg bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {element.type}
                                  </div>
                                  <div className="text-xs text-gray-600">{element.description}</div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {element.position}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* AI绘画提示词 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-600" />
                      AI绘画提示词
                    </h4>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans max-h-80 overflow-y-auto">
                        {description.aiPrompt}
                      </pre>
                    </div>
                  </CardBody>
                </Card>

                {/* 替代方案 */}
                {description.alternatives.length > 0 && (
                  <Card>
                    <CardBody>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-cyan-600" />
                        替代方案 ({description.alternatives.length})
                      </h4>
                      <div className="space-y-3">
                        {description.alternatives.map((alt, index) => (
                          <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors">
                            <div className="font-semibold text-gray-900 mb-1">{alt.style}</div>
                            <div className="text-sm text-gray-600">{alt.description}</div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </>
            )}

            {!description && !isGenerating && (
              <Card>
                <CardBody className="py-16 text-center">
                  <Image size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待生成封面描述
                  </h3>
                  <p className="text-gray-600">
                    输入小说信息，AI将为你生成专业的封面描述和AI绘画提示词
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
