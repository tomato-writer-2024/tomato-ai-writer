/**
 * 个性化推荐 API
 * 基于用户行为数据提供个性化推荐
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';

interface UserBehavior {
  toolId: string;
  frequency: number;
  lastUsed: Date;
  avgRating?: number;
  timeSpent?: number;
}

interface RecommendationResult {
  toolId: string;
  toolName: string;
  category: string;
  score: number;
  reason: string;
}

/**
 * 收集用户行为数据
 */
async function collectUserBehavior(userId: number): Promise<UserBehavior[]> {
  const pool = getPool();

  // 获取用户使用工具的频率
  const frequencyResult = await pool.query(
    `SELECT
      tool_id as "toolId",
      COUNT(*) as frequency,
      MAX(created_at) as "lastUsed",
      AVG(rating) as "avgRating",
      AVG(time_spent) as "timeSpent"
    FROM user_activity_logs
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY tool_id
    ORDER BY frequency DESC`,
    [userId]
  );

  return frequencyResult.rows as UserBehavior[];
}

/**
 * 计算推荐分数
 */
function calculateRecommendationScore(
  behavior: UserBehavior,
  toolData: any,
  userInterests: string[]
): number {
  let score = 0;

  // 基于使用频率 (30%)
  score += Math.min(behavior.frequency / 10, 1) * 30;

  // 基于最近使用时间 (20%)
  const daysSinceLastUse = Math.floor(
    (Date.now() - behavior.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
  );
  score += Math.max(0, (1 - daysSinceLastUse / 30)) * 20;

  // 基于评分 (20%)
  if (behavior.avgRating) {
    score += (behavior.avgRating / 5) * 20;
  }

  // 基于停留时间 (10%)
  if (behavior.timeSpent) {
    score += Math.min(behavior.timeSpent / 300, 1) * 10; // 5分钟为满分
  }

  // 基于用户兴趣 (20%)
  if (userInterests.includes(toolData.category)) {
    score += 20;
  }

  // 新工具加分 (10%)
  if (toolData.isNew) {
    score += 10;
  }

  // 热门工具加分 (10%)
  if (toolData.isHot) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * 获取用户兴趣标签
 */
async function getUserInterests(userId: number): Promise<string[]> {
  const pool = getPool();

  // 从用户偏好获取兴趣
  const preferencesResult = await pool.query(
    `SELECT interests FROM user_preferences WHERE user_id = $1`,
    [userId]
  );

  if (preferencesResult.rows.length > 0) {
    return preferencesResult.rows[0].interests || [];
  }

  // 从用户行为推断兴趣
  const behaviorResult = await pool.query(
    `SELECT
      tc.id as category_id,
      tc.name as category_name,
      COUNT(*) as usage_count
    FROM user_activity_logs ual
    JOIN tool_categories tc ON ual.category_id = tc.id
    WHERE ual.user_id = $1
      AND ual.created_at > NOW() - INTERVAL '60 days'
    GROUP BY tc.id, tc.name
    ORDER BY usage_count DESC
    LIMIT 5`,
    [userId]
  );

  return behaviorResult.rows.map((row: any) => row.category_name);
}

/**
 * 生成个性化推荐
 */
async function generateRecommendations(
  userId: number,
  limit: number = 10
): Promise<RecommendationResult[]> {
  const pool = getPool();

  // 收集用户行为数据
  const userBehaviors = await collectUserBehavior(userId);

  // 获取用户兴趣
  const userInterests = await getUserInterests(userId);

  // 获取所有可用工具
  const toolsResult = await pool.query(
    `SELECT
      t.id as tool_id,
      t.name as tool_name,
      t.category_id,
      t.is_new as "isNew",
      t.is_hot as "isHot",
      tc.name as category_name
    FROM tools t
    JOIN tool_categories tc ON t.category_id = tc.id
    WHERE t.is_active = true`
  );

  const recommendations: RecommendationResult[] = [];

  for (const tool of toolsResult.rows) {
    const behavior = userBehaviors.find(
      (b: UserBehavior) => b.toolId === tool.tool_id
    );

    let score = 0;
    let reason = '';

    if (behavior) {
      // 用户使用过的工具
      score = calculateRecommendationScore(
        behavior,
        tool,
        userInterests
      );

      if (behavior.frequency > 5) {
        reason = '基于您的使用习惯';
      } else if (behavior.avgRating && behavior.avgRating >= 4) {
        reason = '您曾经给此工具高评分';
      } else {
        reason = '您最近使用过';
      }
    } else {
      // 用户未使用过的工具
      // 基于兴趣和热门程度推荐
      if (userInterests.includes(tool.category_name)) {
        score = 60 + Math.random() * 20;
        reason = '基于您的创作兴趣';
      } else if (tool.isHot) {
        score = 50 + Math.random() * 20;
        reason = '热门工具';
      } else if (tool.isNew) {
        score = 55 + Math.random() * 15;
        reason = '新功能上线';
      } else {
        score = 30 + Math.random() * 20;
        reason = '为您推荐';
      }
    }

    recommendations.push({
      toolId: tool.tool_id,
      toolName: tool.tool_name,
      category: tool.category_name,
      score: Math.round(score),
      reason,
    });
  }

  // 按分数排序并返回前N个
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.slice(0, limit);
}

/**
 * GET /api/recommendation
 * 获取个性化推荐
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = token.userId;

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');

    // 生成推荐
    let recommendations = await generateRecommendations(userId, limit * 2); // 生成更多以便过滤

    // 如果指定了分类，只返回该分类的推荐
    if (category) {
      recommendations = recommendations.filter((r) => r.category === category);
    }

    // 限制返回数量
    recommendations = recommendations.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        total: recommendations.length,
      },
    });
  } catch (error) {
    console.error('获取推荐失败:', error);
    return NextResponse.json(
      { success: false, error: '获取推荐失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendation
 * 记录用户对推荐的反馈
 */
export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = token.userId;
    const body = await request.json();
    const { toolId, action, reason } = body;

    // 验证参数
    if (!toolId || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // 记录反馈
    await pool.query(
      `INSERT INTO recommendation_feedbacks
        (user_id, tool_id, action, reason, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, toolId, action, reason]
    );

    return NextResponse.json({
      success: true,
      message: '反馈已记录',
    });
  } catch (error) {
    console.error('记录反馈失败:', error);
    return NextResponse.json(
      { success: false, error: '记录反馈失败' },
      { status: 500 }
    );
  }
}
