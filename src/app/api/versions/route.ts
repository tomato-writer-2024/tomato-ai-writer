/**
 * 版本控制 API
 * 实现内容版本历史记录和回滚功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * POST /api/versions
 * 创建新版本
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

    const { novelId, chapterId, contentType, content, description, tags } = await request.json();

    // 验证输入
    if (!novelId || !content) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 创建新版本
    const result = await db.query(
      `INSERT INTO content_versions
       (novel_id, chapter_id, content_type, content, description, tags, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        novelId,
        chapterId || null,
        contentType || 'chapter',
        content,
        description || '',
        tags || [],
        payload.userId,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('创建版本失败:', error);
    return NextResponse.json({ error: '创建版本失败' }, { status: 500 });
  }
}

/**
 * GET /api/versions
 * 获取版本列表
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token无效' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novelId');
    const chapterId = searchParams.get('chapterId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!novelId) {
      return NextResponse.json({ error: '缺少novelId参数' }, { status: 400 });
    }

    // 查询版本列表
    let query = `
      SELECT v.*, u.username as created_by_name
      FROM content_versions v
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.novel_id = $1
    `;
    const params: any[] = [novelId];

    if (chapterId) {
      query += ` AND v.chapter_id = $2`;
      params.push(chapterId);
    }

    query += ` ORDER BY v.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('获取版本列表失败:', error);
    return NextResponse.json({ error: '获取版本列表失败' }, { status: 500 });
  }
}
