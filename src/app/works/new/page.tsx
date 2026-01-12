'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Sparkles,
  BookOpen,
  FileText,
  Type,
  Tag,
  Image as ImageIcon,
  X,
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { getToken } from '@/lib/auth-client';
import { toolCategories } from '@/lib/toolCategories';

interface Novel {
  id?: string;
  title: string;
  description: string;
  genre: string;
  tags: string[];
  coverUrl: string;
  type: string;
}

export default function NewNovelPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [novel, setNovel] = useState<Novel>({
    title: '',
    description: '',
    genre: '都市',
    tags: [],
    coverUrl: '',
    type: '原创',
  });
  const [tagInput, setTagInput] = useState('');

  const genres = [
    { id: '都市', name: '都市', icon: '🏙️' },
    { id: '玄幻', name: '玄幻', icon: '⚔️' },
    { id: '仙侠', name: '仙侠', icon: '🧘' },
    { id: '历史', name: '历史', icon: '📜' },
    { id: '军事', name: '军事', icon: '💂' },
    { id: '游戏', name: '游戏', icon: '🎮' },
    { id: '科幻', name: '科幻', icon: '🚀' },
    { id: '灵异', name: '灵异', icon: '👻' },
    { id: '武侠', name: '武侠', icon: '🗡️' },
    { id: '奇幻', name: '奇幻', icon: '🐉' },
  ];

  const typeOptions = ['原创', '同人', '改编', '翻译'];

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const handleSave = async () => {
    if (!novel.title.trim()) {
      alert('请输入作品标题');
      return;
    }

    setSaveStatus('saving');
    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novel),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSaveStatus('saved');
          setTimeout(() => {
            router.push(`/novel/${result.data.id}/chapter/new`);
          }, 1000);
        } else {
          setSaveStatus('error');
          alert(result.error || '保存失败');
        }
      } else {
        setSaveStatus('error');
        alert('保存失败，请稍后重试');
      }
    } catch (error) {
      console.error('保存失败:', error);
      setSaveStatus('error');
      alert('保存失败，请稍后重试');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !novel.tags.includes(tagInput.trim())) {
      setNovel(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNovel(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">⏳</div>
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/workspace" className="flex items-center gap-3">
              <div className="text-2xl">🍅</div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/works"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-brand transition-colors dark:text-slate-300"
              >
                <BookOpen size={18} />
                我的作品
              </Link>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-sm font-medium text-white hover:from-brand-dark hover:to-brand transition-all disabled:opacity-50"
              >
                {saveStatus === 'saved' ? <Check size={18} /> : <Save size={18} />}
                {saveStatus === 'saved' ? '已保存' : saveStatus === 'saving' ? '保存中...' : '创建作品'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 面包屑 */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/workspace" className="flex items-center gap-1 text-slate-600 hover:text-brand dark:text-slate-400">
            <ArrowLeft size={16} />
            返回工作台
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-slate-100">创建新作品</span>
        </div>

        {/* 标题区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            <Sparkles size={36} className="text-brand" />
            创建新作品
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            开始您的创作之旅，填写作品信息后即可开始章节创作
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左侧：表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-brand" />
                基本信息
              </h2>

              <div className="space-y-4">
                {/* 标题 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                    作品名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={novel.title}
                    onChange={(e) => setNovel(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="请输入作品标题，例如：都市重生之系统觉醒"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white transition-all"
                  />
                </div>

                {/* 简介 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                    作品简介
                  </label>
                  <textarea
                    value={novel.description}
                    onChange={(e) => setNovel(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="简要描述您的故事情节、主要角色和核心设定..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white transition-all resize-none"
                  />
                </div>

                {/* 类型 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                    作品类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={novel.type}
                    onChange={(e) => setNovel(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white transition-all"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 题材选择 */}
            <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Type size={20} className="text-brand" />
                题材选择
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setNovel(prev => ({ ...prev, genre: genre.id }))}
                    className={`
                      flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all
                      ${novel.genre === genre.id
                        ? 'border-brand bg-brand/5 text-brand'
                        : 'border-slate-200 hover:border-brand/50 text-slate-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand/50'
                      }
                    `}
                  >
                    <span className="text-2xl">{genre.icon}</span>
                    <span className="text-sm font-medium">{genre.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 标签 */}
            <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Tag size={20} className="text-brand" />
                作品标签
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="输入标签后按回车添加"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white transition-all"
                />
                <button
                  onClick={handleAddTag}
                  className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-all"
                >
                  <Plus size={18} />
                  添加
                </button>
              </div>

              {novel.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {novel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1.5 text-sm text-brand dark:bg-brand/30 dark:text-brand-light"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-brand-dark dark:hover:text-brand transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  暂无标签，请添加相关标签
                </p>
              )}
            </div>
          </div>

          {/* 右侧：工具和提示 */}
          <div className="space-y-6">
            {/* 快捷工具 */}
            <div className="rounded-2xl bg-gradient-to-br from-brand/10 to-brand-dark/10 border border-brand/30 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-brand" />
                创作工具
              </h3>
              <div className="space-y-2">
                <Link
                  href="/title-generator"
                  className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700 hover:bg-white transition-all dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>生成标题</span>
                  <ArrowRight size={16} className="text-slate-400" />
                </Link>
                <Link
                  href="/outline-generator"
                  className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700 hover:bg-white transition-all dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>生成大纲</span>
                  <ArrowRight size={16} className="text-slate-400" />
                </Link>
                <Link
                  href="/characters"
                  className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700 hover:bg-white transition-all dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>创建角色</span>
                  <ArrowRight size={16} className="text-slate-400" />
                </Link>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-6 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Sparkles size={20} className="text-blue-600" />
                创作提示
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>标题要简洁易记，能体现作品特色</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>简介要抓住读者眼球，突出核心爽点</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>选择最合适的题材，精准定位读者</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span>标签有助于读者发现和筛选作品</span>
                </li>
              </ul>
            </div>

            {/* 导入内容 */}
            <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Upload size={20} className="text-brand" />
                导入已有内容
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                如果您已有草稿，可以导入后快速开始创作
              </p>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-700 hover:border-brand hover:text-brand transition-all dark:border-slate-600 dark:text-slate-400"
              >
                <Upload size={18} />
                选择文件导入
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
