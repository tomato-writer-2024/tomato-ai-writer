/**
 * 社区功能 API
 * 评论、点赞、分享
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';

/**
 * GET /api/community/posts
 * 获取社区帖子列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'latest';

    const offset = (page - 1) * limit;

    const pool = getPool();

    let query = `
      SELECT
        cp.id,
        cp.title,
        cp.content,
        cp.category,
        cp.views,
        cp.likes_count,
        cp.comments_count,
        cp.created_at,
        u.id as user_id,
        u.username,
        u.avatar_url,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = cp.id) as total_likes,
        ${searchParams.get('userId')
      ? `(SELECT COUNT(*) FROM post_likes WHERE post_id = cp.id AND user_id = ${searchParams.get('userId')}) > 0 as is_liked`
      : 'false as is_liked'}
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` WHERE cp.category = $${paramCount}`;
      params.push(category);
    }

    // 排序
    if (sort === 'latest') {
      query += ' ORDER BY cp.created_at DESC';
    } else if (sort === 'hot') {
      query += ' ORDER BY cp.likes_count DESC, cp.comments_count DESC';
    } else if (sort === 'views') {
      query += ' ORDER BY cp.views DESC';
    }

    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取帖子列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/posts
 * 创建新帖子
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
    const { title, content, category, tags } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO community_posts
        (user_id, title, content, category, tags, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [userId, title, content, category, JSON.stringify(tags || [])]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('创建帖子失败:', error);
    return NextResponse.json(
      { success: false, error: '创建帖子失败' },
      { status: 500 }
    );
  }
}
