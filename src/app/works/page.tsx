'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandIcons from '@/lib/brandIcons';
import Button, { GradientButton } from '@/components/Button';
import Card, { CardBody, FeatureCard } from '@/components/Card';
import { Input, Select } from '@/components/Input';
import { Badge, StatusBadge, MembershipBadge, GenreBadge, TypeBadge } from '@/components/Badge';
import Navigation from '@/components/Navigation';
import { Plus, MoreVertical, Edit, Trash2, Eye, Star, Clock, FileText, Calendar } from 'lucide-react';

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
}

const mockNovels: Novel[] = [
  {
    id: '1',
    title: '神豪从签到开始',
    genre: '都市',
    status: '连载中',
    type: '爽文',
    wordCount: 128500,
    chapterCount: 52,
    lastUpdate: '2024-01-15',
    averageRating: 9.2,
    completionRate: 85,
    membership: 'PREMIUM',
    description: '获得签到系统，开局奖励一千万，从此走上人生巅峰...',
  },
  {
    id: '2',
    title: '我成了反派大师兄',
    genre: '玄幻',
    status: '连载中',
    type: '爽文',
    wordCount: 89600,
    chapterCount: 38,
    lastUpdate: '2024-01-14',
    averageRating: 8.8,
    completionRate: 78,
    membership: 'BASIC',
    description: '穿越成为反派大师兄，我决定逆天改命，成为真正的强者...',
  },
  {
    id: '3',
    title: '偏执顾总的小娇妻',
    genre: '言情',
    status: '连载中',
    type: '甜宠',
    wordCount: 67200,
    chapterCount: 28,
    lastUpdate: '2024-01-13',
    averageRating: 9.5,
    completionRate: 92,
    membership: 'PREMIUM',
    description: '被继母卖给顾家抵债，没想到顾总竟然是暗恋自己多年的那个人...',
  },
  {
    id: '4',
    title: '末日生存：我有无限物资',
    genre: '科幻',
    status: '已完结',
    type: '爽文',
    wordCount: 345000,
    chapterCount: 138,
    lastUpdate: '2023-12-30',
    averageRating: 9.0,
    completionRate: 88,
    membership: 'ENTERPRISE',
    description: '重生回到末日爆发前，激活无限物资系统，这一世我要做最强幸存者...',
  },
  {
    id: '5',
    title: '绝世剑神',
    genre: '玄幻',
    status: '连载中',
    type: '爽文',
    wordCount: 234000,
    chapterCount: 98,
    lastUpdate: '2024-01-12',
    averageRating: 8.5,
    completionRate: 75,
    membership: 'FREE',
    description: '从废柴少年到绝世剑神，我用手中的剑劈开一切阻碍...',
  },
  {
    id: '6',
    title: '神秘档案',
    genre: '悬疑',
    status: '暂停',
    type: '悬疑',
    wordCount: 45000,
    chapterCount: 18,
    lastUpdate: '2024-01-10',
    averageRating: 7.8,
    completionRate: 65,
    membership: 'BASIC',
    description: '一件离奇失踪案，牵扯出一个尘封已久的秘密...',
  },
];

export default function WorksPage() {
  const [novels] = useState<Novel[]>(mockNovels);
  const [filterGenre, setFilterGenre] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const genres = ['全部', '都市', '玄幻', '言情', '科幻', '悬疑', '历史', '军事'];
  const statuses = ['全部', '连载中', '已完结', '暂停'];

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
          <GradientButton icon={<Plus size={20} />} iconPosition="right">
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
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{novel.title}</h3>
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
                      variant="outline"
                      size="sm"
                      icon={<Trash2 size={16} />}
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
                            <p className="font-medium text-gray-900">{novel.title}</p>
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
        {filteredNovels.length === 0 && (
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
                <GradientButton icon={<Plus size={20} />} iconPosition="right">
                  创建新作品
                </GradientButton>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
