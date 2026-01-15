'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, Flag, Sparkles, Crown, Star, Copy, Download, RefreshCw, Zap, Target, BookOpen, Heart, Award, CheckCircle2 } from 'lucide-react';

interface EndingResult {
  endingType: string;
  endingContent: string;
  themes: string[];
  foreshadowing: Array<{
    location: string;
    content: string;
    explanation: string;
  }>;
  climax: string;
  emotionalImpact: number;
  readerSatisfaction: number;
  characterArcs: Array<{
    character: string;
    arc: string;
    resolution: string;
  }>;
  alternatives: Array<{
    type: string;
    content: string;
    impact: string;
  }>;
}

export default function EndingGeneratorPage() {
  const [storySummary, setStorySummary] = useState('');
  const [endingType, setEndingType] = useState('');
  const [mainThemes, setMainThemes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<EndingResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const endingTypes = [
    { value: 'happy', label: '大团圆', desc: '所有角色获得幸福结局' },
    { value: 'tragic', label: '悲剧', desc: '主角或重要角色牺牲' },
    { value: 'bittersweet', label: '苦乐参半', desc: '有得有失，现实感强' },
    { value: 'open', label: '开放式', desc: '留有想象空间' },
    { value: 'surprise', label: '意外结局', desc: '出人意料但合情合理' },
    { value: 'catharsis', label: '宣泄式', desc: '情感释放，解脱感强' },
    { value: 'circular', label: '循环式', desc: '首尾呼应，回归起点' },
    { value: 'ambiguous', label: '模糊式', desc: '多重解读，神秘感' },
  ];

  const handleGenerate = async () => {
    if (!storySummary.trim()) {
      alert('请输入故事梗概');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/ending-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storySummary,
          endingType,
          mainThemes: mainThemes || '无特定主题',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || '生成失败');
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

  const handleExport = async (exportContent: string) => {
    if (!exportContent.trim()) {
      alert('没有内容可导出');
      return;
    }

    setIsExporting(true);
    try {
      const filename = `结局生成_${endingTypes.find(t => t.value === result?.endingType)?.label || '生成'}`;

      const response = await fetch('/api/files/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: exportContent,
          format: 'txt',
          filename,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '导出失败');
      }

      const data = await response.json();
      if (data.success && data.data.url) {
        window.open(data.data.url, '_blank');
        alert('导出成功！');
      } else {
        throw new Error(data.error || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsExporting(false);
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 80) return 'bg-red-500';
    if (impact >= 60) return 'bg-orange-500';
    if (impact >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Flag className="w-8 h-8" />
            智能结局生成
          </h1>
          <p className="mt-2 text-gray-600">
            生成完美的结局，为你的故事画上圆满句号
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
                      故事梗概
                    </label>
                    <Textarea
                      value={storySummary}
                      onChange={(e) => setStorySummary(e.target.value)}
                      placeholder="请输入故事梗概，包括主要角色、核心冲突、故事进展..."
                      className="min-h-[200px] w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      结局类型
                    </label>
                    <Select
                      value={endingType}
                      onChange={(value) => setEndingType(value as any)}
                      placeholder="请选择结局类型"
                      options={endingTypes.map(t => ({ value: t.value, label: t.label }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主要主题（可选）
                    </label>
                    <Textarea
                      value={mainThemes}
                      onChange={(e) => setMainThemes(e.target.value)}
                      placeholder="请描述故事的主题思想，比如：成长、友情、爱情、正义等..."
                      className="min-h-[80px] w-full"
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isGenerating ? '生成中...' : '生成结局'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 结局类型说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-600" />
                  结局类型说明
                </h3>
                <div className="space-y-2">
                  {endingTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        endingType === type.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setEndingType(type.value)}
                    >
                      <div className="font-semibold text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.desc}</div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-6">
            {result && (
              <>
                {/* 评分卡片 */}
                <Card>
                  <CardBody>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">结局评估</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 text-center">
                        <div className="text-3xl font-bold text-cyan-600 mb-1">
                          {result.emotionalImpact}
                        </div>
                        <div className="text-sm text-gray-600">情感冲击</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {result.readerSatisfaction}
                        </div>
                        <div className="text-sm text-gray-600">读者满意度</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">主题元素</div>
                      <div className="flex flex-wrap gap-2">
                        {result.themes.map((theme, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 结局内容 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Flag className="w-5 h-5 text-cyan-600" />
                        结局内容
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Copy size={16} />}
                          onClick={() => handleCopy(result.endingContent)}
                        >
                          复制
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Download size={16} />}
                          onClick={() => handleExport(result.endingContent)}
                          disabled={isExporting}
                        >
                          {isExporting ? '导出中...' : '导出'}
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 max-h-80 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {result.endingContent}
                      </pre>
                    </div>
                  </CardBody>
                </Card>

                {/* 高潮描写 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-600" />
                      高潮描写
                    </h4>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {result.climax}
                      </pre>
                    </div>
                  </CardBody>
                </Card>

                {/* 角色结局 */}
                {result.characterArcs.length > 0 && (
                  <Card>
                    <CardBody>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-cyan-600" />
                        角色结局 ({result.characterArcs.length})
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {result.characterArcs.map((arc, index) => (
                          <div key={index} className="p-3 rounded-lg bg-gray-50">
                            <div className="font-semibold text-gray-900 mb-1">{arc.character}</div>
                            <div className="text-sm text-gray-700 mb-1">{arc.arc}</div>
                            <div className="text-xs text-cyan-600">{arc.resolution}</div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* 伏笔回收 */}
                {result.foreshadowing.length > 0 && (
                  <Card>
                    <CardBody>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-600" />
                        伏笔回收 ({result.foreshadowing.length})
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {result.foreshadowing.map((foreshadow, index) => (
                          <div key={index} className="p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {foreshadow.location}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{foreshadow.content}</p>
                            <p className="text-xs text-cyan-600">{foreshadow.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* 替代方案 */}
                {result.alternatives.length > 0 && (
                  <Card>
                    <CardBody>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-cyan-600" />
                        替代方案 ({result.alternatives.length})
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {result.alternatives.map((alt, index) => (
                          <div key={index} className="p-3 rounded-lg bg-gray-50">
                            <div className="font-semibold text-gray-900 text-sm mb-1">
                              {alt.type}
                            </div>
                            <div className="text-xs text-gray-600 mb-1">{alt.content}</div>
                            <div className="text-xs text-cyan-600">{alt.impact}</div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </>
            )}

            {!result && !isGenerating && (
              <Card>
                <CardBody className="py-16 text-center">
                  <Flag size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待生成结局
                  </h3>
                  <p className="text-gray-600">
                    输入故事梗概，AI将为你生成完美的结局
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
