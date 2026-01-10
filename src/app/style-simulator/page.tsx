'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, BookOpen, Sparkles, Crown, Star, Copy, Download, RefreshCw, Zap, Target, PenTool, Feather } from 'lucide-react';

interface StyleResult {
  originalContent: string;
  simulatedContent: string;
  styleName: string;
  styleCharacteristics: string[];
  changes: Array<{
    original: string;
    changed: string;
    reason: string;
  }>;
  styleMetrics: {
    vocabulary: number;
    sentenceLength: number;
    tone: string;
    complexity: number;
  };
}

export default function StyleSimulatorPage() {
  const [content, setContent] = useState('');
  const [style, setStyle] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<StyleResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const styles = [
    { value: 'jinyong', label: '金庸', desc: '古朴厚重，武侠宗师' },
    { value: 'gulong', label: '古龙', desc: '短句精炼，意境深远' },
    { value: 'luxun', label: '鲁迅', desc: '犀利深刻，笔锋锐利' },
    { value: 'qiongyao', label: '琼瑶', desc: '柔情似水，唯美浪漫' },
    { value: 'mo', label: '莫言', desc: '魔幻现实，乡土气息' },
    { value: 'murakami', label: '村上春树', desc: '都市疏离，寓言色彩' },
    { value: 'rowling', label: 'J.K.罗琳', desc: '奇幻冒险，英式幽默' },
    { value: 'tolkien', label: '托尔金', desc: '史诗宏大，诗意语言' },
  ];

  const handleSimulate = async () => {
    if (!content.trim()) {
      alert('请输入需要模拟的内容');
      return;
    }

    if (style === 'custom' && !customStyle.trim()) {
      alert('请输入自定义风格描述');
      return;
    }

    setIsSimulating(true);
    setResult(null);

    try {
      const response = await fetch('/api/style-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          style: style === 'custom' ? customStyle : style,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '模拟失败');
      }

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || '模拟失败');
      }
    } catch (error) {
      console.error('模拟失败:', error);
      alert(error instanceof Error ? error.message : '模拟失败，请稍后重试');
    } finally {
      setIsSimulating(false);
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
      const filename = `文风模拟_${result?.styleName || '自定义'}`;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Feather className="w-8 h-8" />
            文风模拟器
          </h1>
          <p className="mt-2 text-gray-600">
            模拟知名作者写作风格，为你的内容注入独特魅力
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
                      原稿内容
                    </label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="请输入需要模拟风格的内容..."
                      className="min-h-[250px] w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择风格
                    </label>
                    <Select
                      value={style}
                      onChange={(value) => setStyle(value as any)}
                      placeholder="请选择文风"
                      options={[
                        ...styles.map(s => ({ value: s.value, label: s.label })),
                        { value: 'custom', label: '自定义风格' },
                      ]}
                    />
                  </div>

                  {style === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        自定义风格描述
                      </label>
                      <Textarea
                        value={customStyle}
                        onChange={(e) => setCustomStyle(e.target.value)}
                        placeholder="请描述你想要的风格特点，例如：简洁明快、幽默诙谐、史诗磅礴..."
                        className="min-h-[80px] w-full"
                      />
                    </div>
                  )}

                  <GradientButton
                    className="w-full"
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    icon={isSimulating ? <Loader2 className="animate-spin" size={20} /> : <PenTool size={20} />}
                  >
                    {isSimulating ? '模拟中...' : '开始模拟'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 风格说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-600" />
                  作者风格说明
                </h3>
                <div className="space-y-3">
                  {styles.map((s) => (
                    <div
                      key={s.value}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        style === s.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setStyle(s.value)}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{s.label}</div>
                      <div className="text-sm text-gray-600">{s.desc}</div>
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
                {/* 结果信息 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-cyan-600" />
                        模拟结果
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Copy size={16} />}
                          onClick={() => handleCopy(result.simulatedContent)}
                        >
                          复制
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Download size={16} />}
                          onClick={() => handleExport(result.simulatedContent)}
                          disabled={isExporting}
                        >
                          {isExporting ? '导出中...' : '导出'}
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">风格特征</div>
                      <div className="flex flex-wrap gap-2">
                        {result.styleCharacteristics.map((char, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">词汇丰富度</div>
                        <div className="text-lg font-semibold text-cyan-600">{result.styleMetrics.vocabulary}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">句子长度</div>
                        <div className="text-lg font-semibold text-cyan-600">{result.styleMetrics.sentenceLength}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">语调</div>
                        <div className="text-lg font-semibold text-cyan-600">{result.styleMetrics.tone}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">复杂度</div>
                        <div className="text-lg font-semibold text-cyan-600">{result.styleMetrics.complexity}</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 模拟后内容 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Feather className="w-5 h-5 text-cyan-600" />
                      模拟后内容
                    </h4>
                    <div className="p-4 rounded-lg bg-gray-50 max-h-80 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {result.simulatedContent}
                      </pre>
                    </div>
                  </CardBody>
                </Card>

                {/* 改动点 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-600" />
                      主要改动 ({result.changes.length})
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {result.changes.map((change, index) => (
                        <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                          <div className="text-sm mb-1">
                            <span className="text-gray-500">原文：</span>
                            <span className="text-gray-700 line-through">{change.original}</span>
                          </div>
                          <div className="text-sm mb-1">
                            <span className="text-green-600">修改：</span>
                            <span className="text-gray-900 font-medium">{change.changed}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <Target size={12} className="inline mr-1" />
                            {change.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {!result && !isSimulating && (
              <Card>
                <CardBody className="py-16 text-center">
                  <Feather size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待模拟
                  </h3>
                  <p className="text-gray-600">
                    输入原稿内容，AI将为你模拟指定风格的写作
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
