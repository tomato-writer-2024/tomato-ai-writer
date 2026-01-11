/**
 * 社区功能 - 点赞 API
 * 支持点赞和取消点赞
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * POST /api/community/[postId]/like
 * 点赞帖子
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
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
    const { postId } = await params;

    // 检查是否已点赞
    const existing = await db.query(
      `SELECT * FROM post_likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    if (existing.rows.length > 0) {
      // 取消点赞
      await db.query(
        `DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2`,
        [userId, postId]
      );

      await db.query(
        `UPDATE posts SET like_count = like_count - 1 WHERE post_id = $1`,
        [postId]
      );

      return NextResponse.json({
        success: true,
        liked: false,
      });
    } else {
      // 添加点赞
      await db.query(
        `INSERT INTO post_likes (user_id, post_id, created_at)
         VALUES ($1, $2, NOW())`,
        [userId, postId]
      );

      await db.query(
        `UPDATE posts SET like_count = like_count + 1 WHERE post_id = $1`,
        [postId]
      );

      return NextResponse.json({
        success: true,
        liked: true,
      });
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    return NextResponse.json({ error: '点赞操作失败' }, { status: 500 });
  }
}
