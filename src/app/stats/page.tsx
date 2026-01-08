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

interface Stats {
  overview: {
    totalGenerations: number;
    totalWords: number;
    avgQualityScore: number;
    avgCompletionRate: number;
    totalWorks: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'generate' | 'polish' | 'continue';
    title: string;
    wordCount: number;
    qualityScore: number;
    completionRate: number;
    createdAt: string;
  }>;
  trend: {
    daily: Array<{ date: string; generations: number; words: number }>;
  };
  qualityTrend: Array<{ date: string; score: number }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // TODO: 实际调用API获取统计数据
      // const response = await fetch('/api/stats', {
      //   headers: { 'Authorization': `Bearer ${token}` },
      // });
      // if (!response.ok) {
      //   throw new Error('获取统计数据失败');
      // }
      // const data = await response.json();
      // setStats(data.data);

      // 模拟数据
      setStats({
        overview: {
          totalGenerations: 156,
          totalWords: 234000,
          avgQualityScore: 87,
          avgCompletionRate: 85,
          totalWorks: 3,
        },
        recentActivity: [
          {
            id: '1',
            type: 'generate',
            title: '都市超级神医 第156章',
            wordCount: 2500,
            qualityScore: 92,
            completionRate: 88,
            createdAt: '2025-01-08T10:30:00',
          },
          {
            id: '2',
            type: 'polish',
            title: '末世之无敌系统 第89章',
            wordCount: 2200,
            qualityScore: 85,
            completionRate: 82,
            createdAt: '2025-01-07T15:20:00',
          },
          {
            id: '3',
            type: 'continue',
            title: '都市超级神医 第155章',
            wordCount: 1800,
            qualityScore: 90,
            completionRate: 85,
            createdAt: '2025-01-07T09:10:00',
          },
        ],
        trend: {
          daily: [
            { date: '2025-01-02', generations: 15, words: 25000 },
            { date: '2025-01-03', generations: 20, words: 32000 },
            { date: '2025-01-04', generations: 18, words: 28000 },
            { date: '2025-01-05', generations: 22, words: 35000 },
            { date: '2025-01-06', generations: 25, words: 40000 },
            { date: '2025-01-07', generations: 28, words: 42000 },
            { date: '2025-01-08', generations: 28, words: 72000 },
          ],
        },
        qualityTrend: [
          { date: '2025-01-02', score: 82 },
          { date: '2025-01-03', score: 84 },
          { date: '2025-01-04', score: 83 },
          { date: '2025-01-05', score: 86 },
          { date: '2025-01-06', score: 85 },
          { date: '2025-01-07', score: 88 },
          { date: '2025-01-08', score: 87 },
        ],
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
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
            title="总生成次数"
            value={stats?.overview.totalGenerations || 0}
            icon={<Activity className="text-indigo-600" size={24} />}
            trend={{ value: '12%', isPositive: true }}
          />
          <StatsCard
            title="总字数"
            value={`${(stats?.overview.totalWords || 0 / 10000).toFixed(1)}万`}
            icon={<FileText className="text-purple-600" size={24} />}
            trend={{ value: '8%', isPositive: true }}
          />
          <StatsCard
            title="平均质量分"
            value={stats?.overview.avgQualityScore || 0}
            icon={<Award className="text-pink-600" size={24} />}
            trend={{ value: '5%', isPositive: true }}
          />
          <StatsCard
            title="平均完读率"
            value={`${stats?.overview.avgCompletionRate || 0}%`}
            icon={<TrendingUp className="text-orange-600" size={24} />}
            trend={{ value: '3%', isPositive: true }}
          />
          <StatsCard
            title="作品数量"
            value={stats?.overview.totalWorks || 0}
            icon={<BarChart3 className="text-cyan-600" size={24} />}
            trend={{ value: '1', isPositive: true }}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 生成趋势 */}
          <Card>
            <CardBody>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <BarChart3 className="text-indigo-600" size={20} />
                生成趋势
              </h3>
              <div className="space-y-3">
                {stats?.trend.daily.map((day) => {
                  const maxWords = Math.max(...stats.trend.daily.map((d) => d.words));
                  const height = (day.words / maxWords) * 100;
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
                        <p className="text-sm font-medium text-gray-900">{day.words.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{day.generations}次</p>
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
                {stats?.qualityTrend.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 rounded-lg bg-gray-100 p-2">
                      <div
                        className={`h-6 rounded-lg transition-all ${
                          day.score >= 90
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : day.score >= 80
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-r from-orange-500 to-red-600'
                        }`}
                        style={{ width: `${day.score}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-900">
                      {day.score}分
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 最近活动 */}
          <Card className="lg:col-span-2">
            <CardBody>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Activity className="text-pink-600" size={20} />
                最近活动
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-left text-sm font-medium text-gray-600">类型</th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-600">标题</th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-600">字数</th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-600">质量分</th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-600">完读率</th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-600">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentActivity.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">
                          <TypeBadge type={activity.type} />
                        </td>
                        <td className="py-3 text-sm font-medium text-gray-900">{activity.title}</td>
                        <td className="py-3 text-sm text-gray-600">{activity.wordCount.toLocaleString()}</td>
                        <td className="py-3">
                          <Badge
                            variant={activity.qualityScore >= 90 ? 'success' : activity.qualityScore >= 80 ? 'info' : 'warning'}
                          >
                            {activity.qualityScore}分
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={activity.completionRate >= 90 ? 'success' : activity.completionRate >= 80 ? 'info' : 'warning'}
                          >
                            {activity.completionRate}%
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(activity.createdAt).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
