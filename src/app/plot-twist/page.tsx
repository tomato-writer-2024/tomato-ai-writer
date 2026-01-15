'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, RefreshCw, Sparkles, Crown, Star, Copy, Download, Zap, Target, BookOpen, Lightbulb, ArrowRight, Flame, CheckCircle2, AlertCircle } from 'lucide-react';

interface PlotTwistResult {
  originalPlot: string;
  twistedPlot: string;
  twistType: string;
  twistDescription: string;
  setup: Array<{
    location: string;
    content: string;
    hintLevel: 'obvious' | 'subtle' | 'hidden';
  }>;
  payoff: {
    location: string;
    content: string;
    impactLevel: number;
  };
  logicCheck: {
    isConsistent: boolean;
    issues: string[];
  };
  alternatives: Array<{
    type: string;
    description: string;
    impact: string;
  }>;
}

export default function PlotTwistPage() {
  const [currentPlot, setCurrentPlot] = useState('');
  const [twistType, setTwistType] = useState('');
  const [storyContext, setStoryContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PlotTwistResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const twistTypes = [
    { value: 'identity', label: '身份反转', desc: '角色的真实身份被揭示' },
    { value: 'betrayal', label: '盟友背叛', desc: '信任的人突然成为敌人' },
    { value: 'enemy_ally', label: '敌人结盟', desc: '敌人之间形成联盟' },
    { value: 'power_shift', label: '实力逆转', desc: '弱者突然变强，强者变弱' },
    { value: 'truth', label: '真相揭露', desc: '隐藏的真相被揭开' },
    { value: 'timeline', label: '时间诡计', desc: '利用时间线制造的错觉' },
    { value: 'memory', label: '记忆篡改', desc: '角色的记忆是虚假的' },
    { value: 'motivation', label: '动机反转', desc: '角色的真实动机被揭示' },
    { value: 'survival', label: '生死反转', desc: '被认为死去的角色归来' },
    { value: 'relationship', label: '关系反转', desc: '角色之间的关系被重新定义' },
  ];

  const handleGenerate = async () => {
    if (!currentPlot.trim()) {
      alert('请输入当前剧情');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/plot-twist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlot,
          twistType,
          storyContext: storyContext || '无额外背景信息',
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
      const filename = `情节反转_${result?.twistType || '生成'}`;

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

  const getHintLevelColor = (level: string) => {
    switch (level) {
      case 'obvious': return 'bg-red-500';
      case 'subtle': return 'bg-yellow-500';
      case 'hidden': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactLevelColor = (level: number) => {
    if (level >= 8) return 'bg-red-500';
    if (level >= 6) return 'bg-orange-500';
    if (level >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <RefreshCw className="w-8 h-8" />
            情节反转建议器
          </h1>
          <p className="mt-2 text-gray-600">
            生成精彩的情节反转，为你的故事制造意外和震撼
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
                      当前剧情
                    </label>
                    <Textarea
                      value={currentPlot}
                      onChange={(e) => setCurrentPlot(e.target.value)}
                      placeholder="请输入当前剧情内容，AI将基于此生成反转..."
                      className="min-h-[200px] w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      反转类型
                    </label>
                    <Select
                      value={twistType}
                      onChange={(value) => setTwistType(value as any)}
                      placeholder="请选择反转类型"
                      options={twistTypes.map(t => ({ value: t.value, label: t.label }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      故事背景（可选）
                    </label>
                    <Textarea
                      value={storyContext}
                      onChange={(e) => setStoryContext(e.target.value)}
                      placeholder="请描述故事背景、角色设定等..."
                      className="min-h-[100px] w-full"
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isGenerating ? '生成中...' : '生成反转'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 反转类型说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-cyan-600" />
                  反转类型说明
                </h3>
                <div className="space-y-2">
                  {twistTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        twistType === type.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setTwistType(type.value)}
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
                {/* 反转结果 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-cyan-600" />
                        反转结果
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Copy size={16} />}
                          onClick={() => handleCopy(result.twistedPlot)}
                        >
                          复制
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Download size={16} />}
                          onClick={() => handleExport(result.twistedPlot)}
                          disabled={isExporting}
                        >
                          {isExporting ? '导出中...' : '导出'}
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Badge variant="secondary" className="mb-2">{twistTypes.find(t => t.value === result.twistType)?.label}</Badge>
                      <p className="text-gray-700">{result.twistDescription}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">反转后剧情</h4>
                      <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                          {result.twistedPlot}
                        </pre>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 铺垫设计 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-cyan-600" />
                      铺垫设计 ({result.setup.length})
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {result.setup.map((setup, index) => (
                        <div key={index} className="p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {setup.location}
                              </Badge>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${getHintLevelColor(setup.hintLevel)}`} />
                          </div>
                          <p className="text-sm text-gray-700">{setup.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* 揭晓时刻 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-600" />
                      揭晓时刻
                    </h4>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {result.payoff.location}
                        </Badge>
                        <div className={`w-24 h-2 rounded-full ${getImpactLevelColor(result.payoff.impactLevel)}`} />
                      </div>
                      <p className="text-sm text-gray-700">{result.payoff.content}</p>
                    </div>
                  </CardBody>
                </Card>

                {/* 逻辑检查 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-600" />
                      逻辑检查
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {result.logicCheck.isConsistent ? (
                          <CheckCircle2 className="text-green-600" size={20} />
                        ) : (
                          <AlertCircle className="text-red-600" size={20} />
                        )}
                        <span className="text-sm text-gray-700">
                          {result.logicCheck.isConsistent ? '逻辑自洽' : '存在逻辑问题'}
                        </span>
                      </div>
                      {result.logicCheck.issues.length > 0 && (
                        <div className="space-y-1">
                          {result.logicCheck.issues.map((issue, index) => (
                            <div key={index} className="text-sm text-red-600 flex items-start gap-2">
                              <ArrowRight size={14} className="mt-0.5 flex-shrink-0" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* 替代方案 */}
                {result.alternatives.length > 0 && (
                  <Card>
                    <CardBody>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-cyan-600" />
                        替代方案 ({result.alternatives.length})
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {result.alternatives.map((alt, index) => (
                          <div key={index} className="p-3 rounded-lg bg-gray-50">
                            <div className="font-semibold text-gray-900 text-sm mb-1">
                              {alt.type}
                            </div>
                            <div className="text-xs text-gray-600 mb-1">{alt.description}</div>
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
                  <RefreshCw size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待生成反转
                  </h3>
                  <p className="text-gray-600">
                    输入当前剧情，AI将为你生成精彩的情节反转
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
