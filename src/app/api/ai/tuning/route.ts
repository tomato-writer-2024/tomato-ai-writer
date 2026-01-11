/**
 * AI模型微调 API
 * 基于用户数据驱动提示词优化
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';

/**
 * 生成个性化提示词
 */
function generatePersonalizedPrompt(
  userStyle: any,
  context: any
): string {
  let prompt = '';

  // 基于用户写作风格
  if (userStyle.style) {
    prompt += `写作风格：${userStyle.style}\n`;
  }

  // 基于偏好题材
  if (userStyle.genres && userStyle.genres.length > 0) {
    prompt += `题材偏好：${userStyle.genres.join('、')}\n`;
  }

  // 基于常用词汇
  if (userStyle.vocabulary && userStyle.vocabulary.length > 0) {
    prompt += `常用词汇：${userStyle.vocabulary.join('、')}\n`;
  }

  // 基于叙事节奏
  if (userStyle.pacing) {
    prompt += `叙事节奏：${userStyle.pacing}\n`;
  }

  // 基于角色创作偏好
  if (userStyle.characterFocus) {
    prompt += `角色创作偏好：${userStyle.characterFocus}\n`;
  }

  // 添加上下文
  if (context?.task) {
    prompt += `\n任务：${context.task}\n`;
  }

  if (context?.input) {
    prompt += `输入内容：${context.input}\n`;
  }

  return prompt;
}

/**
 * 分析用户写作风格
 */
async function analyzeUserStyle(userId: number): Promise<any> {
  const pool = getPool();

  // 获取用户最近的作品
  const worksResult = await pool.query(
    `SELECT content, genre, tags
    FROM user_works
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '90 days'
    ORDER BY created_at DESC
    LIMIT 20`,
    [userId]
  );

  if (worksResult.rows.length === 0) {
    return null;
  }

  // 简单分析风格（实际应该使用更复杂的NLP）
  const contents = worksResult.rows.map((row: any) => row.content).join('\n');

  // 统计常见题材
  const genreCount: { [key: string]: number } = {};
  worksResult.rows.forEach((row: any) => {
    if (row.genre) {
      genreCount[row.genre] = (genreCount[row.genre] || 0) + 1;
    }
  });

  const genres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  // 分析平均句长（简单指标）
  const sentences = contents.split(/[。！？]/);
  const avgSentenceLength = sentences.reduce((sum: number, s: string) => sum + s.length, 0) / sentences.length;

  let pacing = '中等';
  if (avgSentenceLength > 50) {
    pacing = '缓慢细腻';
  } else if (avgSentenceLength < 20) {
    pacing = '快速紧凑';
  }

  return {
    style: avgSentenceLength > 50 ? '详细描写型' : avgSentenceLength < 20 ? '快节奏爽文' : '平衡型',
    genres,
    pacing,
    characterFocus: '待分析',
    vocabulary: [],
  };
}

/**
 * 保存用户AI偏好
 */
async function saveUserPreference(
  userId: number,
  preference: any
): Promise<void> {
  const pool = getPool();

  await pool.query(
    `INSERT INTO ai_user_preferences
      (user_id, style, genres, pacing, temperature, max_tokens, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET
       style = $2,
       genres = $3,
       pacing = $4,
       temperature = $5,
       max_tokens = $6,
       updated_at = NOW()`,
    [
      userId,
      preference.style,
      JSON.stringify(preference.genres || []),
      preference.pacing,
      preference.temperature || 0.7,
      preference.maxTokens || 2000,
    ]
  );
}

/**
 * GET /api/ai/tuning
 * 获取用户AI偏好设置
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
    const pool = getPool();

    const result = await pool.query(
      `SELECT * FROM ai_user_preferences WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // 分析用户写作风格
      const style = await analyzeUserStyle(userId);

      return NextResponse.json({
        success: true,
        data: {
          userId,
          style: style?.style || '平衡型',
          genres: style?.genres || [],
          pacing: style?.pacing || '中等',
          temperature: 0.7,
          maxTokens: 2000,
          autoOptimize: true,
        },
      });
    }

    const preference = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        userId,
        style: preference.style,
        genres: preference.genres || [],
        pacing: preference.pacing,
        temperature: preference.temperature,
        maxTokens: preference.max_tokens,
        autoOptimize: preference.auto_optimize || true,
      },
    });
  } catch (error) {
    console.error('获取AI偏好失败:', error);
    return NextResponse.json(
      { success: false, error: '获取AI偏好失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/tuning
 * 更新用户AI偏好设置
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
    const {
      style,
      genres,
      pacing,
      temperature,
      maxTokens,
      autoOptimize,
    } = body;

    const preference: any = {
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 2000,
      autoOptimize: autoOptimize !== undefined ? autoOptimize : true,
    };

    if (style) preference.style = style;
    if (genres) preference.genres = genres;
    if (pacing) preference.pacing = pacing;

    await saveUserPreference(userId, preference);

    return NextResponse.json({
      success: true,
      message: 'AI偏好已更新',
      data: preference,
    });
  } catch (error) {
    console.error('更新AI偏好失败:', error);
    return NextResponse.json(
      { success: false, error: '更新AI偏好失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai/tuning/optimize
 * 自动优化提示词
 */
export async function PUT(request: NextRequest) {
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
    const { task, input } = body;

    // 获取用户偏好
    const pool = getPool();
    const result = await pool.query(
      `SELECT * FROM ai_user_preferences WHERE user_id = $1`,
      [userId]
    );

    let userStyle = null;
    if (result.rows.length > 0) {
      userStyle = {
        style: result.rows[0].style,
        genres: result.rows[0].genres,
        pacing: result.rows[0].pacing,
      };
    } else {
      userStyle = await analyzeUserStyle(userId);
    }

    // 生成个性化提示词
    const personalizedPrompt = generatePersonalizedPrompt(userStyle, {
      task,
      input,
    });

    return NextResponse.json({
      success: true,
      data: {
        originalPrompt: input,
        personalizedPrompt,
        userStyle,
      },
    });
  } catch (error) {
    console.error('优化提示词失败:', error);
    return NextResponse.json(
      { success: false, error: '优化提示词失败' },
      { status: 500 }
    );
  }
}
