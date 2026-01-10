'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, Globe, Sparkles, Crown, Star, Copy, Download, RefreshCw, Zap, Target, BookOpen, ChevronRight, Plus, Minus, FileText, Wand2, Mountain, Trees, Castle, Map, Building2, Shield, Flame, Droplet, Wind, Sword } from 'lucide-react';

interface WorldSetting {
  name: string;
  type: string;
  magicSystem: string;
  geography: string[];
  culture: string[];
  history: string;
  factions: Array<{ name: string; description: string }>;
  rules: string[];
  conflicts: string[];
}

export default function WorldBuildingPage() {
  const [worldName, setWorldName] = useState('');
  const [worldType, setWorldType] = useState('fantasy');
  const [theme, setTheme] = useState('');
  const [storyContext, setStoryContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [worldSetting, setWorldSetting] = useState<WorldSetting | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const worldTypes = [
    { value: 'fantasy', label: '奇幻', icon: Mountain, desc: '魔法与冒险的世界' },
    { value: 'scifi', label: '科幻', icon: Building2, desc: '科技与未来的世界' },
    { value: 'wuxia', label: '武侠', icon: Sword, desc: '江湖与侠义的世界' },
    { value: 'xianxia', label: '仙侠', icon: Flame, desc: '修仙与神魔的世界' },
    { value: 'urban', label: '都市', icon: Map, desc: '现代都市的世界' },
    { value: 'apocalyptic', label: '末世', icon: Shield, desc: '废土与生存的世界' },
  ];

  const themes = [
    { value: 'action', label: '热血战斗' },
    { value: 'mystery', label: '悬疑解谜' },
    { value: 'romance', label: '情感纠葛' },
    { value: 'adventure', label: '冒险探索' },
    { value: 'political', label: '权谋斗争' },
    { value: 'growth', label: '成长修炼' },
  ];

  const handleGenerate = async () => {
    if (!worldName.trim()) {
      alert('请输入世界名称');
      return;
    }

    if (!worldType) {
      alert('请选择世界类型');
      return;
    }

    setIsGenerating(true);
    setWorldSetting(null);

    try {
      const response = await fetch('/api/world-building', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldName,
          worldType,
          theme: theme || '无特定主题',
          storyContext: storyContext || '无额外背景信息',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const result = await response.json();
      if (result.success) {
        setWorldSetting(result.data);
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
    if (!worldSetting) {
      alert('没有内容可导出');
      return;
    }

    setIsExporting(true);
    try {
      const content = `世界观设定：${worldSetting.name}\n\n` +
        `世界类型：${worldTypes.find(t => t.value === worldSetting.type)?.label}\n\n` +
        `魔法体系：\n${worldSetting.magicSystem}\n\n` +
        `地理环境：\n${worldSetting.geography.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\n` +
        `文化特色：\n${worldSetting.culture.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n` +
        `世界历史：\n${worldSetting.history}\n\n` +
        `势力阵营：\n${worldSetting.factions.map(f => `• ${f.name}: ${f.description}`).join('\n')}\n\n` +
        `世界规则：\n${worldSetting.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n` +
        `核心冲突：\n${worldSetting.conflicts.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;

      const filename = `世界观设定_${worldSetting.name}`;

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
            <Globe className="w-8 h-8" />
            世界观构建器
          </h1>
          <p className="mt-2 text-gray-600">
            构建宏大完整的世界观设定，为你的小说奠定坚实基础
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
                      世界名称
                    </label>
                    <Input
                      value={worldName}
                      onChange={(e) => setWorldName(e.target.value)}
                      placeholder="请输入世界名称..."
                      icon={<Globe size={20} />}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        世界类型
                      </label>
                      <Select
                        value={worldType}
                        onChange={(value) => setWorldType(value as any)}
                        options={worldTypes.map(t => ({ value: t.value, label: t.label }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        核心主题
                      </label>
                      <Select
                        value={theme}
                        onChange={(value) => setTheme(value as any)}
                        placeholder="请选择主题"
                        options={themes.map(t => ({ value: t.value, label: t.label }))}
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
                      placeholder="请描述故事背景、核心冲突等..."
                      className="min-h-[100px] w-full"
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isGenerating ? '生成中...' : '生成世界观'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 世界类型说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5 text-cyan-600" />
                  世界类型说明
                </h3>
                <div className="space-y-3">
                  {worldTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        worldType === type.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setWorldType(type.value)}
                    >
                      <div className="flex items-center gap-3">
                        <type.icon size={24} className={worldType === type.value ? 'text-cyan-600' : 'text-gray-600'} />
                        <div>
                          <div className="font-semibold">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-6">
            {worldSetting && (
              <>
                {/* 世界观信息卡片 */}
                <Card>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Globe className="w-6 h-6 text-cyan-600" />
                          {worldSetting.name}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Copy size={16} />}
                            onClick={() => handleCopy(JSON.stringify(worldSetting, null, 2))}
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

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">世界类型</h4>
                        <Badge variant="outline" className="text-sm">
                          {worldTypes.find(t => t.value === worldSetting.type)?.label}
                        </Badge>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">魔法/力量体系</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {worldSetting.magicSystem}
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">地理环境</h4>
                        <div className="space-y-2">
                          {worldSetting.geography.map((geo, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Mountain size={16} className="text-cyan-600 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{geo}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">文化特色</h4>
                        <div className="flex flex-wrap gap-2">
                          {worldSetting.culture.map((c, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">世界历史</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {worldSetting.history}
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">势力阵营</h4>
                        <div className="space-y-2">
                          {worldSetting.factions.map((faction, index) => (
                            <div key={index} className="p-3 rounded-lg bg-gray-50">
                              <div className="font-semibold text-gray-900">{faction.name}</div>
                              <div className="text-sm text-gray-600">{faction.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">世界规则</h4>
                        <div className="space-y-2">
                          {worldSetting.rules.map((rule, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Shield size={16} className="text-indigo-600 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{rule}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">核心冲突</h4>
                        <div className="space-y-2">
                          {worldSetting.conflicts.map((conflict, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Flame size={16} className="text-red-600 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{conflict}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {!worldSetting && !isGenerating && (
              <Card>
                <CardBody className="py-16 text-center">
                  <Globe size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待生成世界观设定
                  </h3>
                  <p className="text-gray-600">
                    输入世界名称和选择类型，AI将为你构建完整的世界观体系
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
