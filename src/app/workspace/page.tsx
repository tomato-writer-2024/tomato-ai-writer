'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  toolCategories,
  type Tool,
  type ToolCategory,
} from '@/lib/toolCategories';
import ImportExport from '@/components/ImportExport';
import { getToken } from '@/lib/auth-client';
import BrandCard from '@/components/ui/BrandCard';
import FeatureCard from '@/components/ui/FeatureCard';
import {
  BookOpen,
  Zap,
  Sparkles,
  TrendingUp,
  Flame,
  FileText,
  Search,
  Clock,
  LayoutGrid,
  List,
  Plus,
  Play,
} from 'lucide-react';

export default function WorkspacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [userStats, setUserStats] = useState({
    totalWords: 0,
    totalWorks: 0,
    todayWords: 0,
    memberLevel: '普通用户',
  });
  const [importedContent, setImportedContent] = useState('');
  const [importedFilename, setImportedFilename] = useState('');

  useEffect(() => {
    setIsAuthenticated(!!getToken());
    loadUserStats();
    loadRecentTools();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserStats(result.data);
        }
      }
    } catch (error) {
      console.error('加载用户统计失败:', error);
    }
  };

  const loadRecentTools = () => {
    const recent = localStorage.getItem('recentTools');
    if (recent) {
      const recentToolIds: string[] = JSON.parse(recent);
      const recentToolList: Tool[] = recentToolIds
        .map((id: string) => {
          for (const category of toolCategories) {
            const tool = category.tools.find((t: Tool) => t.id === id);
            if (tool) return tool;
          }
          return null;
        })
        .filter((t): t is Tool => t !== null);
      setRecentTools(recentToolList.slice(0, 8));
    }
  };

  const handleToolClick = (tool: Tool) => {
    const recent = localStorage.getItem('recentTools');
    let recentToolIds: string[] = recent ? JSON.parse(recent) : [];

    // 移除已存在的
    recentToolIds = recentToolIds.filter((id) => id !== tool.id);

    // 添加到开头
    recentToolIds.unshift(tool.id);

    // 只保留最近使用的8个工具
    recentToolIds = recentToolIds.slice(0, 8);

    localStorage.setItem('recentTools', JSON.stringify(recentToolIds));
    setRecentTools([tool, ...recentTools.filter((t) => t.id !== tool.id)].slice(0, 8));
  };

  const filteredTools = selectedCategory === 'all'
    ? toolCategories.flatMap((cat) => cat.tools)
    : toolCategories.find((cat) => cat.id === selectedCategory)?.tools || [];

  const searchedTools = searchQuery
    ? filteredTools.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTools;

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              欢迎回来，创作者
            </h1>
            <p className="text-slate-600">
              今天也是创作的好日子，开始你的创作之旅吧
            </p>
          </div>
          <Link
            href="/works/new"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white font-medium hover:shadow-lg hover:shadow-[#FF4757]/25 hover:scale-105 transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>新建作品</span>
          </Link>
        </div>

        {/* 数据统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={FileText}
            title="累计字数"
            value={userStats.totalWords.toLocaleString()}
            delay={0}
          />
          <FeatureCard
            icon={BookOpen}
            title="作品数量"
            value={userStats.totalWorks.toLocaleString()}
            delay={100}
          />
          <FeatureCard
            icon={TrendingUp}
            title="今日创作"
            value={userStats.todayWords.toLocaleString()}
            delay={200}
          />
        </div>
      </section>

      {/* 快速开始 */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Zap className="h-6 w-6 text-[#FF4757]" />
          快速开始
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/writing/chapter"
            onClick={() => handleToolClick({ id: 'chapter', name: '章节撰写', description: '', icon: PenTool })}
            className="group"
          >
            <BrandCard
              icon={Play}
              title="章节撰写"
              description="AI辅助撰写章节内容，支持多种风格和题材"
              tags={['智能生成', '风格控制']}
              gradient="from-[#FF4757] to-[#FF6B81]"
              delay={0}
            />
          </Link>
          <Link
            href="/writing/polish"
            onClick={() => handleToolClick({ id: 'polish', name: '精修润色', description: '', icon: Sparkles })}
            className="group"
          >
            <BrandCard
              icon={Sparkles}
              title="精修润色"
              description="自动润色和优化文本，提升文章质量"
              tags={['语法检查', '情感增强']}
              gradient="from-[#5F27CD] to-[#9B59B6]"
              delay={100}
            />
          </Link>
          <Link
            href="/writing/continue"
            onClick={() => handleToolClick({ id: 'continue', name: '智能续写', description: '', icon: FileText })}
            className="group"
          >
            <BrandCard
              icon={Clock}
              title="智能续写"
              description="基于上下文智能续写内容，避免卡文"
              tags={['情节预测', '逻辑一致']}
              gradient="from-[#00D2D3] to-[#3498DB]"
              delay={200}
            />
          </Link>
        </div>
      </section>

      {/* 最近使用 */}
      {recentTools.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Clock className="h-6 w-6 text-[#FF4757]" />
            最近使用
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentTools.slice(0, 4).map((tool, index) => (
              <Link
                key={tool.id}
                href={tool.href}
                onClick={() => handleToolClick(tool)}
                className="group"
              >
                <BrandCard
                  icon={tool.icon}
                  title={tool.name}
                  description={tool.description}
                  gradient="from-[#FF4757] to-[#5F27CD]"
                  delay={index * 100}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 全部工具 */}
      <section>
        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200 focus-within:border-[#FF4757] focus-within:ring-2 focus-within:ring-[#FF4757]/10 transition-all">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#FF4757] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#FF4757] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            全部
          </button>
          {toolCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-[#FF4757] to-[#5F27CD] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 工具列表 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedTools.map((tool, index) => (
              <Link
                key={tool.id}
                href={tool.href}
                onClick={() => handleToolClick(tool)}
                className="group"
              >
                <BrandCard
                  icon={tool.icon}
                  title={tool.name}
                  description={tool.description}
                  gradient="from-[#FF4757] to-[#5F27CD]"
                  delay={index * 50}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {searchedTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                onClick={() => handleToolClick(tool)}
                className="group flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#FF4757]/30 hover:shadow-lg hover:shadow-[#FF4757]/10 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4757] to-[#5F27CD] text-white group-hover:scale-110 transition-transform">
                  <tool.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#FF4757] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-600">{tool.description}</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 group-hover:bg-[#FF4757] text-slate-600 group-hover:text-white transition-all">
                  <Play className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 导入导出 */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">导入导出</h2>
        <ImportExport
          onImport={(content, filename) => {
            setImportedContent(content);
            setImportedFilename(filename);
          }}
        />
      </section>
    </div>
  );
}
