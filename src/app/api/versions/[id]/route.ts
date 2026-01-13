/**
 * 单个版本 API
 * 实现版本详情查看和恢复功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * GET /api/versions/[id]
 * 获取版本详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: versionId } = await params;

    // 查询版本详情
    const result = await db.query(
      `SELECT v.*, u.username as created_by_name
       FROM content_versions v
       LEFT JOIN users u ON v.created_by = u.id
       WHERE v.id = $1`,
      [versionId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('获取版本详情失败:', error);
    return NextResponse.json({ error: '获取版本详情失败' }, { status: 500 });
  }
}

/**
 * POST /api/versions/[id]/restore
 * 恢复到指定版本
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: versionId } = await params;

    // 查询要恢复的版本
    const versionResult = await db.query(
      `SELECT * FROM content_versions WHERE id = $1`,
      [versionId]
    );

    if (versionResult.rows.length === 0) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 });
    }

    const version = versionResult.rows[0];

    // 如果是章节，恢复到章节表
    if (version.chapter_id && version.content_type === 'chapter') {
      await db.query(
        `UPDATE chapters
         SET content = $1, updated_at = NOW()
         WHERE id = $2`,
        [version.content, version.chapter_id]
      );
    }

    // 创建恢复记录
    await db.query(
      `INSERT INTO content_versions
       (novel_id, chapter_id, content_type, content, description, tags, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        version.novel_id,
        version.chapter_id,
        version.content_type,
        version.content,
        `恢复到版本 ${versionId}`,
        ['restore'],
        payload.userId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: '版本恢复成功',
      data: version,
    });
  } catch (error) {
    console.error('恢复版本失败:', error);
    return NextResponse.json({ error: '恢复版本失败' }, { status: 500 });
  }
}

/**
 * DELETE /api/versions/[id]
 * 删除版本
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: versionId } = await params;

    // 删除版本
    await db.query(`DELETE FROM content_versions WHERE id = $1`, [versionId]);

    return NextResponse.json({
      success: true,
      message: '版本删除成功',
    });
  } catch (error) {
    console.error('删除版本失败:', error);
    return NextResponse.json({ error: '删除版本失败' }, { status: 500 });
  }
}
