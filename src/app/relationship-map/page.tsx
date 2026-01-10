'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Loader2, Network, Sparkles, Crown, Star, Copy, Download, RefreshCw, Zap, UserPlus, Link as LinkIcon, Heart, Sword, Shield, Users } from 'lucide-react';

interface Relationship {
  character1: string;
  character2: string;
  type: string;
  description: string;
  intensity: number;
  dynamic: string;
}

interface RelationshipMap {
  characters: Array<{
    name: string;
    role: string;
    traits: string[];
  }>;
  relationships: Relationship[];
  storylines: Array<{
    name: string;
    participants: string[];
    description: string;
  }>;
}

export default function RelationshipMapPage() {
  const [characters, setCharacters] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [storyContext, setStoryContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [relationshipMap, setRelationshipMap] = useState<RelationshipMap | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const relationshipTypes = [
    { value: 'family', label: '家庭关系' },
    { value: 'friend', label: '朋友' },
    { value: 'enemy', label: '敌人' },
    { value: 'mentor', label: '师徒' },
    { value: 'love', label: '恋人' },
    { value: 'rival', label: '对手' },
    { value: 'ally', label: '盟友' },
    { value: 'betrayal', label: '背叛' },
  ];

  const handleGenerate = async () => {
    if (!characters.trim()) {
      alert('请输入角色信息');
      return;
    }

    if (!relationshipType) {
      alert('请选择关系类型');
      return;
    }

    setIsGenerating(true);
    setRelationshipMap(null);

    try {
      const response = await fetch('/api/relationship-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characters,
          relationshipType,
          storyContext: storyContext || '无额外背景信息',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const result = await response.json();
      if (result.success) {
        setRelationshipMap(result.data);
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
    if (!relationshipMap) {
      alert('没有内容可导出');
      return;
    }

    setIsExporting(true);
    try {
      const content = `人物关系图谱\n\n` +
        `角色列表：\n${relationshipMap.characters.map(c => `• ${c.name} (${c.role}): ${c.traits.join(', ')}`).join('\n')}\n\n` +
        `关系列表：\n${relationshipMap.relationships.map(r => 
          `• ${r.character1} - ${r.character2}\n  类型: ${r.type}\n  描述: ${r.description}\n  强度: ${r.intensity}/10\n  发展动态: ${r.dynamic}`
        ).join('\n\n')}\n\n` +
        `故事线：\n${relationshipMap.storylines.map(s => 
          `• ${s.name}\n  参与者: ${s.participants.join(', ')}\n  描述: ${s.description}`
        ).join('\n\n')}`;

      const filename = '人物关系图谱';

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

  const getRelationshipIcon = (type: string) => {
    const icons: Record<string, any> = {
      family: Heart,
      friend: Users,
      enemy: Sword,
      mentor: Shield,
      love: Heart,
      rival: Zap,
      ally: Shield,
      betrayal: Sword,
    };
    return icons[type] || LinkIcon;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'bg-red-500';
    if (intensity >= 6) return 'bg-orange-500';
    if (intensity >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Network className="w-8 h-8" />
            人物关系图谱
          </h1>
          <p className="mt-2 text-gray-600">
            构建复杂的人物关系网络，驱动剧情发展
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
                      角色信息
                    </label>
                    <Textarea
                      value={characters}
                      onChange={(e) => setCharacters(e.target.value)}
                      placeholder="请输入角色信息，每行一个角色，格式：角色名-角色定位-性格特点..."
                      className="min-h-[150px] w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      关系类型
                    </label>
                    <Select
                      value={relationshipType}
                      onChange={(value) => setRelationshipType(value as any)}
                      placeholder="请选择关系类型"
                      options={relationshipTypes.map(t => ({ value: t.value, label: t.label }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      故事背景（可选）
                    </label>
                    <Textarea
                      value={storyContext}
                      onChange={(e) => setStoryContext(e.target.value)}
                      placeholder="请描述故事背景、主要冲突等..."
                      className="min-h-[100px] w-full"
                    />
                  </div>

                  <GradientButton
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  >
                    {isGenerating ? '生成中...' : '生成关系图谱'}
                  </GradientButton>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-6">
            {relationshipMap && (
              <>
                {/* 操作按钮 */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        关系图谱生成完成
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Copy size={16} />}
                          onClick={() => handleCopy(JSON.stringify(relationshipMap, null, 2))}
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
                  </CardBody>
                </Card>

                {/* 角色列表 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users size={20} className="text-cyan-600" />
                      角色列表 ({relationshipMap.characters.length}人)
                    </h4>
                    <div className="space-y-2">
                      {relationshipMap.characters.map((character, index) => (
                        <div key={index} className="p-3 rounded-lg bg-gray-50 hover:bg-cyan-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{character.name}</div>
                              <div className="text-sm text-gray-600">{character.role}</div>
                            </div>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {character.traits.slice(0, 3).map((trait, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* 关系列表 */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <LinkIcon size={20} className="text-cyan-600" />
                      关系列表 ({relationshipMap.relationships.length})
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {relationshipMap.relationships.map((rel, index) => {
                        const Icon = getRelationshipIcon(rel.type);
                        return (
                          <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon size={16} className="text-cyan-600" />
                                <span className="font-semibold text-gray-900 text-sm">
                                  {rel.character1} ↔ {rel.character2}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {rel.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{rel.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <div className={`w-16 h-2 rounded-full ${getIntensityColor(rel.intensity)}`} />
                                <span>强度 {rel.intensity}/10</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>

                {/* 故事线 */}
                {relationshipMap.storylines.length > 0 && (
                  <Card>
                    <CardBody>
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles size={20} className="text-cyan-600" />
                        故事线 ({relationshipMap.storylines.length})
                      </h4>
                      <div className="space-y-3">
                        {relationshipMap.storylines.map((storyline, index) => (
                          <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                            <div className="font-semibold text-gray-900 mb-1">{storyline.name}</div>
                            <div className="text-sm text-gray-600 mb-2">{storyline.description}</div>
                            <div className="flex flex-wrap gap-1">
                              {storyline.participants.map((participant, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {participant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </>
            )}

            {!relationshipMap && !isGenerating && (
              <Card>
                <CardBody className="py-16 text-center">
                  <Network size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    等待生成关系图谱
                  </h3>
                  <p className="text-gray-600">
                    输入角色信息和关系类型，AI将为你构建复杂的人物关系网络
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
