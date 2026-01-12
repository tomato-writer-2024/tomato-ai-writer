'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  toolCategories,
  type Tool,
  type ToolCategory,
} from '@/lib/toolCategories';
import { BrandLogo } from '@/components/BrandLogo';
import { getToken } from '@/lib/auth-client';
import ImportExport from '@/components/ImportExport';
import PageIcon from '@/components/PageIcon';
import {
  BookOpen,
  Zap,
  Sparkles,
  TrendingUp,
  Crown,
  Flame,
  Clock,
  FileText,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  ArrowRight,
  Upload,
  Home,
  Star,
  Settings,
  Bell,
  Menu,
  X,
  PenTool,
  Users,
  Database,
  Wand2,
  Palette,
  Lightbulb,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleContentLoaded = (content: string, filename: string) => {
    setImportedContent(content);
    setImportedFilename(filename);
    localStorage.setItem('importedContent', content);
    localStorage.setItem('importedFilename', filename);
    alert(`文件 "${filename}" 导入成功！内容已保存，可在各个工具中使用。`);
  };

  const handleToolClick = (tool: Tool) => {
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
  })).filter(category => selectedCategory === 'all' || category.id === selectedCategory)
    .filter(category => category.tools.length > 0);

  const getCategoryIcon = (category: ToolCategory) => {
    const iconMap: Record<string, any> = {
      character: Users,
      plot: BookOpen,
      writing: PenTool,
      optimization: Star,
      creative: Palette,
      materials: Database,
    };
    const Icon = iconMap[category.id] || Sparkles;
    return <Icon size={20} />;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-orange-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 左侧侧边栏 */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen w-72 bg-white/90 dark:bg-slate-900/90
          border-r border-slate-200/50 dark:border-slate-800
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-20' : 'w-72'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backdropFilter: 'blur(12px)' }}
      >
        {/* Logo区域 */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/50 dark:border-slate-800 px-4">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size="md" />
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* 用户信息卡片 */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-800">
            <div className="rounded-2xl bg-gradient-to-br from-brand/10 to-brand-dark/10 p-4 border border-brand/30 dark:border-brand/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white">
                  <Crown size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {userStats.memberLevel}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    今日创作 {userStats.todayWords.toLocaleString()} 字
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-brand dark:text-brand-light">
                    {userStats.totalWords.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">总字数</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-brand-secondary dark:text-brand-secondary">
                    {userStats.totalWorks}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">作品</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    7天
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">连续</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 导航菜单 */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-240px)]">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl
              transition-all duration-200 group
              ${selectedCategory === 'all'
                ? 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/25'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
            `}
          >
            <LayoutGrid size={20} />
            {!sidebarCollapsed && <span className="font-medium">全部工具</span>}
          </button>

          {toolCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 group
                ${selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              <div className={`
                flex h-8 w-8 items-center justify-center rounded-lg
                ${selectedCategory === category.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}
              `}>
                {getCategoryIcon(category)}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{category.name}</div>
                  {!sidebarCollapsed && (
                    <div className="text-xs opacity-80">{category.tools.length} 个工具</div>
                  )}
                </div>
              )}
              {selectedCategory === category.id && !sidebarCollapsed && (
                <ChevronRight size={16} className="opacity-60" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* 移动端遮罩 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 主内容区 */}
      <main className="flex-1 lg:ml-72 transition-all duration-300">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu size={24} />
              </button>

              {/* 搜索框 */}
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索工具或功能..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
              <Link href="/settings" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Settings size={20} className="text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {userStats.memberLevel.substring(0, 1)}
              </div>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="p-4 lg:p-6">
          {/* 工具操作栏 */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {selectedCategory === 'all' ? '全部工具' : toolCategories.find(c => c.id === selectedCategory)?.name}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {filteredCategories.reduce((sum, cat) => sum + cat.tools.length, 0)} 个工具可用
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-brand text-white shadow-lg shadow-brand/25'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-brand text-white shadow-lg shadow-brand/25'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* 快捷操作卡片 */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="开始创作"
              description="创建新章节"
              icon={<PenTool size={24} />}
              href="/works/new"
              gradient="from-brand to-brand-dark"
            />
            <QuickActionCard
              title="导入草稿"
              description="上传已有内容"
              icon={<Upload size={24} />}
              href="#import"
              gradient="from-brand-secondary to-brand-accent"
              isScroll
            />
            <QuickActionCard
              title="智能续写"
              description="AI辅助创作"
              icon={<Wand2 size={24} />}
              href="/continue"
              gradient="from-brand-creative to-brand"
            />
            <QuickActionCard
              title="我的作品"
              description="管理创作"
              icon={<BookOpen size={24} />}
              href="/works"
              gradient="from-emerald-500 to-teal-600"
            />
          </div>

          {/* 文件导入区域 */}
          <div id="import" className="mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Upload size={18} className="text-white" />
                </div>
                文件导入
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                上传您的草稿或参考资料，AI将自动解析并可用于后续创作
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <ImportExport
                  mode="import"
                  variant="compact"
                  onContentLoaded={handleContentLoaded}
                  acceptedTypes={['.txt', '.pdf', '.doc', '.docx']}
                  maxSize={10}
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Lightbulb size={18} className="text-amber-500" />
                    支持格式
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-600 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-500">
                      TXT
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-600 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-500">
                      PDF
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-600 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-500">
                      Word
                    </span>
                  </div>
                </div>
                {importedFilename && (
                  <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-medium">
                      <Sparkles size={16} />
                      已导入文件
                    </div>
                    <p className="mt-1 text-sm text-slate-900 dark:text-slate-100 font-semibold">
                      {importedFilename}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {importedContent.length.toLocaleString()} 个字符
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 最近使用 */}
          {recentTools.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                <Clock size={24} className="text-purple-500" />
                最近使用
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recentTools.slice(0, 4).map((tool) => (
                  <RecentToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool)} />
                ))}
              </div>
            </div>
          )}

          {/* 工具列表 */}
          <div>
            {filteredCategories.map((category) => (
              <div key={category.id} className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg`}>
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {category.name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{category.description}</p>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.tools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} onClick={() => handleToolClick(tool)} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {category.tools.map((tool) => (
                      <ToolListItem key={tool.id} tool={tool} onClick={() => handleToolClick(tool)} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// 快捷操作卡片
function QuickActionCard({
  title,
  description,
  icon,
  href,
  gradient,
  isScroll = false,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  isScroll?: boolean;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (isScroll) {
      e.preventDefault();
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
    >
      <div className={`absolute right-0 top-0 h-24 w-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full transition-all duration-300 group-hover:scale-125`} />
      <div className="relative">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <h3 className="mb-1 font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
        <div className="absolute right-4 bottom-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
          <ArrowRight className="h-5 w-5 text-slate-400" />
        </div>
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
      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-[#FF4757] dark:hover:border-[#FF4757]"
    >
      <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-150" />
      <div className="relative">
        <div className="mb-3">
          <PageIcon pagePath={tool.href} size="lg" variant="gradient" showBackground={false} rounded={true} hoverable={false} />
        </div>
        <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
          {tool.description}
        </p>
        <div className="flex items-center gap-2">
          {tool.isHot && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
              <Flame size={12} />
              热门
            </span>
          )}
          {tool.isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF4757]/10 dark:bg-[#FF4757]/30 text-[#FF4757] text-xs font-medium">
              <Sparkles size={12} />
              新功能
            </span>
          )}
          {tool.isPro && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
              <Crown size={12} />
              专业版
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// 工具列表项
function ToolListItem({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  return (
    <Link
      href={tool.href}
      onClick={onClick}
      className="group flex items-center justify-between rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg p-4 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:border-[#FF4757] dark:hover:border-[#FF4757]"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex h-11 w-11 flex-shrink-0">
          <PageIcon pagePath={tool.href} size="md" variant="gradient" showBackground={false} rounded={true} hoverable={false} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {tool.name}
            </h3>
            {tool.isHot && <Flame size={14} className="text-orange-500 flex-shrink-0" />}
            {tool.isNew && <Sparkles size={14} className="text-[#FF4757] flex-shrink-0" />}
            {tool.isPro && <Crown size={14} className="text-amber-500 flex-shrink-0" />}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
            {tool.description}
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0 ml-4" />
    </Link>
  );
}

// 最近使用工具卡片
function RecentToolCard({ tool, onClick }: { tool: Tool; onClick: () => void }) {
  return (
    <Link
      href={tool.href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-[#FF4757] dark:hover:border-[#FF4757]"
    >
      <div className="flex h-10 w-10 flex-shrink-0">
        <PageIcon pagePath={tool.href} size="md" variant="gradient" showBackground={false} rounded={true} hoverable={false} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
          {tool.description}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100 flex-shrink-0" />
    </Link>
  );
}
