/**
 * 个性化推荐 API
 * 基于用户行为数据实现协同过滤算法
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

interface UserBehavior {
  userId: number;
  toolId: string;
  useCount: number;
  lastUsedAt: Date;
  rating?: number;
  duration?: number; // 使用时长（秒）
}

interface UserInterest {
  category: string;
  score: number;
}

interface Recommendation {
  toolId: string;
  name: string;
  description: string;
  category: string;
  score: number;
  reason: string;
}

/**
 * 获取用户行为数据
 */
async function getUserBehavior(userId: number): Promise<UserBehavior[]> {
  const result = await db.query(
    `SELECT
      tool_id,
      COUNT(*) as use_count,
      MAX(created_at) as last_used_at,
      AVG(rating) as avg_rating,
      AVG(duration) as avg_duration
    FROM user_tool_usage
    WHERE user_id = $1
    GROUP BY tool_id
    ORDER BY use_count DESC, last_used_at DESC`,
    [userId]
  );

  return result.rows.map((row) => ({
    userId,
    toolId: row.tool_id,
    useCount: parseInt(row.use_count),
    lastUsedAt: row.last_used_at,
    rating: row.avg_rating ? parseFloat(row.avg_rating) : undefined,
    duration: row.avg_duration ? parseFloat(row.avg_duration) : undefined,
  }));
}

/**
 * 分析用户兴趣标签
 */
function analyzeUserInterests(
  behaviors: UserBehavior[]
): Map<string, number> {
  const interests = new Map<string, number>();

  behaviors.forEach((behavior) => {
    // 根据工具ID提取分类（假设工具ID格式为 "category-toolname"）
    const category = behavior.toolId.split('-')[0] || 'general';

    // 计算兴趣分数
    let score = behavior.useCount * 10;
    if (behavior.rating) {
      score += behavior.rating * 20;
    }
    if (behavior.duration) {
      score += Math.min(behavior.duration / 60, 30); // 最多加30分
    }

    // 时间衰减因子（最近使用的权重更高）
    const daysSinceLastUse =
      (Date.now() - behavior.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);
    score *= Math.exp(-daysSinceLastUse / 30); // 30天半衰期

    interests.set(category, (interests.get(category) || 0) + score);
  });

  // 归一化
  const maxScore = Math.max(...interests.values(), 1);
  interests.forEach((score, category) => {
    interests.set(category, score / maxScore);
  });

  return interests;
}

/**
 * 协同过滤算法
 * 找到相似用户，推荐他们喜欢但当前用户未使用的工具
 */
async function collaborativeFiltering(
  userId: number,
  behaviors: UserBehavior[],
  topN: number = 5
): Promise<Recommendation[]> {
  // 获取相似用户
  const similarUsers = await db.query(
    `WITH user_behaviors AS (
      SELECT
        user_id,
        tool_id,
        COUNT(*) as use_count,
        AVG(rating) as avg_rating
      FROM user_tool_usage
      WHERE user_id != $1
      GROUP BY user_id, tool_id
    ),
    similarity AS (
      SELECT
        ub1.user_id as user1,
        ub2.user_id as user2,
        SUM(ub1.use_count * ub2.use_count) /
          (SQRT(SUM(ub1.use_count * ub1.use_count)) *
           SQRT(SUM(ub2.use_count * ub2.use_count))) as similarity
      FROM user_behaviors ub1
      CROSS JOIN user_behaviors ub2
      WHERE ub1.user_id = $1
      GROUP BY ub1.user_id, ub2.user_id
      HAVING COUNT(*) >= 2
    )
    SELECT
      su.user2 as user_id,
      su.similarity
    FROM similarity su
    ORDER BY su.similarity DESC
    LIMIT 10`,
    [userId]
  );

  const similarUserIds = similarUsers.rows
    .filter((row) => parseFloat(row.similarity) > 0.3)
    .map((row) => parseInt(row.user_id));

  if (similarUserIds.length === 0) {
    return [];
  }

  // 获取相似用户常用但当前用户未使用的工具
  const recommendations = await db.query(
    `SELECT
      ut.tool_id,
      ut.name,
      ut.description,
      ut.category,
      COUNT(*) as use_count,
      AVG(rating) as avg_rating
    FROM user_tool_usage u
    JOIN tools ut ON u.tool_id = ut.tool_id
    WHERE u.user_id = ANY($1)
      AND u.tool_id NOT IN (
        SELECT DISTINCT tool_id
        FROM user_tool_usage
        WHERE user_id = $2
      )
    GROUP BY ut.tool_id, ut.name, ut.description, ut.category
    ORDER BY use_count DESC, avg_rating DESC
    LIMIT $3`,
    [similarUserIds, userId, topN]
  );

  return recommendations.rows.map((row) => ({
    toolId: row.tool_id,
    name: row.name,
    description: row.description,
    category: row.category,
    score: parseInt(row.use_count) * 0.5 + parseFloat(row.avg_rating) * 0.5,
    reason: '与您创作风格相似的作者也在使用',
  }));
}

/**
 * 内容推荐算法
 * 基于用户兴趣推荐同分类的工具
 */
async function contentBasedFiltering(
  interests: Map<string, number>,
  topN: number = 5
): Promise<Recommendation[]> {
  const sortedCategories = Array.from(interests.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const recommendations: Recommendation[] = [];

  for (const [category, score] of sortedCategories) {
    const tools = await db.query(
      `SELECT
        tool_id,
        name,
        description,
        category
      FROM tools
      WHERE category = $1
        AND is_active = true
      ORDER BY popularity DESC
      LIMIT $2`,
      [category, Math.ceil(topN / sortedCategories.length)]
    );

    tools.rows.forEach((tool) => {
      recommendations.push({
        toolId: tool.tool_id,
        name: tool.name,
        description: tool.description,
        category: tool.category,
        score: score * 100,
        reason: `符合您对${category}类工具的偏好`,
      });
    });
  }

  return recommendations.slice(0, topN);
}

/**
 * 混合推荐算法
 * 结合协同过滤和内容推荐
 */
async function hybridRecommendation(
  userId: number,
  topN: number = 10
): Promise<Recommendation[]> {
  const behaviors = await getUserBehavior(userId);
  const interests = analyzeUserInterests(behaviors);

  const collaborativeRecs = await collaborativeFiltering(userId, behaviors, Math.ceil(topN / 2));
  const contentRecs = await contentBasedFiltering(interests, Math.ceil(topN / 2));

  // 合并并去重
  const allRecs = [...collaborativeRecs, ...contentRecs];
  const uniqueRecs = new Map<string, Recommendation>();

  allRecs.forEach((rec) => {
    if (!uniqueRecs.has(rec.toolId) || uniqueRecs.get(rec.toolId)!.score < rec.score) {
      uniqueRecs.set(rec.toolId, rec);
    }
  });

  // 按分数排序并返回topN
  return Array.from(uniqueRecs.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * GET /api/recommendation
 * 获取个性化推荐
 */
export async function GET(request: NextRequest) {
  try {
    // 验证token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'hybrid'; // hybrid, collaborative, content

    let recommendations: Recommendation[] = [];

    switch (type) {
      case 'collaborative':
        const behaviors = await getUserBehavior(userId);
        recommendations = await collaborativeFiltering(userId, behaviors, limit);
        break;
      case 'content':
        const interests = analyzeUserInterests(await getUserBehavior(userId));
        recommendations = await contentBasedFiltering(interests, limit);
        break;
      case 'hybrid':
      default:
        recommendations = await hybridRecommendation(userId, limit);
        break;
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('获取推荐失败:', error);
    return NextResponse.json(
      { error: '获取推荐失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendation/feedback
 * 提交推荐反馈
 */
export async function POST(request: NextRequest) {
  try {
    // 验证token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      );
    }

    const userId = payload.userId;
    const { toolId, feedback } = await request.json();

    // 记录反馈
    await db.query(
      `INSERT INTO recommendation_feedback
       (user_id, tool_id, feedback, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, tool_id)
       DO UPDATE SET feedback = $3, updated_at = NOW()`,
      [userId, toolId, feedback] // feedback: 1-有用, -1-无用, 0-中立
    );

    // 更新用户兴趣模型
    if (feedback !== 0) {
      const tool = await db.query(
        `SELECT category FROM tools WHERE tool_id = $1`,
        [toolId]
      );

      if (tool.rows.length > 0) {
        await db.query(
          `INSERT INTO user_interests
           (user_id, category, score, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (user_id, category)
           DO UPDATE SET score = user_interests.score + $3, updated_at = NOW()`,
          [userId, tool.rows[0].category, feedback * 10]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: '反馈已记录',
    });
  } catch (error) {
    console.error('记录反馈失败:', error);
    return NextResponse.json(
      { error: '记录反馈失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
