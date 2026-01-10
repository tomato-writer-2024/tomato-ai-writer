'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, Lightbulb, Sparkles, Crown, Star, Copy, Download, RefreshCw, Zap, Target, AlertCircle, ArrowRight, Brain, BookOpen } from 'lucide-react';

interface BlockDiagnosis {
  blockType: string;
  description: string;
  causes: string[];
  solutions: Array<{
    step: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  inspirationTriggers: string[];
  recoveryPlan: string[];
  estimatedRecoveryTime: string;
}

export default function WriterBlockPage() {
  const [blockDescription, setBlockDescription] = useState('');
  const [blockType, setBlockType] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<BlockDiagnosis | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const blockTypes = [
    { value: 'plot', label: '剧情卡点' },
    { value: 'character', label: '角色决策' },
    { value: 'dialogue', label: '对话障碍' },
    { value: 'motivation', label: '动机缺失' },
    { value: 'structure', label: '结构混乱' },
    { value: 'pacing', label: '节奏问题' },
    { value: 'ending', label: '结局困境' },
    { value: 'inspiration', label: '灵感枯竭' },
  ];

  const handleDiagnose = async () => {
    if (!blockDescription.trim()) {
      alert('请描述卡文情况');
      return;
    }

    setIsDiagnosing(true);
    setDiagnosis(null);

    try {
      const response = await fetch('/api/writer-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockDescription,
          blockType,
          currentContent: currentContent || '无当前内容',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '诊断失败');
      }

      const result = await response.json();
      if (result.success) {
        setDiagnosis(result.data);
      } else {
        throw new Error(result.error || '诊断失败');
      }
    } catch (error) {
      console.error('诊断失败:', error);
      alert(error instanceof Error ? error.message : '诊断失败，请稍后重试');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板');
  };

  const handleExport = async () => {
    if (!diagnosis) {
      alert('没有内容可导出');
      return;
    }

    setIsExporting(true);
    try {
      const content = `卡文诊断报告\n\n` +
        `卡文类型：${blockTypes.find(t => t.value === diagnosis.blockType)?.label}\n` +
        `问题描述：\n${diagnosis.description}\n\n` +
        `可能原因：\n${diagnosis.causes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n` +
        `解决方案：\n${diagnosis.solutions.map(s => `[${s.priority.toUpperCase()}] ${s.step}\n  ${s.action}`).join('\n\n')}\n\n` +
        `灵感触发器：\n${diagnosis.inspirationTriggers.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n` +
        `恢复计划：\n${diagnosis.recoveryPlan.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n` +
        `预计恢复时间：${diagnosis.estimatedRecoveryTime}`;

      const filename = '卡文诊断报告';

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Lightbulb className="w-8 h-8" />
            卡文诊断助手
          </h1>
          <p className="mt-2 text-gray-600">
            AI诊断卡文原因，提供个性化解决方案，助你突破创作瓶颈
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
                      卡文类型
                    </label>
                    <Select
                      value={blockType}
                      onChange={(value) => setBlockType(value as any)}
                      placeholder="请选择卡文类型"
                      options={blockTypes.map(t => ({ value: t.value, label: t.label }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      卡文情况描述
                    </label>
                    <Textarea
                      value={blockDescription}
                      onChange={(e) => setBlockDescription(e.target.value)}
                      placeholder="请详细描述你遇到的卡文情况，比如写到哪里卡住了，有什么困惑..."
                      className="min-h-[150px] w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      当前内容（可选）
                    </label>
                    <Textarea
                      value={currentContent}
                      onChange={(e) => setCurrentContent(e.target.value)}
                      placeholder="可以贴上当前写的内容，帮助AI更准确地诊断..."
                      className="min-h-[100px] w-full"
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleDiagnose}
                    disabled={isDiagnosing}
                    icon={isDiagnosing ? <Loader2 className="animate-spin" size={20} /> : <Brain size={20} />}
                  >
                    {isDiagnosing ? '诊断中...' : '开始诊断'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 卡文类型说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-cyan-600" />
                  常见卡文类型
                </h3>
                <div className="space-y-2">
                  {blockTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        blockType === type.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setBlockType(type.value)}
                    >
                      <div className="font-semibold text-gray-900">{type.label}</div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-6">
            {diagnosis && (
              <>
                {/* 诊断结果 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-cyan-600" />
                        诊断结果
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Copy size={16} />}
                          onClick={() => handleCopy(JSON.stringify(diagnosis, null, 2))}
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
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">问题描述</h4>
                        <p className="text-gray-700 leading-relaxed">{diagnosis.description}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">可能原因</h4>
                        <div className="space-y-2">
                          {diagnosis.causes.map((cause, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-cyan-600 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{cause}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">解决方案</h4>
                        <div className="space-y-3">
                          {diagnosis.solutions.map((solution, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(solution.priority)}`}>
                              <div className="font-semibold text-sm mb-1">{solution.step}</div>
                              <p className="text-sm opacity-80">{solution.action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 灵感触发器 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      灵感触发器
                    </h4>
                    <div className="space-y-2">
                      {diagnosis.inspirationTriggers.map((trigger, index) => (
                        <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                          <div className="flex items-start gap-2">
                            <Sparkles size={16} className="text-yellow-600 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{trigger}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* 恢复计划 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-cyan-600" />
                      恢复计划
                    </h4>
                    <div className="space-y-3">
                      {diagnosis.recoveryPlan.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 pt-0.5">
                            <span className="text-gray-700">{step}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 text-center">
                      <div className="text-sm text-blue-800">
                        <BookOpen className="inline w-4 h-4 mr-1" />
                        预计恢复时间：<span className="font-semibold">{diagnosis.estimatedRecoveryTime}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {!diagnosis && !isDiagnosing && (
              <Card>
                <CardBody className="py-16 text-center">
                  <Lightbulb size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待诊断
                  </h3>
                  <p className="text-gray-600">
                    描述你的卡文情况，AI将为你分析原因并提供解决方案
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
