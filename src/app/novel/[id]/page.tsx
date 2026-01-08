'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import BrandIcons from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge, StatusBadge, GenreBadge, TypeBadge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import Modal from '@/components/Modal';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  FileText,
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

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
  description: string;
  tags?: string[];
  createdAt: string;
}

interface Chapter {
  id: string;
  novelId: string;
  chapterNum: number;
  title: string;
  content: string;
  wordCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateChapterForm {
  chapterNum: number;
  title: string;
  content: string;
  isPublished: boolean;
}

export default function NovelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const novelId = params.id as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoadingNovel, setIsLoadingNovel] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateChapterForm>({
    chapterNum: 1,
    title: '',
    content: '',
    isPublished: false,
  });

  // 加载作品信息
  useEffect(() => {
    if (novelId) {
      loadNovel();
      loadChapters();
    }
  }, [novelId]);

  const loadNovel = async () => {
    setIsLoadingNovel(true);
    try {
      const response = await fetch(`/api/novels/${novelId}`);
      if (!response.ok) {
        throw new Error('加载作品信息失败');
      }

      const result = await response.json();
      if (result.success) {
        setNovel(result.data);
      }
    } catch (error) {
      console.error('加载作品信息失败:', error);
      alert('加载作品信息失败，请刷新重试');
    } finally {
      setIsLoadingNovel(false);
    }
  };

  const loadChapters = async () => {
    setIsLoadingChapters(true);
    try {
      const response = await fetch(`/api/chapters?novelId=${novelId}&limit=100`);
      if (!response.ok) {
        throw new Error('加载章节列表失败');
      }

      const result = await response.json();
      if (result.success) {
        setChapters(result.data || []);
      }
    } catch (error) {
      console.error('加载章节列表失败:', error);
      alert('加载章节列表失败，请刷新重试');
    } finally {
      setIsLoadingChapters(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.title.trim() || !createForm.content.trim()) {
      alert('请填写章节标题和内容');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId,
          chapterNum: createForm.chapterNum,
          title: createForm.title.trim(),
          content: createForm.content,
          wordCount: createForm.content.length,
          isPublished: createForm.isPublished,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '创建章节失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('章节创建成功！');
        setShowCreateChapterModal(false);
        setCreateForm({
          chapterNum: chapters.length + 1,
          title: '',
          content: '',
          isPublished: false,
        });
        loadChapters(); // 重新加载章节列表
        loadNovel(); // 重新加载作品信息（更新章节数和字数）
      } else {
        throw new Error(result.error || '创建章节失败');
      }
    } catch (error) {
      console.error('创建章节失败:', error);
      alert(error instanceof Error ? error.message : '创建章节失败，请稍后重试');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('确定要删除这个章节吗？此操作不可恢复！')) {
      return;
    }

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '删除章节失败');
      }

      const result = await response.json();
      if (result.success) {
        alert('章节删除成功！');
        loadChapters();
        loadNovel();
      } else {
        throw new Error(result.error || '删除章节失败');
      }
    } catch (error) {
      console.error('删除章节失败:', error);
      alert(error instanceof Error ? error.message : '删除章节失败，请稍后重试');
    }
  };

  if (isLoadingNovel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">作品不存在</h2>
          <Link href="/works">
            <Button>返回作品列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/works">
            <Button variant="ghost" icon={<ArrowLeft size={18} />}>
              返回作品列表
            </Button>
          </Link>
        </div>

        {/* 作品信息卡片 */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex flex-col gap-6 md:flex-row">
              {/* 封面 */}
              <div className="flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 md:h-64 md:w-64 md:flex-shrink-0">
                <BrandIcons.Book size={96} className="text-indigo-600" />
              </div>

              {/* 作品详情 */}
              <div className="flex-1">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{novel.title}</h1>
                    <div className="flex flex-wrap gap-2">
                      <GenreBadge genre={novel.genre} />
                      <TypeBadge type={novel.type} />
                      <StatusBadge status={novel.status} />
                    </div>
                  </div>
                  <Link href={`/workspace?novelId=${novel.id}`}>
                    <GradientButton icon={<Edit size={20} />}>
                      开始创作
                    </GradientButton>
                  </Link>
                </div>

                <p className="mb-6 text-gray-700 leading-relaxed">{novel.description}</p>

                {/* 统计数据 */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <div className="flex items-center gap-2">
                    <FileText className="text-gray-500" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">总字数</p>
                      <p className="font-semibold text-gray-900">
                        {Math.round(novel.wordCount / 10000)}万
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-500" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">章节</p>
                      <p className="font-semibold text-gray-900">{novel.chapterCount}章</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">评分</p>
                      <p className="font-semibold text-gray-900">{novel.averageRating}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BrandIcons.Stats className="text-indigo-600" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">完读率</p>
                      <p className="font-semibold text-gray-900">{novel.completionRate}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BrandIcons.Calendar className="text-gray-500" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">更新</p>
                      <p className="font-semibold text-gray-900">
                        {novel.lastUpdate ? new Date(novel.lastUpdate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 章节列表 */}
        <Card>
          <CardBody>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">章节列表</h2>
              <Button
                variant="primary"
                icon={<Plus size={18} />}
                onClick={() => setShowCreateChapterModal(true)}
              >
                新建章节
              </Button>
            </div>

            {isLoadingChapters ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : chapters.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <FileText size={48} className="text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">暂无章节</h3>
                <p className="mb-6 text-gray-600">开始创建你的第一个章节吧</p>
                <Button
                  variant="primary"
                  icon={<Plus size={18} />}
                  onClick={() => setShowCreateChapterModal(true)}
                >
                  创建章节
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-indigo-600">
                          第{chapter.chapterNum}章
                        </span>
                        <h3 className="font-medium text-gray-900">{chapter.title}</h3>
                        {chapter.isPublished ? (
                          <Badge variant="success" size="sm">已发布</Badge>
                        ) : (
                          <Badge variant="info" size="sm">草稿</Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span>{chapter.wordCount}字</span>
                        <span>
                          更新于 {new Date(chapter.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/workspace?novelId=${novel.id}&chapterId=${chapter.id}`}>
                        <Button variant="ghost" size="sm" icon={<Edit size={16} />}>
                          编辑
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDeleteChapter(chapter.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 创建章节Modal */}
      <Modal
        isOpen={showCreateChapterModal}
        onClose={() => {
          if (!isCreating) {
            setShowCreateChapterModal(false);
          }
        }}
        title="创建新章节"
        size="full"
      >
        <form onSubmit={handleCreateChapter} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              章节号 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={createForm.chapterNum}
              onChange={(e) => setCreateForm({ ...createForm, chapterNum: parseInt(e.target.value) || 1 })}
              required
              fullWidth
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              章节标题 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="输入章节标题..."
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
              fullWidth
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              章节内容 <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="输入章节内容..."
              value={createForm.content}
              onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
              rows={12}
              required
              fullWidth
            />
            <p className="mt-2 text-sm text-gray-500">
              当前字数: {createForm.content.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={createForm.isPublished}
              onChange={(e) => setCreateForm({ ...createForm, isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700">
              立即发布
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isCreating) {
                  setShowCreateChapterModal(false);
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
                '创建章节'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
