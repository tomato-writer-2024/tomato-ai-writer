/**
 * 创作趋势分析 API
 * 提供数据可视化和趋势分析
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';

interface TrendData {
  date: string;
  value: number;
  label?: string;
}

interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface MetricCard {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
}

/**
 * 获取写作字数趋势
 */
async function getWritingTrends(
  userId: number,
  days: number = 30
): Promise<TrendData[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT
      DATE(created_at) as date,
      SUM(word_count) as value
    FROM user_activity_logs
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '${days} days'
      AND action_type = 'write'
    GROUP BY DATE(created_at)
    ORDER BY date ASC`,
    [userId]
  );

  return result.rows;
}

/**
 * 获取工具使用趋势
 */
async function getToolUsageTrends(
  userId: number,
  days: number = 30
): Promise<TrendData[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT
      DATE(created_at) as date,
      COUNT(*) as value
    FROM user_activity_logs
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC`,
    [userId]
  );

  return result.rows;
}

/**
 * 获取分类使用统计
 */
async function getCategoryStats(
  userId: number
): Promise<CategoryStats[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT
      tc.name as category,
      COUNT(*) as count,
      LAG(COUNT(*)) OVER (ORDER BY tc.name) as prev_count
    FROM user_activity_logs ual
    JOIN tool_categories tc ON ual.category_id = tc.id
    WHERE ual.user_id = $1
      AND ual.created_at > NOW() - INTERVAL '30 days'
    GROUP BY tc.name
    ORDER BY count DESC`,
    [userId]
  );

  const total = result.rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0);

  return result.rows.map((row: any) => {
    const count = parseInt(row.count);
    const prevCount = row.prev_count ? parseInt(row.prev_count) : count;
    const change = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 0;

    return {
      category: row.category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      change: Math.round(change),
    };
  });
}

/**
 * 获取关键指标卡片
 */
async function getMetricCards(userId: number): Promise<MetricCard[]> {
  const pool = getPool();

  // 总字数
  const totalWordsResult = await pool.query(
    `SELECT SUM(word_count) as total_words
    FROM user_activity_logs
    WHERE user_id = $1
      AND action_type = 'write'`,
    [userId]
  );

  // 本月字数
  const monthWordsResult = await pool.query(
    `SELECT SUM(word_count) as month_words
    FROM user_activity_logs
    WHERE user_id = $1
      AND action_type = 'write'
      AND created_at > NOW() - INTERVAL '30 days'`,
    [userId]
  );

  // 上月字数（用于计算增长）
  const prevMonthWordsResult = await pool.query(
    `SELECT SUM(word_count) as prev_month_words
    FROM user_activity_logs
    WHERE user_id = $1
      AND action_type = 'write'
      AND created_at > NOW() - INTERVAL '60 days'
      AND created_at <= NOW() - INTERVAL '30 days'`,
    [userId]
  );

  // 今日字数
  const todayWordsResult = await pool.query(
    `SELECT SUM(word_count) as today_words
    FROM user_activity_logs
    WHERE user_id = $1
      AND action_type = 'write'
      AND DATE(created_at) = CURRENT_DATE`,
    [userId]
  );

  // 活跃天数
  const activeDaysResult = await pool.query(
    `SELECT COUNT(DISTINCT DATE(created_at)) as active_days
    FROM user_activity_logs
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '30 days'`,
    [userId]
  );

  const totalWords = parseInt(totalWordsResult.rows[0].total_words) || 0;
  const monthWords = parseInt(monthWordsResult.rows[0].month_words) || 0;
  const prevMonthWords = parseInt(prevMonthWordsResult.rows[0].prev_month_words) || 0;
  const todayWords = parseInt(todayWordsResult.rows[0].today_words) || 0;
  const activeDays = parseInt(activeDaysResult.rows[0].active_days) || 0;

  // 计算增长率
  const monthChange = prevMonthWords > 0
    ? ((monthWords - prevMonthWords) / prevMonthWords) * 100
    : 0;

  // 昨日字数（用于今日变化）
  const yesterdayWordsResult = await pool.query(
    `SELECT SUM(word_count) as yesterday_words
    FROM user_activity_logs
    WHERE user_id = $1
      AND action_type = 'write'
      AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`,
    [userId]
  );

  const yesterdayWords = parseInt(yesterdayWordsResult.rows[0].yesterday_words) || 0;
  const todayChange = yesterdayWords > 0
    ? ((todayWords - yesterdayWords) / yesterdayWords) * 100
    : 0;

  return [
    {
      title: '累计字数',
      value: totalWords,
      change: 0,
      trend: 'stable',
      unit: '字',
    },
    {
      title: '本月创作',
      value: monthWords,
      change: Math.round(monthChange),
      trend: monthChange > 0 ? 'up' : monthChange < 0 ? 'down' : 'stable',
      unit: '字',
    },
    {
      title: '今日创作',
      value: todayWords,
      change: Math.round(todayChange),
      trend: todayChange > 0 ? 'up' : todayChange < 0 ? 'down' : 'stable',
      unit: '字',
    },
    {
      title: '活跃天数',
      value: activeDays,
      change: 0,
      trend: 'stable',
      unit: '天',
    },
  ];
}

/**
 * 获取创作时间分布
 */
async function getTimeDistribution(userId: number): Promise<TrendData[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT
      EXTRACT(HOUR FROM created_at)::int as hour,
      COUNT(*) as value
    FROM user_activity_logs
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY hour
    ORDER BY hour ASC`,
    [userId]
  );

  return result.rows.map((row: any) => ({
    date: `${row.hour}:00`,
    value: parseInt(row.value),
    label: `${row.hour}:00-${row.hour + 1}:00`,
  }));
}

/**
 * 获取完读率趋势
 */
async function getCompletionRateTrends(
  userId: number,
  days: number = 30
): Promise<TrendData[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT
      DATE(created_at) as date,
      AVG(completion_rate) as value
    FROM user_works
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC`,
    [userId]
  );

  return result.rows.map((row: any) => ({
    date: row.date,
    value: Math.round((parseFloat(row.value) || 0) * 100),
  }));
}

/**
 * GET /api/analytics/trends
 * 获取趋势分析数据
 */
export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = token.userId;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const days = parseInt(searchParams.get('days') || '30');

    const data: any = {};

    switch (type) {
      case 'writing':
        data.writingTrends = await getWritingTrends(userId, days);
        break;
      case 'usage':
        data.usageTrends = await getToolUsageTrends(userId, days);
        break;
      case 'category':
        data.categoryStats = await getCategoryStats(userId);
        break;
      case 'metrics':
        data.metricCards = await getMetricCards(userId);
        break;
      case 'time':
        data.timeDistribution = await getTimeDistribution(userId);
        break;
      case 'completion':
        data.completionTrends = await getCompletionRateTrends(userId, days);
        break;
      case 'all':
      default:
        data.writingTrends = await getWritingTrends(userId, days);
        data.usageTrends = await getToolUsageTrends(userId, days);
        data.categoryStats = await getCategoryStats(userId);
        data.metricCards = await getMetricCards(userId);
        data.timeDistribution = await getTimeDistribution(userId);
        data.completionTrends = await getCompletionRateTrends(userId, days);
        break;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('获取趋势分析失败:', error);
    return NextResponse.json(
      { success: false, error: '获取趋势分析失败' },
      { status: 500 }
    );
  }
}
