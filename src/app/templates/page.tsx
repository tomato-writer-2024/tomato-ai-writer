'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import { BrandIcons } from '@/lib/brandIcons';
import { templates, getCategories, Template } from '@/lib/templates';
import { FileText, Sparkles, Zap, BookOpen, Target, ChevronRight, Copy, Check } from 'lucide-react';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = getCategories();

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
