'use client';

import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import ImportExport from '@/components/ImportExport';
import { Loader2, Sparkles, Crown, Star, Copy, Download, RefreshCw, Zap, Lightbulb, BookOpen, Target, ChevronRight, CheckCircle2, Eye, Plus, Minus, FileText, Wand2, Award } from 'lucide-react';

interface GoldenStartVersion {
  version: number;
  content: string;
  analysis: {
    hookType: string;
    hookStrength: number;
    tensionLevel: number;
    readability: number;
    uniqueness: number;
    marketFit: number;
  };
  suggestions: string[];
}

export default function GoldenStartPage() {
  const [storyContext, setStoryContext] = useState('');
  const [protagonist, setProtagonist] = useState('');
  const [genre, setGenre] = useState('');
  const [startType, setStartType] = useState<'conflict' | 'suspense' | 'showcase' | 'warm' | 'shocking'>('conflict');
  const [versionCount, setVersionCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVersions, setGeneratedVersions] = useState<GoldenStartVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [importedContent, setImportedContent] = useState('');
  const [importedFilename, setImportedFilename] = useState('');

  const genres = [
    { value: 'xuanhuan', label: '玄幻' },
    { value: 'wuxia', label: '武侠' },
    { value: 'xianxia', label: '仙侠' },
    { value: 'dushi', label: '都市' },
    { value: 'lishi', label: '历史' },
    { value: 'junshi', label: '军事' },
    { value: 'kehuan', label: '科幻' },
    { value: 'lingyi', label: '灵异' },
    { value: 'youxi', label: '游戏' },
  ];

  const startTypes = [
    { value: 'conflict', label: '冲突型', icon: Zap, desc: '开篇即冲突，立即抓住读者' },
    { value: 'suspense', label: '悬念型', icon: Target, desc: '设置悬念，引发好奇心' },
    { value: 'showcase', label: '装逼型', icon: Crown, desc: '展示主角强大/与众不同' },
    { value: 'warm', label: '温情型', icon: Lightbulb, desc: '温情开场，建立情感连接' },
    { value: 'shocking', label: '震撼型', icon: Award, desc: '震撼开场，留下深刻印象' },
  ];

  const handleGenerate = async () => {
    if (!protagonist.trim()) {
      alert('请输入主角设定');
      return;
    }

    if (!genre) {
      alert('请选择小说题材');
      return;
    }

    setIsGenerating(true);
    setGeneratedVersions([]);
    setSelectedVersion(0);

    try {
      const response = await fetch('/api/golden-start/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyContext: storyContext || '无额外背景信息',
          protagonist,
          genre,
          startType,
          versionCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const result = await response.json();
      if (result.success) {
        setGeneratedVersions(result.data);
        if (result.data.length > 0) {
          setSelectedVersion(0);
        }
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

  // 生成导出内容
  const generateExportContent = () => {
    if (generatedVersions.length === 0 || !generatedVersions[selectedVersion]) return '';
    const version = generatedVersions[selectedVersion];
    return `【黄金开头 - ${protagonist || '未命名'}】\n\n` +
      `开头类型：${startTypes.find(t => t.value === startType)?.label}\n\n` +
      `【版本 ${version.version}】\n\n` +
      `${version.content}\n\n` +
      `【分析】\n` +
      `钩子类型：${version.analysis.hookType}\n` +
      `钩子强度：${version.analysis.hookStrength}/10\n` +
      `紧张程度：${version.analysis.tensionLevel}/10\n` +
      `可读性：${version.analysis.readability}/10\n` +
      `独特性：${version.analysis.uniqueness}/10\n` +
      `市场适配度：${version.analysis.marketFit}/10\n\n` +
      `【建议】\n${version.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  };

  // 处理导入内容
  const handleContentLoaded = (content: string, filename: string) => {
    setImportedContent(content);
    setImportedFilename(filename);
    setStoryContext(content);
    alert(`文件 "${filename}" 导入成功！内容已添加到故事背景中。`);
  };

  const handleExport = async (content: string) => {
    if (!content.trim()) {
      alert('没有内容可导出');
      return;
    }

    setIsExporting(true);
    try {
      const filename = `黄金开头_${protagonist || '作品'}`;

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

  const handleRegenerate = (version: number) => {
    alert('单独重新生成功能开发中，敬请期待！');
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Crown className="w-8 h-8" />
            黄金开头生成
          </h1>
          <p className="mt-2 text-gray-600">
            遵循黄金3秒+黄金500字原则，生成多版本开头，助你打造爆款开篇
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入配置区 */}
          <div className="space-y-6">
            {/* 基本配置 */}
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主角设定
                    </label>
                    <Textarea
                      value={protagonist}
                      onChange={(e) => setProtagonist(e.target.value)}
                      placeholder="请描述主角的性格、能力、背景等..."
                      className="min-h-[100px] w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        小说题材
                      </label>
                      <Select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        options={[
                          { value: '', label: '请选择题材' },
                          ...genres,
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        开头类型
                      </label>
                      <Select
                        value={startType}
                        onChange={(e) => setStartType(e.target.value as any)}
                        options={startTypes.map(t => ({ value: t.value, label: t.label }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      故事背景（可选）
                    </label>
                    <Textarea
                      value={storyContext}
                      onChange={(e) => setStoryContext(e.target.value)}
                      placeholder="请提供故事背景、世界观、设定等..."
                      className="min-h-[100px] w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生成版本数：{versionCount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={versionCount}
                      onChange={(e) => setVersionCount(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <GradientButton
                    onClick={handleGenerate}
                    disabled={isGenerating || !protagonist.trim() || !genre}
                    className="w-full py-3"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        生成黄金开头
                      </>
                    )}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 导入导出 */}
            <ImportExport
              mode="both"
              content={generateExportContent()}
              filename={`黄金开头_${protagonist || '未命名'}`}
              onContentLoaded={handleContentLoaded}
              variant="full"
              className="mt-4"
            />

            {/* 开头类型说明 */}
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  开头类型说明
                </h3>
                <div className="space-y-3">
                  {startTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        startType === type.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            startType === type.value
                              ? 'bg-cyan-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.desc}</div>
                        </div>
                        {startType === type.value && (
                          <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* 黄金原则说明 */}
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  黄金原则
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="warning">黄金3秒</Badge>
                      <span className="font-medium text-gray-900">立即抓住读者</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      开头3秒内必须有强烈的吸引力，让读者产生继续阅读的欲望
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="danger">黄金500字</Badge>
                      <span className="font-medium text-gray-900">完整呈现核心</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      前500字必须完整呈现主角、世界观和核心冲突，奠定故事基调
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：生成结果展示区 */}
          <div className="space-y-6">
            {generatedVersions.length === 0 ? (
              <Card>
                <CardBody>
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      等待生成
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      配置左侧参数后，点击生成按钮开始创作黄金开头
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-900">多版本</div>
                        <div className="text-gray-600">1-5个版本</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-900">详细分析</div>
                        <div className="text-gray-600">6维度评估</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-900">优化建议</div>
                        <div className="text-gray-600">精准改进</div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <>
                {/* 版本选择 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        生成结果（{generatedVersions.length}个版本）
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedVersions([])}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重新生成
                      </Button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {generatedVersions.map((version, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedVersion(index)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                            selectedVersion === index
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          版本 {version.version}
                        </button>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* 选定版本详情 */}
                {selectedVersion !== null && generatedVersions[selectedVersion] && (
                  <>
                    <Card>
                      <CardBody>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">
                            版本 {generatedVersions[selectedVersion].version}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(generatedVersions[selectedVersion].content)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              复制
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(generatedVersions[selectedVersion].content)}
                              disabled={isExporting}
                            >
                              {isExporting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  导出中...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  导出
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* 开头内容 */}
                        <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg mb-4">
                          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-900">
                            {generatedVersions[selectedVersion].content}
                          </div>
                        </div>

                        {/* 分析结果 */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-xl font-bold ${getScoreColor(generatedVersions[selectedVersion].analysis.hookStrength)}`}>
                              {generatedVersions[selectedVersion].analysis.hookStrength}/10
                            </div>
                            <div className="text-xs text-gray-600 mt-1">钩子强度</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-xl font-bold ${getScoreColor(generatedVersions[selectedVersion].analysis.tensionLevel)}`}>
                              {generatedVersions[selectedVersion].analysis.tensionLevel}/10
                            </div>
                            <div className="text-xs text-gray-600 mt-1">张力等级</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-xl font-bold ${getScoreColor(generatedVersions[selectedVersion].analysis.readability)}`}>
                              {generatedVersions[selectedVersion].analysis.readability}/10
                            </div>
                            <div className="text-xs text-gray-600 mt-1">可读性</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-xl font-bold ${getScoreColor(generatedVersions[selectedVersion].analysis.uniqueness)}`}>
                              {generatedVersions[selectedVersion].analysis.uniqueness}/10
                            </div>
                            <div className="text-xs text-gray-600 mt-1">独特性</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-xl font-bold ${getScoreColor(generatedVersions[selectedVersion].analysis.marketFit)}`}>
                              {generatedVersions[selectedVersion].analysis.marketFit}/10
                            </div>
                            <div className="text-xs text-gray-600 mt-1">市场契合度</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">
                              {generatedVersions[selectedVersion].analysis.hookType}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">钩子类型</div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* 优化建议 */}
                    <Card>
                      <CardBody>
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          优化建议
                        </h3>
                        <div className="space-y-2">
                          {generatedVersions[selectedVersion].suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                              <ChevronRight className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </>
                )}

                {/* 全部版本快速对比 */}
                {generatedVersions.length > 1 && (
                  <Card>
                    <CardBody>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        快速对比
                      </h3>
                      <div className="space-y-3">
                        {generatedVersions.map((version, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                              selectedVersion === index
                                ? 'border-cyan-500 bg-cyan-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedVersion(index)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  版本 {version.version}
                                </span>
                                {selectedVersion === index && (
                                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                                )}
                              </div>
                              <Badge variant="outline" size="sm">
                                {version.analysis.hookType}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-xs">
                              <div className="text-center">
                                <div className={`font-bold ${getScoreColor(version.analysis.hookStrength)}`}>
                                  {version.analysis.hookStrength}
                                </div>
                                <div className="text-gray-500">钩子</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-bold ${getScoreColor(version.analysis.tensionLevel)}`}>
                                  {version.analysis.tensionLevel}
                                </div>
                                <div className="text-gray-500">张力</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-bold ${getScoreColor(version.analysis.readability)}`}>
                                  {version.analysis.readability}
                                </div>
                                <div className="text-gray-500">可读</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-bold ${getScoreColor(version.analysis.uniqueness)}`}>
                                  {version.analysis.uniqueness}
                                </div>
                                <div className="text-gray-500">独特</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-bold ${getScoreColor(version.analysis.marketFit)}`}>
                                  {version.analysis.marketFit}
                                </div>
                                <div className="text-gray-500">市场</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
