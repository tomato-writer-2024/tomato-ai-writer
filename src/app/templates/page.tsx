'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import { BrandIcons } from '@/lib/brandIcons';
import { FileText, Sparkles, Zap, BookOpen, Target, ChevronRight, Copy, Check } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  icon: string;
  usageCount: number;
}

const templates: Template[] = [
  {
    id: 'golden-start',
    name: '黄金开篇模板',
    description: '打造引人入胜的开篇，快速抓住读者注意力',
    category: '开篇',
    prompt: `请根据以下设定，创作一个黄金开篇：

【作品设定】
书名：{书名}
题材：{题材}
主角：{主角设定}
核心冲突：{核心冲突}

【开篇要求】
1. 前300字必须有强烈的冲突或悬念
2. 立即交代主角身份和处境
3. 植入2-3个爽点元素
4. 预埋后续剧情伏笔
5. 字数：500-800字

请直接输出开篇正文，不要任何解释说明。`,
    tags: ['开篇', '黄金三章', '爽文'],
    icon: '🌟',
    usageCount: 1234,
  },
  {
    id: 'climax-climax',
    name: '高潮爆发模板',
    description: '设计爆发式高潮场景，引爆读者情绪',
    category: '高潮',
    prompt: `请根据以下剧情，创作高潮爆发场景：

【剧情背景】
章节位置：{章节位置}
前文剧情：{前文剧情}
矛盾冲突：{矛盾冲突}

【高潮要求】
1. 多线剧情汇聚，矛盾集中爆发
2. 主角展现超越以往的实力/智慧
3. 反转设计，打破读者预期
4. 情绪层层递进，达到最高点
5. 字数：800-1200字

请直接输出高潮正文，不要任何解释说明。`,
    tags: ['高潮', '爆发', '反转'],
    icon: '💥',
    usageCount: 987,
  },
  {
    id: 'character-debut',
    name: '人物登场模板',
    description: '塑造令人印象深刻的人物形象',
    category: '人物',
    prompt: `请创作以下人物的登场场景：

【人物设定】
姓名：{姓名}
身份：{身份}
性格特点：{性格特点}
外貌特征：{外貌特征}
出场目的：{出场目的}

【登场要求】
1. 通过动作、语言、环境烘托人物性格
2. 展现人物独特气场
3. 设计标志性台词或动作
4. 建立与主角的关系
5. 字数：300-500字

请直接输出登场场景，不要任何解释说明。`,
    tags: ['人物', '登场', '塑造'],
    icon: '👤',
    usageCount: 756,
  },
  {
    id: 'foreshadowing',
    name: '伏笔埋设模板',
    description: '巧妙埋设伏笔，增强剧情连贯性',
    category: '技巧',
    prompt: `请为以下剧情埋设伏笔：

【当前剧情】
章节内容：{章节内容}
后续发展：{后续发展}

【伏笔要求】
1. 自然融入当前剧情，不突兀
2. 暗示但不明说，留有解读空间
3. 设置多重解读可能
4. 为后续反转做准备
5. 埋设2-3个不同层面的伏笔

请直接输出伏笔内容，标注埋设位置，不要任何解释说明。`,
    tags: ['伏笔', '剧情', '技巧'],
    icon: '🎯',
    usageCount: 654,
  },
  {
    id: 'conflict-setup',
    name: '冲突搭建模板',
    description: '构建多层次冲突，推动剧情发展',
    category: '剧情',
    prompt: `请搭建冲突场景：

【设定信息】
场景：{场景}
参与方：{参与方}
冲突类型：{冲突类型}

【冲突要求】
1. 立即建立紧张氛围
2. 明确冲突双方立场
3. 设计冲突升级阶梯
4. 预留解决空间
5. 字数：600-1000字

请直接输出冲突场景，不要任何解释说明。`,
    tags: ['冲突', '剧情', '张力'],
    icon: '⚔️',
    usageCount: 543,
  },
  {
    id: 'emotional-resonance',
    name: '情感共鸣模板',
    description: '触动读者情感，增强代入感',
    category: '情感',
    prompt: `请创作情感共鸣场景：

【场景设定】
情节：{情节}
情感基调：{情感基调}
核心情感：{核心情感}

【共鸣要求】
1. 细节描写，营造沉浸感
2. 通过人物行为体现情感
3. 与读者共同情感经验建立连接
4. 情感层层递进，达到高潮
5. 字数：500-800字

请直接输出情感场景，不要任何解释说明。`,
    tags: ['情感', '共鸣', '代入'],
    icon: '❤️',
    usageCount: 432,
  },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = ['全部', '开篇', '高潮', '人物', '技巧', '剧情', '情感'];

  const filteredTemplates = selectedCategory === '全部'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleCopyPrompt = (template: Template) => {
    navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            <FileText size={36} className="text-brand" />
            写作模板
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            使用精选写作模板，快速生成高质量内容
          </p>
        </div>

        {/* 分类筛选 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${selectedCategory === category
                    ? 'bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white shadow-lg shadow-[#FF4757]/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 模板网格 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{template.icon}</div>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {template.name}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                  <span>使用 {template.usageCount} 次</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUseTemplate(template)}
                  >
                    查看模板
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyPrompt(template)}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* 模板详情弹窗 */}
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{selectedTemplate.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {selectedTemplate.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{selectedTemplate.category}</Badge>
                        <span className="text-sm text-slate-500">
                          使用 {selectedTemplate.usageCount} 次
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Sparkles className="h-5 w-5 text-slate-500" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    模板提示词
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                      {selectedTemplate.prompt}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-3">
                  <GradientButton
                    className="flex-1"
                    onClick={() => handleCopyPrompt(selectedTemplate)}
                  >
                    <Copy size={18} className="mr-2" />
                    {copied ? '已复制' : '复制提示词'}
                  </GradientButton>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    关闭
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
