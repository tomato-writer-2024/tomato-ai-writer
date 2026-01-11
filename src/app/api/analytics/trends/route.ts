/**
 * 创作趋势分析 API
 * 提供写作字数趋势、工具使用趋势、分类统计等数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * GET /api/analytics/trends
 * 获取创作趋势数据
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token无效' }, { status: 401 });
    }

    const userId = payload.userId;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // 写作字数趋势
    const wordCountTrend = await db.query(
      `SELECT
        DATE(created_at) as date,
        SUM(word_count) as total_words
      FROM chapters
      WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [userId]
    );

    // 工具使用趋势
    const toolUsageTrend = await db.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as usage_count
      FROM user_tool_usage
      WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [userId]
    );

    // 分类统计
    const categoryStats = await db.query(
      `SELECT
        category,
        COUNT(*) as usage_count,
        AVG(rating) as avg_rating
      FROM user_tool_usage
      WHERE user_id = $1
      GROUP BY category
      ORDER BY usage_count DESC`,
      [userId]
    );

    // 完读率变化趋势
    const completionRateTrend = await db.query(
      `SELECT
        DATE(created_at) as date,
        AVG(completion_rate) as avg_completion_rate
      FROM chapters
      WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        wordCountTrend: wordCountTrend.rows,
        toolUsageTrend: toolUsageTrend.rows,
        categoryStats: categoryStats.rows,
        completionRateTrend: completionRateTrend.rows,
      },
    });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    return NextResponse.json(
      { error: '获取趋势数据失败' },
      { status: 500 }
    );
  }
}
