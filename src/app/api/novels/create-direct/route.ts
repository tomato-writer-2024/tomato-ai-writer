import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { extractUserFromRequest } from '@/lib/auth';

/**
 * 创建小说（直接数据库版本）
 *
 * 使用 getPool() 直接操作数据库，确保数据一致性
 */
async function handler(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error } = await extractUserFromRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, genre, status, type, tags } = body;

    // 验证必要字段
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: '小说标题不能为空' },
        { status: 400 }
      );
    }

    const pool = getPool();
    if (!pool) {
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }

    // 创建小说
    const novelId = `novel_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const result = await pool.query(
      `INSERT INTO novels (
        id, user_id, title, description, genre, status, type,
        cover_url, tags, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        novelId,
        user.id,
        title.trim(),
        description || '',
        genre || '都市',
        status || '连载中',
        type || '爽文',
        null,
        tags || null,
        false
      ]
    );

    const novel = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: novel.id,
        userId: novel.user_id,
        title: novel.title,
        description: novel.description,
        genre: novel.genre,
        status: novel.status,
        type: novel.type,
        coverUrl: novel.cover_url,
        tags: novel.tags,
        isPublished: novel.is_published,
        createdAt: novel.created_at,
        updatedAt: novel.updated_at,
      },
    });
  } catch (error) {
    console.error('创建小说失败:', error);
    return NextResponse.json(
      { error: '创建小说失败' },
      { status: 500 }
    );
  }
}

export { handler as POST };
