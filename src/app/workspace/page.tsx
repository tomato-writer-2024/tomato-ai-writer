'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  toolCategories,
  quickTools,
  newFeatures,
  type Tool,
  type ToolCategory,
} from '@/lib/toolCategories';
import { BrandIcons } from '@/lib/brandIcons';
import { getToken } from '@/lib/auth-client';
import FileUploader from '@/components/FileUploader';
import {
  BookOpen,
  Zap,
  Sparkles,
  TrendingUp,
  Crown,
  Star,
  Target,
  Flame,
  Clock,
  FileText,
  Plus,
  ChevronRight,
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowUpRight,
  Upload,
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
  const [showImportModal, setShowImportModal] = useState(false);

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
    // 从 localStorage 加载最近使用的工具
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
      setRecentTools(recentToolList.slice(0, 6));
    }
  };

  const handleContentLoaded = (content: string, filename: string) => {
    setImportedContent(content);
    setImportedFilename(filename);
    // 将导入的内容保存到 localStorage，供其他页面使用
    localStorage.setItem('importedContent', content);
    localStorage.setItem('importedFilename', filename);
    alert(`文件 "${filename}" 导入成功！内容已保存，可在各个工具中使用。`);
  };

  const handleToolClick = (tool: Tool) => {
    // 保存到最近使用
    const recent = localStorage.getItem('recentTools') || '[]';
    const recentToolIds = JSON.parse(recent) as string[];
    const newRecent = [tool.id, ...recentToolIds.filter((id: string) => id !== tool.id)].slice(0, 10);
    localStorage.setItem('recentTools', JSON.stringify(newRecent));
  };

  const filteredCategories = toolCategories.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.tools.length > 0);

  const filteredQuickTools = quickTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNewFeatures = newFeatures.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
      {/* 顶部状态栏 */}
      <div className="border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                  <BrandIcons.Logo size={24} className="text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                    番茄AI写作助手
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">创作工作台</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* 搜索框 */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索工具..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* 用户信息 */}
              <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-4 py-2 dark:bg-slate-800">
                <Crown className="h-5 w-5 text-amber-500" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">{userStats.memberLevel}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">今日创作 {userStats.todayWords} 字</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 统计数据卡片 */}
        <div className="py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="今日字数"
              value={`${userStats.todayWords.toLocaleString()}`}
              icon={<Zap className="text-amber-500" size={24} />}
              change="+12%"
              color="amber"
            />
            <StatCard
              title="总字数"
              value={`${userStats.totalWords.toLocaleString()}`}
              icon={<FileText className="text-blue-500" size={24} />}
              color="blue"
            />
            <StatCard
              title="作品数量"
              value={`${userStats.totalWorks}`}
              icon={<BookOpen className="text-purple-500" size={24} />}
              color="purple"
            />
            <StatCard
              title="连续创作"
              value="7天"
              icon={<Flame className="text-orange-500" size={24} />}
              change="🔥 坚持创作"
              color="orange"
            />
          </div>
        </div>

        {/* 文件导入区 */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              📂 文件导入
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Upload size={16} />
              <span>支持 Word / PDF / TXT 格式</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  上传您的草稿或参考资料，AI将自动解析文件内容，可用于后续的创作、润色或续写。
                </p>
                <FileUploader
                  onContentLoaded={handleContentLoaded}
                  acceptedTypes={['.txt', '.pdf', '.doc', '.docx']}
                  maxSize={10}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  导入说明
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span>支持批量导入多个文件</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span>自动识别文件格式，智能提取文本内容</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span>保留原有排版和段落结构</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span>最大支持 10MB 文件</span>
                  </li>
                </ul>
                {importedFilename && (
                  <div className="mt-4 rounded-lg bg-cyan-50 p-4 dark:bg-cyan-900/20">
                    <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                      ✓ 已导入: {importedFilename}
                    </p>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                      共 {importedContent.length} 个字符
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 快捷工具区 */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ⚡ 快捷工具
            </h2>
            <Link
              href="/works"
              className="flex items-center gap-2 text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
            >
              查看我的作品
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {filteredQuickTools.map((tool) => (
              <QuickToolCard
                key={tool.id}
                tool={tool}
                onClick={() => handleToolClick(tool)}
              />
            ))}
          </div>
        </div>

        {/* 新功能展示 */}
        {filteredNewFeatures.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ✨ 新功能上线
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNewFeatures.map((tool) => (
                <FeatureCard
                  key={tool.id}
                  tool={tool}
                  onClick={() => handleToolClick(tool)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 分类工具区 */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              📚 全部工具
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-cyan-100 text-cyan-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-cyan-100 text-cyan-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* 分类标签 */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              全部工具
            </button>
            {toolCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.gradient} text-white shadow-md`
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* 工具列表 */}
          {viewMode === 'grid' ? (
            <div className="space-y-8">
              {filteredCategories.map((category) => (
                <div key={category.id} className="category-section">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient}`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.tools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onClick={() => handleToolClick(tool)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div key={category.id} className="rounded-xl bg-white p-6 shadow-lg dark:bg-slate-800">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient}`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.tools.map((tool) => (
                      <ToolListItem
                        key={tool.id}
                        tool={tool}
                        onClick={() => handleToolClick(tool)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 最近使用 */}
        {recentTools.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                🕐 最近使用
              </h2>
              <button
                onClick={() => {
                  localStorage.removeItem('recentTools');
                  setRecentTools([]);
                }}
                className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                清空记录
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {recentTools.map((tool) => (
                <MiniToolCard
                  key={tool.id}
                  tool={tool}
                  onClick={() => handleToolClick(tool)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({
  title,
  value,
  icon,
  change,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  color: 'amber' | 'blue' | 'purple' | 'orange';
}) {
  const colorClasses = {
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 dark:bg-slate-800">
      <div
        className={`absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[color]} opacity-20`}
      >
        {icon}
      </div>
      <div className="relative">
        <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <p className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        {change && (
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{change}</p>
        )}
      </div>
    </div>
  );
}

// 快捷工具卡片
function QuickToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  return (
    <Link
      href={tool.href}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 dark:bg-slate-800"
    >
      <div className="absolute right-0 top-0 h-20 w-20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-bl-full transition-all duration-300 group-hover:scale-150" />
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl shadow-lg">
          {tool.icon}
        </div>
        <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">
          {tool.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {tool.description}
        </p>
        {tool.isHot && (
          <div className="absolute right-2 top-2">
            <Flame size={16} className="text-orange-500" />
          </div>
        )}
        {tool.isNew && (
          <div className="absolute right-2 top-2">
            <Sparkles size={16} className="text-cyan-500" />
          </div>
        )}
      </div>
    </Link>
  );
}

// 功能卡片
function FeatureCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  return (
    <Link
      href={tool.href}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 dark:border-purple-800 dark:from-purple-500/20 dark:to-pink-500/20"
    >
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl shadow-lg">
          {tool.icon}
        </div>
        <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">
          {tool.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {tool.description}
        </p>
        {tool.isNew && (
          <div className="absolute right-2 top-2">
            <div className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-1 text-xs font-medium text-white">
              NEW
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

// 工具卡片
function ToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  return (
    <Link
      href={tool.href}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 dark:bg-slate-800"
    >
      <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-slate-500/5 to-slate-600/5 rounded-bl-full transition-all duration-300 group-hover:scale-150" />
      <div className="relative">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-xl dark:from-slate-700 dark:to-slate-600">
          {tool.icon}
        </div>
        <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
          {tool.description}
        </p>
        <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5 text-cyan-600" />
        </div>
        {tool.isHot && (
          <div className="absolute right-2 top-2">
            <Flame size={14} className="text-orange-500" />
          </div>
        )}
        {tool.isNew && (
          <div className="absolute right-2 top-2">
            <Sparkles size={14} className="text-cyan-500" />
          </div>
        )}
        {tool.isPro && (
          <div className="absolute right-2 top-2">
            <Crown size={14} className="text-amber-500" />
          </div>
        )}
      </div>
    </Link>
  );
}

// 工具列表项（列表视图）
function ToolListItem({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  return (
    <Link
      href={tool.href}
      onClick={onClick}
      className="group flex items-center justify-between rounded-lg bg-slate-50 p-4 transition-all duration-300 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-lg dark:from-slate-700 dark:to-slate-600">
          {tool.icon}
        </div>
        <div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100">
            {tool.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {tool.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {tool.isHot && <Flame size={14} className="text-orange-500" />}
        {tool.isNew && <Sparkles size={14} className="text-cyan-500" />}
        {tool.isPro && <Crown size={14} className="text-amber-500" />}
        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

// 迷你工具卡片
function MiniToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  return (
    <Link
      href={tool.href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 dark:bg-slate-800"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-lg dark:from-slate-700 dark:to-slate-600">
        {tool.icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {tool.name}
        </h3>
        <p className="truncate text-xs text-slate-600 dark:text-slate-400">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
