'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import ImportExport from '@/components/ImportExport';
import { Loader2, User, Sparkles, Crown, Star, Copy, Download, RefreshCw, Zap, Target, BookOpen, ChevronRight, Plus, Minus, FileText, Wand2, Heart, Sword, Shield, Eye, Brain } from 'lucide-react';

interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  personality: string;
  backstory: string;
  motivations: string[];
  abilities: string[];
  relationships: Record<string, string>;
  arcProgress: number;
  traits: string[];
}

export default function CharactersPage() {
  const [characterName, setCharacterName] = useState('');
  const [role, setRole] = useState('protagonist');
  const [genre, setGenre] = useState('');
  const [storyContext, setStoryContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [importedContent, setImportedContent] = useState('');
  const [importedFilename, setImportedFilename] = useState('');

  const roles = [
    { value: 'protagonist', label: '主角', icon: Crown, desc: '故事的核心人物' },
    { value: 'secondary', label: '配角', icon: User, desc: '重要的配角角色' },
    { value: 'antagonist', label: '反派', icon: Sword, desc: '主角的对立面' },
    { value: 'supporting', label: '辅助角色', icon: Shield, desc: '支持和帮助主角' },
  ];

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

  const handleGenerate = async () => {
    if (!characterName.trim()) {
      alert('请输入角色名称');
      return;
    }

    if (!genre) {
      alert('请选择小说题材');
      return;
    }

    setIsGenerating(true);
    setCharacterProfile(null);

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName,
          role,
          genre,
          storyContext: storyContext || '无额外背景信息',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const result = await response.json();
      if (result.success) {
        setCharacterProfile(result.data);
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
    if (!characterProfile) {
      alert('没有内容可导出');
      return;
    }
    setIsExporting(true);
    try {
      const content = `角色设定：${characterProfile.name}\n\n` +
        `角色定位：${characterProfile.role}\n` +
        `性格特点：${characterProfile.personality}\n\n` +
        `角色背景：\n${characterProfile.backstory}\n\n` +
        `动机目标：\n${characterProfile.motivations.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\n` +
        `能力特长：\n${characterProfile.abilities.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n` +
        `性格特质：\n${characterProfile.traits.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n` +
        `人际关系：\n${Object.entries(characterProfile.relationships).map(([k, v]) => `${k}: ${v}`).join('\n')}`;

      const response = await fetch('/api/files/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          format: 'txt',
          filename: `角色设定_${characterProfile.name}`,
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

  // 生成导出内容
  const generateExportContent = () => {
    if (!characterProfile) return '';
    return `角色设定：${characterProfile.name}\n\n` +
      `角色定位：${characterProfile.role}\n` +
      `性格特点：${characterProfile.personality}\n\n` +
      `角色背景：\n${characterProfile.backstory}\n\n` +
      `动机目标：\n${characterProfile.motivations.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\n` +
      `能力特长：\n${characterProfile.abilities.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n` +
      `性格特质：\n${characterProfile.traits.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n` +
      `人际关系：\n${Object.entries(characterProfile.relationships).map(([k, v]) => `${k}: ${v}`).join('\n')}`;
  };

  // 处理导入内容
  const handleContentLoaded = (content: string, filename: string) => {
    setImportedContent(content);
    setImportedFilename(filename);
    setStoryContext(content);
    alert(`文件 "${filename}" 导入成功！内容已添加到故事背景中。`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <User className="w-8 h-8" />
            角色设定系统
          </h1>
          <p className="mt-2 text-gray-600">
            智能生成立体饱满的角色设定，构建独特的人物魅力
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
                      角色名称
                    </label>
                    <Input
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      placeholder="请输入角色名称..."
                      icon={<User size={20} />}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        角色定位
                      </label>
                      <Select
                        value={role}
                        onChange={(value) => setRole(value as any)}
                        options={roles.map(r => ({ value: r.value, label: r.label }))}
                      />
                    </div>

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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      故事背景（可选）
                    </label>
                    <Textarea
                      value={storyContext}
                      onChange={(e) => setStoryContext(e.target.value)}
                      placeholder="请描述故事背景、世界观设定等..."
                      className="min-h-[100px] w-full"
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isGenerating ? '生成中...' : '生成角色设定'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>

            {/* 导入导出 */}
            <ImportExport
              mode="both"
              content={generateExportContent()}
              filename={`角色设定_${characterName || '未命名'}`}
              onContentLoaded={handleContentLoaded}
              variant="full"
              className="mt-4"
            />

            {/* 角色定位说明 */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-600" />
                  角色定位说明
                </h3>
                <div className="space-y-3">
                  {roles.map((r) => (
                    <div
                      key={r.value}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        role === r.value
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                      onClick={() => setRole(r.value)}
                    >
                      <div className="flex items-center gap-3">
                        <r.icon size={24} className={role === r.value ? 'text-cyan-600' : 'text-gray-600'} />
                        <div>
                          <div className="font-semibold">{r.label}</div>
                          <div className="text-sm text-gray-600">{r.desc}</div>
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
            {characterProfile && (
              <>
                {/* 角色信息卡片 */}
                <Card>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Crown className="w-6 h-6 text-cyan-600" />
                          {characterProfile.name}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Copy size={16} />}
                            onClick={() => handleCopy(JSON.stringify(characterProfile, null, 2))}
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
                        <h4 className="font-semibold text-gray-900 mb-2">角色定位</h4>
                        <Badge variant="outline" className="text-sm">
                          {roles.find(r => r.value === characterProfile.role)?.label}
                        </Badge>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">性格特点</h4>
                        <p className="text-gray-700 leading-relaxed">{characterProfile.personality}</p>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">角色背景</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {characterProfile.backstory}
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">动机目标</h4>
                        <div className="space-y-2">
                          {characterProfile.motivations.map((motivation, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <span className="text-gray-700">{motivation}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">能力特长</h4>
                        <div className="flex flex-wrap gap-2">
                          {characterProfile.abilities.map((ability, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {ability}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">性格特质</h4>
                        <div className="flex flex-wrap gap-2">
                          {characterProfile.traits.map((trait, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">人际关系</h4>
                        <div className="space-y-2">
                          {Object.entries(characterProfile.relationships).map(([person, relation]) => (
                            <div key={person} className="flex items-center gap-2">
                              <Heart size={16} className="text-pink-500" />
                              <span className="text-gray-700">
                                <span className="font-semibold">{person}:</span> {relation}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {!characterProfile && !isGenerating && (
              <Card>
                <CardBody className="py-16 text-center">
                  <User size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待生成角色设定
                  </h3>
                  <p className="text-gray-600">
                    输入角色名称和选择定位，AI将为你生成完整的角色设定
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
