/**
 * 社区功能 - 帖子 API
 * 支持发布帖子、浏览帖子、分类筛选
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * GET /api/community/posts
 * 获取帖子列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'latest'; // latest, hot, popular

    const offset = (page - 1) * limit;

    let orderBy = 'ORDER BY p.created_at DESC';
    if (sort === 'hot') {
      orderBy = 'ORDER BY (p.view_count + p.like_count * 2 + p.comment_count * 3) DESC';
    } else if (sort === 'popular') {
      orderBy = 'ORDER BY p.like_count DESC';
    }

    let whereClause = '';
    const queryParams: any[] = [limit, offset];

    if (category && category !== 'all') {
      whereClause = 'WHERE p.category = $3';
      queryParams.push(category);
    }

    const result = await db.query(
      `SELECT
        p.post_id,
        p.title,
        p.content,
        p.category,
        p.view_count,
        p.like_count,
        p.comment_count,
        p.created_at,
        u.username as author_name,
        u.avatar_url as author_avatar,
        COUNT(CASE WHEN pl.post_id IS NOT NULL THEN 1 END) as is_liked
      FROM posts p
      JOIN users u ON p.author_id = u.user_id
      LEFT JOIN post_likes pl ON p.post_id = pl.post_id AND pl.user_id = $1
      ${whereClause}
      GROUP BY p.post_id, u.username, u.avatar_url
      ${orderBy}
      LIMIT $2 OFFSET $3`,
      queryParams
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows.length,
      },
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    return NextResponse.json({ error: '获取帖子列表失败' }, { status: 500 });
  }
}

/**
 * POST /api/community/posts
 * 发布新帖子
 */
export async function POST(request: NextRequest) {
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
    const { title, content, category, tags } = await request.json();

    const result = await db.query(
      `INSERT INTO posts (author_id, title, content, category, tags, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING post_id`,
      [userId, title, content, category, tags]
    );

    return NextResponse.json({
      success: true,
      data: { postId: result.rows[0].post_id },
    });
  } catch (error) {
    console.error('发布帖子失败:', error);
    return NextResponse.json({ error: '发布帖子失败' }, { status: 500 });
  }
}
