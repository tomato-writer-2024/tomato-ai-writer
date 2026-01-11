/**
 * 评论 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';

/**
 * GET /api/community/[postId]/comments
 * 获取评论列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    const pool = getPool();

    const result = await pool.query(
      `SELECT
        pc.id,
        pc.content,
        pc.created_at,
        u.id as user_id,
        u.username,
        u.avatar_url,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = pc.id) as likes_count
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at ASC
      LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { success: false, error: '获取评论失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/[postId]/comments
 * 添加评论
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = token.userId;
    const { postId } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // 添加评论
    const result = await pool.query(
      `INSERT INTO post_comments
        (post_id, user_id, content, parent_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [postId, userId, content, parentId || null]
    );

    // 更新帖子评论数
    await pool.query(
      `UPDATE community_posts
       SET comments_count = comments_count + 1
       WHERE id = $1`,
      [postId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('添加评论失败:', error);
    return NextResponse.json(
      { success: false, error: '添加评论失败' },
      { status: 500 }
    );
  }
}
