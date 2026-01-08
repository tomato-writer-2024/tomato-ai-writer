'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  FileText,
  Award,
  Activity,
  RefreshCw,
  ArrowUp,
} from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';
import { Card, CardBody, StatsCard } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge, TypeBadge } from '@/components/Badge';
import { PageLoader, StatsCardSkeleton } from '@/components/Loader';
import Navigation from '@/components/Navigation';

interface WritingTrendItem {
  date: string;
  wordCount: number;
  chapterCount: number;
  qualityScore: number;
}

interface Stats {
  writingTrend: WritingTrendItem[];
  overall: {
    totalWords: number;
    totalChapters: number;
    averageQualityScore: number;
    averageCompletionRate: number;
    totalShuangdian: number;
    totalReadTime: number;
  };
  novels: {
    totalNovels: number;
    totalWords: number;
    publishedNovels: number;
    totalChapters: number;
    averageRating: number;
  };
  membership: {
    level: string;
    expireAt: string | null;
    dailyUsageCount: number;
    monthlyUsageCount: number;
    storageUsed: number;
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const days = selectedPeriod === 'week' ? 7 : 30;
      const response = await fetch(`/api/stats?days=${days}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      alert('加载统计数据失败，请刷新重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
              <div className="mt-2 h-5 w-80 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="mb-8 grid gap-4 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">数据统计</h1>
          <p className="mt-2 text-gray-600">查看您的创作数据和使用统计</p>
        </div>

        {/* 时间周期选择 */}
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={selectedPeriod === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            近7天
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            近30天
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadStats}
            isLoading={isLoading}
            icon={<RefreshCw size={16} />}
          >
            刷新
          </Button>
        </div>

        {/* 概览卡片 */}
        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <StatsCard
            title="总字数"
            value={`${((stats?.overall.totalWords || 0) / 10000).toFixed(1)}万`}
            icon={<FileText className="text-purple-600" size={24} />}
            trend={{ value: '+12%', isPositive: true }}
          />
          <StatsCard
            title="章节数量"
            value={stats?.overall.totalChapters || 0}
            icon={<FileText className="text-indigo-600" size={24} />}
            trend={{ value: '+8', isPositive: true }}
          />
          <StatsCard
            title="平均质量分"
            value={stats?.overall.averageQualityScore || 0}
            icon={<Award className="text-pink-600" size={24} />}
            trend={{ value: '+5%', isPositive: true }}
          />
          <StatsCard
            title="平均完读率"
            value={`${stats?.overall.averageCompletionRate || 0}%`}
            icon={<TrendingUp className="text-orange-600" size={24} />}
            trend={{ value: '+3%', isPositive: true }}
          />
          <StatsCard
            title="爽点总数"
            value={stats?.overall.totalShuangdian || 0}
            icon={<BarChart3 className="text-cyan-600" size={24} />}
            trend={{ value: '+25', isPositive: true }}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 写作趋势 */}
          <Card>
            <CardBody>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <BarChart3 className="text-indigo-600" size={20} />
                写作趋势
              </h3>
              <div className="space-y-3">
                {stats?.writingTrend.map((day) => {
                  const maxWords = Math.max(...stats.writingTrend.map((d) => d.wordCount));
                  const height = maxWords > 0 ? (day.wordCount / maxWords) * 100 : 0;
                  return (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 rounded-lg bg-gray-100 p-2">
                        <div
                          className="h-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                          style={{ width: `${height}%` }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <p className="text-sm font-medium text-gray-900">{day.wordCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{day.chapterCount}章</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* 质量趋势 */}
          <Card>
            <CardBody>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Award className="text-purple-600" size={20} />
                质量趋势
              </h3>
              <div className="space-y-3">
                {stats?.writingTrend.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 rounded-lg bg-gray-100 p-2">
                      <div
                        className={`h-6 rounded-lg transition-all ${
                          day.qualityScore >= 90
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : day.qualityScore >= 80
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-r from-orange-500 to-red-600'
                        }`}
                        style={{ width: `${day.qualityScore}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-900">
                      {day.qualityScore}分
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 小说统计 */}
          <Card>
            <CardBody>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <BarChart3 className="text-blue-600" size={20} />
                作品统计
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                  <p className="text-sm text-gray-600">总作品数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.novels.totalNovels || 0}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                  <p className="text-sm text-gray-600">已发布</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.novels.publishedNovels || 0}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
                  <p className="text-sm text-gray-600">总字数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((stats?.novels.totalWords || 0) / 10000).toFixed(1)}万
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-pink-50 to-orange-50 p-4">
                  <p className="text-sm text-gray-600">平均评分</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.novels.averageRating || '0.0'}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 会员信息 */}
          <Card>
            <CardBody>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Award className="text-amber-600" size={20} />
                会员信息
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">会员等级</span>
                  <Badge variant="success">{stats?.membership.level || 'FREE'}</Badge>
                </div>
                {stats?.membership.expireAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">到期时间</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(stats.membership.expireAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">今日使用次数</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.membership.dailyUsageCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">本月使用次数</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.membership.monthlyUsageCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">存储空间</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((stats?.membership.storageUsed || 0) / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
