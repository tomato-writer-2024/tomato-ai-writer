/**
 * 点赞 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';

/**
 * POST /api/community/[postId]/like
 * 点赞或取消点赞
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

    const pool = getPool();

    // 检查是否已点赞
    const existingResult = await pool.query(
      `SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (existingResult.rows.length > 0) {
      // 取消点赞
      await pool.query(
        `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
      );

      // 更新帖子点赞数
      await pool.query(
        `UPDATE community_posts
         SET likes_count = likes_count - 1
         WHERE id = $1`,
        [postId]
      );

      return NextResponse.json({
        success: true,
        data: { liked: false },
      });
    } else {
      // 点赞
      await pool.query(
        `INSERT INTO post_likes (post_id, user_id, created_at)
         VALUES ($1, $2, NOW())`,
        [postId, userId]
      );

      // 更新帖子点赞数
      await pool.query(
        `UPDATE community_posts
         SET likes_count = likes_count + 1
         WHERE id = $1`,
        [postId]
      );

      return NextResponse.json({
        success: true,
        data: { liked: true },
      });
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    return NextResponse.json(
      { success: false, error: '点赞操作失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/[postId]/like
 * 检查是否已点赞
 */
export async function GET(
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

    const pool = getPool();

    const result = await pool.query(
      `SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    const liked = parseInt(result.rows[0].count) > 0;

    return NextResponse.json({
      success: true,
      data: { liked },
    });
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    return NextResponse.json(
      { success: false, error: '检查点赞状态失败' },
      { status: 500 }
    );
  }
}
