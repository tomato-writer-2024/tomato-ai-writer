'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BrandIcons } from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody, FeatureCard } from '@/components/Card';
import { Input, Select, Textarea } from '@/components/Input';
import { Badge, StatusBadge, MembershipBadge, GenreBadge, TypeBadge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import Modal from '@/components/Modal';
import { Plus, MoreVertical, Edit, Trash2, Eye, Star, Clock, FileText, Calendar, Loader2, X } from 'lucide-react';

interface Novel {
  id: string;
  title: string;
  genre: string;
  status: '连载中' | '已完结' | '暂停';
  type: '爽文' | '甜宠' | '悬疑' | '玄幻' | '都市';
  wordCount: number;
  chapterCount: number;
  lastUpdate: string;
  averageRating: number;
  completionRate: number;
  membership: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  cover?: string;
  description: string;
  tags?: string[];
}

interface CreateNovelForm {
  title: string;
  description: string;
  genre: string;
  type: string;
  status: string;
  tags: string;
}

export default function WorksPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterGenre, setFilterGenre] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateNovelForm>({
    title: '',
    description: '',
    genre: '都市',
    type: '爽文',
    status: '连载中',
    tags: '',
  });
  const [deletingNovelId, setDeletingNovelId] = useState<string | null>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  const genres = ['全部', '都市', '玄幻', '言情', '科幻', '悬疑', '历史', '军事'];
  const statuses = ['全部', '连载中', '已完结', '暂停'];
  const genreOptions = ['都市', '玄幻', '言情', '科幻', '悬疑', '历史', '军事'];
  const typeOptions = ['爽文', '甜宠', '悬疑', '玄幻', '都市'];
  const statusOptions = ['连载中', '已完结', '暂停'];

  // 加载作品列表
  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/novels', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('加载作品列表失败');
      }

      const result = await response.json();
      if (result.success) {
        setNovels(result.data || []);
      }
    } catch (error) {
      console.error('加载作品列表失败:', error);
      alert('加载作品列表失败，请刷新重试');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNovels = novels.filter((novel) => {
    const matchesGenre = filterGenre === '全部' || novel.genre === filterGenre;
    const matchesStatus = filterStatus === '全部' || novel.status === filterStatus;
    const matchesSearch = novel.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesStatus && matchesSearch;
  });

  const getStatCard = (title: string, value: string, icon: React.ReactNode, color: string) => (
    <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
      <div className={`rounded-xl bg-gradient-to-br ${color} p-3 shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  // 创建作品
  const handleCreateNovel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.title.trim()) {
      alert('请输入作品标题');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          genre: createForm.genre,
          type: createForm.type,
          status: createForm.status as any,
          tags: createForm.tags ? createForm.tags.split(',').map(t => t.trim()).filter(t => t) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '创建作品失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('作品创建成功！');
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          genre: '都市',
          type: '爽文',
          status: '连载中',
          tags: '',
        });
        loadNovels(); // 重新加载列表
      } else {
        throw new Error(result.error || '创建作品失败');
      }
    } catch (error) {
      console.error('创建作品失败:', error);
      alert(error instanceof Error ? error.message : '创建作品失败，请稍后重试');
    } finally {
      setIsCreating(false);
    }
  };

  // 删除作品
  const handleDeleteNovel = async (novelId: string) => {
    if (!confirm('确定要删除这个作品吗？此操作不可恢复！')) {
      return;
    }

    setIsCreating(true); // 复用loading状态
    try {
      const response = await fetch(`/api/novels/${novelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '删除作品失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('作品删除成功！');
        loadNovels(); // 重新加载列表
      } else {
        throw new Error(result.error || '删除作品失败');
      }
    } catch (error) {
      console.error('删除作品失败:', error);
      alert(error instanceof Error ? error.message : '删除作品失败，请稍后重试');
    } finally {
      setIsCreating(false);
      setDeletingNovelId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">作品管理</h1>
            <p className="mt-2 text-gray-600">管理你的所有小说作品</p>
          </div>
          <GradientButton icon={<Plus size={20} />} iconPosition="right" onClick={() => setShowCreateModal(true)}>
            新建作品
          </GradientButton>
        </div>

        {/* 统计卡片 */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          {getStatCard(
            '作品总数',
            novels.length.toString(),
            <FileText size={24} className="text-white" />,
            'from-indigo-500 to-indigo-600'
          )}
          {getStatCard(
            '总字数',
            Math.round(novels.reduce((sum, n) => sum + n.wordCount, 0) / 10000) + '万',
            <BrandIcons.Writing size={24} className="text-white" />,
            'from-purple-500 to-purple-600'
          )}
          {getStatCard(
            '平均评分',
            (novels.reduce((sum, n) => sum + n.averageRating, 0) / novels.length).toFixed(1),
            <Star size={24} className="text-yellow-400 fill-yellow-400" />,
            'from-pink-500 to-pink-600'
          )}
          {getStatCard(
            '平均完读率',
            Math.round(novels.reduce((sum, n) => sum + n.completionRate, 0) / novels.length) + '%',
            <BrandIcons.Stats size={24} className="text-white" />,
            'from-orange-500 to-orange-600'
          )}
        </div>

        {/* 筛选和搜索 */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex flex-wrap gap-4">
              {/* 搜索框 */}
              <div className="flex-1 min-w-[200px]">
                <Input
                  type="text"
                  placeholder="搜索作品名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<BrandIcons.AI size={20} className="text-gray-400" />}
                  fullWidth
                />
              </div>

              {/* 类型筛选 */}
              <div className="min-w-[120px]">
                <Select
                  label="类型"
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  options={genres.map((g) => ({ value: g, label: g }))}
                  fullWidth
                />
              </div>

              {/* 状态筛选 */}
              <div className="min-w-[120px]">
                <Select
                  label="状态"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={statuses.map((s) => ({ value: s, label: s }))}
                  fullWidth
                />
              </div>

              {/* 视图切换 */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <BrandIcons.Stats size={18} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <FileText size={18} />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 作品列表 */}
        {viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNovels.map((novel) => (
              <Card key={novel.id} hover className="h-full">
                <CardBody className="flex h-full flex-col">
                  {/* 作品封面 */}
                  <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
                    <BrandIcons.Book size={64} className="text-indigo-600" />
                  </div>

                  {/* 作品信息 */}
                  <div className="flex-1">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <Link href={`/novel/${novel.id}`} className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors">
                        {novel.title}
                      </Link>
                      <button className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <GenreBadge genre={novel.genre} />
                      <TypeBadge type={novel.type} />
                      <StatusBadge status={novel.status} />
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{novel.description}</p>
                  </div>

                  {/* 数据统计 */}
                  <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">字数</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {Math.round(novel.wordCount / 10000)}万
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">更新</p>
                        <p className="text-sm font-semibold text-gray-900">{novel.chapterCount}章</p>
                      </div>
                    </div>
                  </div>

                  {/* 评分和完读率 */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-900">{novel.averageRating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">完读率</span>
                      <span className="text-sm font-semibold text-indigo-600">{novel.completionRate}%</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Link href={`/workspace?novelId=${novel.id}`} className="flex-1">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Edit size={16} />}
                        fullWidth
                      >
                        编辑
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDeleteNovel(novel.id)}
                      disabled={isCreating}
                    >
                      删除
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm text-gray-600">
                    <th className="px-6 py-4 font-medium">作品名称</th>
                    <th className="px-6 py-4 font-medium">类型</th>
                    <th className="px-6 py-4 font-medium">状态</th>
                    <th className="px-6 py-4 font-medium">字数</th>
                    <th className="px-6 py-4 font-medium">章节</th>
                    <th className="px-6 py-4 font-medium">评分</th>
                    <th className="px-6 py-4 font-medium">完读率</th>
                    <th className="px-6 py-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNovels.map((novel) => (
                    <tr key={novel.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                            <BrandIcons.Book size={20} className="text-indigo-600" />
                          </div>
                          <div>
                            <Link href={`/novel/${novel.id}`} className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                              {novel.title}
                            </Link>
                            <p className="text-xs text-gray-500">{novel.genre}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <GenreBadge genre={novel.genre} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={novel.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {Math.round(novel.wordCount / 10000)}万
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{novel.chapterCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{novel.averageRating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-indigo-600">{novel.completionRate}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/workspace?novelId=${novel.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit size={16} />}
                            />
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={16} />}
                            onClick={() => handleDeleteNovel(novel.id)}
                            disabled={isCreating}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}

        {/* 空状态 */}
        {filteredNovels.length === 0 && !isLoading && (
          <Card>
            <CardBody>
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <FileText size={48} className="text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">暂无作品</h3>
                <p className="mb-6 text-gray-600">
                  {searchQuery || filterGenre !== '全部' || filterStatus !== '全部'
                    ? '没有找到匹配的作品'
                    : '开始创建你的第一个作品吧'}
                </p>
                <GradientButton icon={<Plus size={20} />} iconPosition="right" onClick={() => setShowCreateModal(true)}>
                  创建新作品
                </GradientButton>
              </div>
            </CardBody>
          </Card>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        )}
      </div>

      {/* 创建作品Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          if (!isCreating) {
            setShowCreateModal(false);
          }
        }}
        title="创建新作品"
      >
        <form onSubmit={handleCreateNovel} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              作品标题 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="输入作品标题..."
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
              fullWidth
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              作品简介
            </label>
            <Textarea
              placeholder="简要描述作品内容..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={4}
              fullWidth
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                类型 <span className="text-red-500">*</span>
              </label>
              <Select
                value={createForm.genre}
                onChange={(e) => setCreateForm({ ...createForm, genre: e.target.value })}
                options={genreOptions.map((g) => ({ value: g, label: g }))}
                fullWidth
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                风格 <span className="text-red-500">*</span>
              </label>
              <Select
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                options={typeOptions.map((t) => ({ value: t, label: t }))}
                fullWidth
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                状态 <span className="text-red-500">*</span>
              </label>
              <Select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                options={statusOptions.map((s) => ({ value: s, label: s }))}
                fullWidth
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              标签（用逗号分隔）
            </label>
            <Input
              type="text"
              placeholder="例如：系统, 爽文, 穿越"
              value={createForm.tags}
              onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
              fullWidth
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!isCreating) {
                  setShowCreateModal(false);
                }
              }}
              disabled={isCreating}
            >
              取消
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  创建中...
                </>
              ) : (
                '创建作品'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
