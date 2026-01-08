'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ArrowDown,
} from 'lucide-react';
import BrandIcons from '@/lib/brandIcons';

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

      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      generate: { label: '生成', color: 'indigo' },
      polish: { label: '润色', color: 'purple' },
      continue: { label: '续写', color: 'pink' },
    };
    return badges[type as keyof typeof badges] || badges.generate;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'generate':
        return <BrandIcons.Writing size={16} />;
      case 'polish':
        return <Award size={16} />;
      case 'continue':
        return <BrandIcons.AI size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin text-indigo-600" size={40} />
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
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
            >
              个人中心
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">数据统计</h1>
          <p className="mt-2 text-gray-600">查看您的创作数据和使用统计</p>
        </div>

        {/* 时间周期选择 */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedPeriod === 'week'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            近7天
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedPeriod === 'month'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            近30天
          </button>
        </div>

        {/* 概览卡片 */}
        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-indigo-100 p-3">
                <Activity className="text-indigo-600" size={24} />
              </div>
              <ArrowUp className="text-green-500" size={20} />
            </div>
            <p className="mt-4 text-sm text-gray-600">总生成次数</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.overview.totalGenerations}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-purple-100 p-3">
                <FileText className="text-purple-600" size={24} />
              </div>
              <ArrowUp className="text-green-500" size={20} />
            </div>
            <p className="mt-4 text-sm text-gray-600">总字数</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stats ? (stats.overview.totalWords / 10000).toFixed(1) : 0}万
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-pink-100 p-3">
                <Award className="text-pink-600" size={24} />
              </div>
              <ArrowUp className="text-green-500" size={20} />
            </div>
            <p className="mt-4 text-sm text-gray-600">平均质量分</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.overview.avgQualityScore}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-orange-100 p-3">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <ArrowUp className="text-green-500" size={20} />
            </div>
            <p className="mt-4 text-sm text-gray-600">平均完读率</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.overview.avgCompletionRate}%</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-cyan-100 p-3">
                <BarChart3 className="text-cyan-600" size={24} />
              </div>
              <ArrowUp className="text-green-500" size={20} />
            </div>
            <p className="mt-4 text-sm text-gray-600">作品数量</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.overview.totalWorks}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 生成趋势 */}
          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <BarChart3 className="text-indigo-600" size={20} />
              生成趋势
            </h3>
            <div className="space-y-3">
              {stats?.trend.daily.map((day, index) => {
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
          </div>

          {/* 质量趋势 */}
          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Award className="text-purple-600" size={20} />
              质量趋势
            </h3>
            <div className="space-y-3">
              {stats?.qualityTrend.map((day, index) => (
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
          </div>

          {/* 最近活动 */}
          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
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
                  {stats?.recentActivity.map((activity) => {
                    const badge = getTypeBadge(activity.type);
                    return (
                      <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-${badge.color}-100 text-${badge.color}-700`}>
                            {getActivityIcon(activity.type)}
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 text-sm font-medium text-gray-900">{activity.title}</td>
                        <td className="py-3 text-sm text-gray-600">{activity.wordCount}</td>
                        <td className="py-3">
                          <span className={`text-sm font-medium ${
                            activity.qualityScore >= 90
                              ? 'text-green-600'
                              : activity.qualityScore >= 80
                              ? 'text-indigo-600'
                              : 'text-orange-600'
                          }`}>
                            {activity.qualityScore}分
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-sm font-medium ${
                            activity.completionRate >= 90
                              ? 'text-green-600'
                              : activity.completionRate >= 80
                              ? 'text-indigo-600'
                              : 'text-orange-600'
                          }`}>
                            {activity.completionRate}%
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(activity.createdAt).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
