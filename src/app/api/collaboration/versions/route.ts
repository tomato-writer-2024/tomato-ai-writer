/**
 * 协作功能 - 版本控制 API
 * 支持保存版本、查看历史、回滚版本
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * GET /api/collaboration/versions?chapterId=xxx
 * 获取章节的版本历史
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
    const chapterId = searchParams.get('chapterId');

    if (!chapterId) {
      return NextResponse.json({ error: '缺少chapterId参数' }, { status: 400 });
    }

    const result = await db.query(
      `SELECT
        version_id,
        version_number,
        content,
        word_count,
        created_at,
        created_by,
        comment
      FROM chapter_versions
      WHERE chapter_id = $1
      ORDER BY version_number DESC`,
      [chapterId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('获取版本历史失败:', error);
    return NextResponse.json({ error: '获取版本历史失败' }, { status: 500 });
  }
}

/**
 * POST /api/collaboration/versions
 * 保存新版本
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
    const { chapterId, content, comment } = await request.json();

    // 获取当前版本号
    const currentVersion = await db.query(
      `SELECT MAX(version_number) as max_version
       FROM chapter_versions
       WHERE chapter_id = $1`,
      [chapterId]
    );

    const nextVersion = (currentVersion.rows[0].max_version || 0) + 1;

    // 保存新版本
    const result = await db.query(
      `INSERT INTO chapter_versions
       (chapter_id, version_number, content, word_count, created_by, comment, created_at)
       VALUES ($1, $2, $3, LENGTH($4), $5, $6, NOW())
       RETURNING version_id`,
      [chapterId, nextVersion, content, content, userId, comment]
    );

    return NextResponse.json({
      success: true,
      data: { versionId: result.rows[0].version_id, versionNumber: nextVersion },
    });
  } catch (error) {
    console.error('保存版本失败:', error);
    return NextResponse.json({ error: '保存版本失败' }, { status: 500 });
  }
}
