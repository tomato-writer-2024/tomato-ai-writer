/**
 * 社区功能 - 评论 API
 * 支持发表评论、回复评论、点赞评论
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * GET /api/community/[postId]/comments
 * 获取帖子的评论列表
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

    const result = await db.query(
      `SELECT
        c.comment_id,
        c.content,
        c.parent_id,
        c.created_at,
        u.username as author_name,
        u.avatar_url as author_avatar,
        COUNT(r.comment_id) as reply_count
      FROM comments c
      JOIN users u ON c.author_id = u.user_id
      LEFT JOIN comments r ON c.comment_id = r.parent_id
      WHERE c.post_id = $1 AND c.parent_id IS NULL
      GROUP BY c.comment_id, u.username, u.avatar_url
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

/**
 * POST /api/community/[postId]/comments
 * 发表评论
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
    const { content, parentId } = await request.json();

    const result = await db.query(
      `INSERT INTO comments (post_id, author_id, parent_id, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING comment_id`,
      [postId, userId, parentId || null, content]
    );

    // 更新帖子评论数
    await db.query(
      `UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = $1`,
      [postId]
    );

    return NextResponse.json({
      success: true,
      data: { commentId: result.rows[0].comment_id },
    });
  } catch (error) {
    console.error('发表评论失败:', error);
    return NextResponse.json({ error: '发表评论失败' }, { status: 500 });
  }
}
