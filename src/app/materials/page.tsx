'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Input, Textarea, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import {
  Plus,
  Search,
  Star,
  Trash2,
  Edit2,
  Copy,
  Filter,
  Folder,
  BookOpen,
  Zap,
  Sparkles,
  Download,
  RefreshCw,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';

interface Material {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  notes: string;
  novelId: string | null;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MaterialStats {
  total: number;
  byCategory: Record<string, number>;
  favorites: number;
}

const categories = [
  { value: 'character', label: '人物设定' },
  { value: 'plot', label: '剧情创意' },
  { value: 'scene', label: '场景描写' },
  { value: 'dialogue', label: '对话模板' },
  { value: 'ending', label: '结尾设计' },
  { value: 'opening', label: '开头模板' },
  { value: 'setting', label: '世界观' },
  { value: 'general', label: '通用素材' },
];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState<MaterialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    notes: '',
    novelId: '',
  });

  useEffect(() => {
    fetchMaterials();
    fetchStats();
  }, [searchQuery, selectedCategory, showFavoriteOnly]);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (showFavoriteOnly) params.append('isFavorite', 'true');

      const response = await fetch(`/api/materials?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMaterials(result.data);
        }
      }
    } catch (error) {
      console.error('获取素材列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/materials/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          novelId: formData.novelId || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setShowCreateModal(false);
          resetForm();
          fetchMaterials();
          fetchStats();
          alert('创建成功！');
        } else {
          throw new Error(result.error || '创建失败');
        }
      }
    } catch (error) {
      console.error('创建素材失败:', error);
      alert(error instanceof Error ? error.message : '创建失败');
    }
  };

  const handleUpdate = async () => {
    if (!editingMaterial) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/materials/${editingMaterial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          novelId: formData.novelId || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEditingMaterial(null);
          resetForm();
          fetchMaterials();
          alert('更新成功！');
        } else {
          throw new Error(result.error || '更新失败');
        }
      }
    } catch (error) {
      console.error('更新素材失败:', error);
      alert(error instanceof Error ? error.message : '更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个素材吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchMaterials();
        fetchStats();
        alert('删除成功！');
      }
    } catch (error) {
      console.error('删除素材失败:', error);
      alert('删除失败');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/materials/${id}/toggle-favorite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchMaterials();
        fetchStats();
      }
    } catch (error) {
      console.error('切换收藏失败:', error);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
    setEditingMaterial(null);
  };

  const openEditModal = (material: Material) => {
    setFormData({
      title: material.title,
      content: material.content,
      category: material.category,
      tags: material.tags.join(', '),
      notes: material.notes,
      novelId: material.novelId || '',
    });
    setEditingMaterial(material);
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      tags: '',
      notes: '',
      novelId: '',
    });
  };

  const handleExport = async () => {
    try {
      const content = materials.map(m => `
=== ${m.title} ===
分类: ${categories.find(c => c.value === m.category)?.label || m.category}
标签: ${m.tags.join(', ')}
${m.content}
`).join('\n');

      const response = await fetch('/api/files/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          format: 'txt',
          filename: '素材库导出',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.url) {
          window.open(result.data.url, '_blank');
        }
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 头部 */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              <Sparkles className="mr-2 inline text-cyan-600" size={32} />
              素材库
            </h1>
            <p className="mt-2 text-slate-600">管理你的创作素材，随时复用</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={<Download size={18} />}
              onClick={handleExport}
            >
              导出
            </Button>
            <GradientButton
              icon={<Plus size={18} />}
              onClick={openCreateModal}
            >
              新建素材
            </GradientButton>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="mb-8 grid gap-6 sm:grid-cols-3">
            <Card hover>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                    <Folder size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">总素材数</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <Star size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">收藏数</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.favorites}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">使用分类</p>
                    <p className="text-2xl font-bold text-slate-900">{Object.keys(stats.byCategory).length}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    placeholder="搜索素材..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select
                  options={[{ value: '', label: '全部分类' }, ...categories]}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="min-w-[150px]"
                />
                <Button
                  variant={showFavoriteOnly ? 'secondary' : 'outline'}
                  icon={<Star size={18} />}
                  onClick={() => setShowFavoriteOnly(!showFavoriteOnly)}
                  className={showFavoriteOnly ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                >
                  {showFavoriteOnly ? '仅收藏' : '全部'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 素材列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-600" size={40} />
          </div>
        ) : materials.length === 0 ? (
          <Card>
            <CardBody>
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <BookOpen className="text-slate-400" size={40} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">暂无素材</h3>
                <p className="mb-4 text-slate-600">点击右上角"新建素材"开始创建</p>
                <GradientButton onClick={openCreateModal}>新建素材</GradientButton>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id} hover>
                <CardBody>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" size="sm">
                          {categories.find(c => c.value === material.category)?.label || material.category}
                        </Badge>
                        {material.isFavorite && (
                          <Star size={16} className="fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                        {material.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(material.id)}
                      className="ml-2 flex-shrink-0 text-slate-400 hover:text-amber-500"
                    >
                      <Star
                        size={18}
                        className={material.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                      />
                    </button>
                  </div>
                  <p className="mb-3 text-sm text-slate-600 line-clamp-3">
                    {material.content}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-1">
                    {material.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {material.tags.length > 3 && (
                      <Badge variant="outline" size="sm">
                        +{material.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="mb-4 text-xs text-slate-500">
                    使用 {material.usageCount} 次
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Copy size={16} />}
                      onClick={() => handleCopyContent(material.content)}
                      className="flex-1"
                    >
                      复制
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit2 size={16} />}
                      onClick={() => openEditModal(material)}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete(material.id)}
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 创建/编辑素材弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardBody>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingMaterial ? '编辑素材' : '新建素材'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    标题
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="请输入标题"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    分类
                  </label>
                  <Select
                    options={categories}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    内容
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="请输入素材内容"
                    rows={10}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    标签（用逗号分隔）
                  </label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="例如：主角, 升级, 奇遇"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    备注
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="可选：添加备注"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    取消
                  </Button>
                  <GradientButton
                    onClick={editingMaterial ? handleUpdate : handleCreate}
                    icon={<Check size={18} />}
                  >
                    {editingMaterial ? '保存' : '创建'}
                  </GradientButton>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
