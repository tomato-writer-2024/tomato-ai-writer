import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * 用户统计API
 */
export async function GET(request: NextRequest) {
  try {
    // 验证token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '令牌无效' },
        { status: 401 }
      );
    }

    // TODO: 实际从数据库获取用户统计数据
    // const stats = await statsManager.getUserStats(payload.userId);

    // 模拟统计数据
    const stats = {
      overview: {
        totalGenerations: 156,
        totalWords: 234000,
        avgQualityScore: 92,
        avgCompletionRate: 87,
        totalWorks: 2,
      },
      recentActivity: [
        {
          id: '1',
          type: 'generate',
          title: '生成第156章',
          wordCount: 2543,
          qualityScore: 94,
          completionRate: 91,
          createdAt: '2025-01-08T10:30:00Z',
        },
        {
          id: '2',
          type: 'polish',
          title: '润色第155章',
          wordCount: 2487,
          qualityScore: 95,
          completionRate: 89,
          createdAt: '2025-01-07T15:20:00Z',
        },
        {
          id: '3',
          type: 'continue',
          title: '续写第155章',
          wordCount: 1856,
          qualityScore: 90,
          completionRate: 85,
          createdAt: '2025-01-07T14:10:00Z',
        },
        {
          id: '4',
          type: 'generate',
          title: '生成第155章',
          wordCount: 2634,
          qualityScore: 91,
          completionRate: 88,
          createdAt: '2025-01-06T09:45:00Z',
        },
        {
          id: '5',
          type: 'polish',
          title: '润色第154章',
          wordCount: 2598,
          qualityScore: 93,
          completionRate: 90,
          createdAt: '2025-01-05T16:30:00Z',
        },
      ],
      trend: {
        daily: [
          { date: '2025-01-01', generations: 12, words: 28800 },
          { date: '2025-01-02', generations: 15, words: 36000 },
          { date: '2025-01-03', generations: 18, words: 43200 },
          { date: '2025-01-04', generations: 14, words: 33600 },
          { date: '2025-01-05', generations: 22, words: 52800 },
          { date: '2025-01-06', generations: 25, words: 60000 },
          { date: '2025-01-07', generations: 28, words: 67200 },
          { date: '2025-01-08', generations: 22, words: 52800 },
        ],
      },
      qualityTrend: [
        { date: '2025-01-01', score: 85 },
        { date: '2025-01-02', score: 87 },
        { date: '2025-01-03', score: 88 },
        { date: '2025-01-04', score: 89 },
        { date: '2025-01-05', score: 91 },
        { date: '2025-01-06', score: 90 },
        { date: '2025-01-07', score: 92 },
        { date: '2025-01-08', score: 94 },
      ],
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败，请稍后重试' },
      { status: 500 }
    );
  }
}
