'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Eye, Trash2 } from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import Navigation from '@/components/Navigation';

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <BrandIcons.Zap className="mx-auto animate-spin text-indigo-600" size={40} />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题和操作 */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                <BrandIcons.Book size={24} className="text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">作品管理</h1>
            </div>
            <p className="ml-9 text-gray-600">管理您的所有小说作品</p>
          </div>
          <GradientButton
            icon={<BrandIcons.Zap size={20} />}
            onClick={() => setShowCreateModal(true)}
          >
            新建作品
          </GradientButton>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <BrandIcons.Export size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索作品名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterStatus('ALL')}
                  variant={filterStatus === 'ALL' ? 'primary' : 'secondary'}
                  size="md"
                >
                  全部
                </Button>
                <Button
                  onClick={() => setFilterStatus('PUBLISHED')}
                  variant={filterStatus === 'PUBLISHED' ? 'primary' : 'secondary'}
                  size="md"
                >
                  连载中
                </Button>
                <Button
                  onClick={() => setFilterStatus('DRAFT')}
                  variant={filterStatus === 'DRAFT' ? 'primary' : 'secondary'}
                  size="md"
                >
                  草稿
                </Button>
                <Button
                  onClick={() => setFilterStatus('COMPLETED')}
                  variant={filterStatus === 'COMPLETED' ? 'primary' : 'secondary'}
                  size="md"
                >
                  已完结
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 作品列表 */}
        {filteredNovels.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                <BrandIcons.Book size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">暂无作品</h3>
              <p className="text-gray-600 mb-6">开始创作您的第一部小说吧</p>
              <GradientButton
                icon={<BrandIcons.Zap size={20} />}
                onClick={() => setShowCreateModal(true)}
              >
                新建作品
              </GradientButton>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNovels.map((novel) => (
              <Card key={novel.id} hover>
                <CardBody>
                  {/* 作品标题 */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          getGenreColor(novel.genre) === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                          getGenreColor(novel.genre) === 'purple' ? 'bg-purple-100 text-purple-700' :
                          getGenreColor(novel.genre) === 'pink' ? 'bg-pink-100 text-pink-700' :
                          getGenreColor(novel.genre) === 'cyan' ? 'bg-cyan-100 text-cyan-700' :
                          getGenreColor(novel.genre) === 'orange' ? 'bg-orange-100 text-orange-700' :
                          getGenreColor(novel.genre) === 'red' ? 'bg-red-100 text-red-700' :
                          getGenreColor(novel.genre) === 'blue' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {novel.genre}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          getStatusBadge(novel.status).color === 'green' ? 'bg-green-100 text-green-700' :
                          getStatusBadge(novel.status).color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getStatusBadge(novel.status).label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{novel.title}</h3>
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 text-center">
                      <p className="text-xs text-gray-600">章节数</p>
                      <p className="text-lg font-bold gradient-text">{novel.chapterCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-3 text-center">
                      <p className="text-xs text-gray-600">总字数</p>
                      <p className="text-lg font-bold gradient-text">{(novel.totalWords / 10000).toFixed(1)}万</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 p-3 text-center">
                      <p className="text-xs text-gray-600">更新</p>
                      <p className="text-sm font-bold text-gray-900">{new Date(novel.lastChapterAt).toLocaleDateString('zh-CN')}</p>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Link href={`/works/${novel.id}`} className="flex-1">
                      <Button variant="primary" icon={<Edit size={16} />} fullWidth>
                        编辑
                      </Button>
                    </Link>
                    <Link href={`/works/${novel.id}/preview`}>
                      <Button variant="outline" icon={<Eye size={16} />}>
                        预览
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDeleteNovel(novel.id)}
                    >
                      删除
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 新建作品模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="mx-4 w-full max-w-md card-shadow">
            <CardBody>
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                  <BrandIcons.Zap size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">新建作品</h3>
              </div>
              <form onSubmit={handleCreateNovel} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">作品名称</label>
                  <input
                    type="text"
                    value={newNovelTitle}
                    onChange={(e) => setNewNovelTitle(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="输入作品名称"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">作品类型</label>
                  <select
                    value={newNovelGenre}
                    onChange={(e) => setNewNovelGenre(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                  <Button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    fullWidth
                  >
                    取消
                  </Button>
                  <GradientButton type="submit" fullWidth>
                    创建
                  </GradientButton>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
