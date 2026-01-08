'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  FileText,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  TrendingUp,
  Clock,
} from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';

interface Novel {
  id: string;
  title: string;
  genre: string;
  chapterCount: number;
  totalWords: number;
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  lastChapterAt: string;
}

export default function WorksPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'COMPLETED'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNovelTitle, setNewNovelTitle] = useState('');
  const [newNovelGenre, setNewNovelGenre] = useState('');

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      // TODO: 实际调用API获取作品列表
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/works', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setNovels(data.data.novels);

      // 模拟数据
      setNovels([
        {
          id: '1',
          title: '都市超级神医',
          genre: '都市',
          chapterCount: 156,
          totalWords: 468000,
          status: 'PUBLISHED',
          createdAt: '2024-12-01',
          updatedAt: '2025-01-07',
          lastChapterAt: '2025-01-07',
        },
        {
          id: '2',
          title: '末世之无敌系统',
          genre: '科幻',
          chapterCount: 89,
          totalWords: 267000,
          status: 'DRAFT',
          createdAt: '2024-12-15',
          updatedAt: '2025-01-05',
          lastChapterAt: '2025-01-05',
        },
      ]);
    } catch (error) {
      console.error('加载作品列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNovel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNovelTitle.trim()) {
      alert('请输入作品名称');
      return;
    }

    if (!newNovelGenre.trim()) {
      alert('请选择作品类型');
      return;
    }

    try {
      // TODO: 实际调用API创建作品
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/works', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ title: newNovelTitle, genre: newNovelGenre })
      // });

      alert('作品创建成功！');
      setShowCreateModal(false);
      setNewNovelTitle('');
      setNewNovelGenre('');
      loadNovels();
    } catch (error) {
      console.error('创建作品失败:', error);
      alert('创建作品失败，请稍后重试');
    }
  };

  const handleDeleteNovel = async (novelId: string) => {
    if (!confirm('确定要删除这部作品吗？此操作不可恢复。')) {
      return;
    }

    try {
      // TODO: 实际调用API删除作品
      // const token = localStorage.getItem('token');
      // await fetch(`/api/works/${novelId}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      alert('作品删除成功！');
      loadNovels();
    } catch (error) {
      console.error('删除作品失败:', error);
      alert('删除作品失败，请稍后重试');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { label: '草稿', color: 'gray' },
      PUBLISHED: { label: '连载中', color: 'green' },
      COMPLETED: { label: '已完结', color: 'blue' },
    };
    return badges[status as keyof typeof badges] || badges.DRAFT;
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      '都市': 'indigo',
      '玄幻': 'purple',
      '仙侠': 'pink',
      '科幻': 'cyan',
      '历史': 'orange',
      '军事': 'red',
      '游戏': 'blue',
      '灵异': 'gray',
    };
    return colors[genre] || 'gray';
  };

  const filteredNovels = novels.filter((novel) => {
    const matchesSearch = novel.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || novel.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="mx-auto animate-spin text-indigo-600" size={40} />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/workspace" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                <BrandIcons.Logo size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                番茄AI写作助手
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/workspace"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <FileText size={18} />
                返回工作区
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
              >
                <BookOpen size={18} />
                个人中心
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题和操作 */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">作品管理</h1>
            <p className="mt-2 text-gray-600">管理您的所有小说作品</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus size={20} />
            新建作品
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索作品名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Filter size={18} />
              全部
            </button>
            <button
              onClick={() => setFilterStatus('PUBLISHED')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                filterStatus === 'PUBLISHED'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              连载中
            </button>
            <button
              onClick={() => setFilterStatus('DRAFT')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                filterStatus === 'DRAFT'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              草稿
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                filterStatus === 'COMPLETED'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              已完结
            </button>
          </div>
        </div>

        {/* 作品列表 */}
        {filteredNovels.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 shadow-lg border border-gray-100 text-center">
            <BookOpen className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">暂无作品</h3>
            <p className="text-gray-600 mb-6">开始创作您的第一部小说吧</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
            >
              <Plus size={20} />
              新建作品
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNovels.map((novel) => (
              <div
                key={novel.id}
                className="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* 作品封面和标题 */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-${getGenreColor(novel.genre)}-100 text-${getGenreColor(novel.genre)}-700`}>
                        {novel.genre}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-${getStatusBadge(novel.status).color}-100 text-${getStatusBadge(novel.status).color}-700`}>
                        {getStatusBadge(novel.status).label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{novel.title}</h3>
                  </div>
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </div>

                {/* 统计信息 */}
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-600">章节数</p>
                    <p className="text-lg font-bold text-gray-900">{novel.chapterCount}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-600">总字数</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(novel.totalWords / 10000).toFixed(1)}万
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-600">更新</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(novel.lastChapterAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Link
                    href={`/works/${novel.id}`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all"
                  >
                    <Edit size={16} />
                    编辑
                  </Link>
                  <Link
                    href={`/works/${novel.id}/preview`}
                    className="flex items-center justify-center gap-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <Eye size={16} />
                    预览
                  </Link>
                  <button
                    onClick={() => handleDeleteNovel(novel.id)}
                    className="flex items-center justify-center gap-1 rounded-lg border-2 border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新建作品模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-gray-900">新建作品</h3>
            <form onSubmit={handleCreateNovel} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">作品名称</label>
                <input
                  type="text"
                  value={newNovelTitle}
                  onChange={(e) => setNewNovelTitle(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="输入作品名称"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">作品类型</label>
                <select
                  value={newNovelGenre}
                  onChange={(e) => setNewNovelGenre(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">请选择类型</option>
                  <option value="都市">都市</option>
                  <option value="玄幻">玄幻</option>
                  <option value="仙侠">仙侠</option>
                  <option value="科幻">科幻</option>
                  <option value="历史">历史</option>
                  <option value="军事">军事</option>
                  <option value="游戏">游戏</option>
                  <option value="灵异">灵异</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
