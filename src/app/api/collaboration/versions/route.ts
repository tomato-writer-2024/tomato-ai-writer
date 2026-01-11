/**
 * 版本控制 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';

/**
 * 创建新版本
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
    const { documentId, content, message } = body;

    if (!documentId || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // 验证用户权限
    const permissionResult = await pool.query(
      `SELECT wd.*
      FROM workspace_documents wd
      JOIN workspace_members wm ON wd.workspace_id = wm.workspace_id
      WHERE wd.id = $1
        AND wm.user_id = $2`,
      [documentId, userId]
    );

    if (permissionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      );
    }

    // 保存版本
    const versionResult = await pool.query(
      `INSERT INTO document_versions
        (document_id, user_id, content, message, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, version_number`,
      [documentId, userId, content, message || '自动保存']
    );

    // 更新文档的当前版本
    await pool.query(
      `UPDATE workspace_documents
       SET current_version_id = $1, content = $2, updated_at = NOW()
       WHERE id = $3`,
      [versionResult.rows[0].id, content, documentId]
    );

    return NextResponse.json({
      success: true,
      data: {
        versionId: versionResult.rows[0].id,
        versionNumber: versionResult.rows[0].version_number,
        message,
      },
    });
  } catch (error) {
    console.error('创建版本失败:', error);
    return NextResponse.json(
      { success: false, error: '创建版本失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取文档的版本历史
 */
export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = token.userId;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: '缺少documentId参数' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // 验证权限
    const permissionResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM workspace_documents wd
      JOIN workspace_members wm ON wd.workspace_id = wm.workspace_id
      WHERE wd.id = $1 AND wm.user_id = $2`,
      [documentId, userId]
    );

    if (parseInt(permissionResult.rows[0].count) === 0) {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      );
    }

    // 获取版本历史
    const versionsResult = await pool.query(
      `SELECT
        dv.id,
        dv.version_number,
        dv.message,
        dv.created_at,
        u.username,
        u.avatar_url
      FROM document_versions dv
      JOIN users u ON dv.user_id = u.id
      WHERE dv.document_id = $1
      ORDER BY dv.version_number DESC
      LIMIT 50`,
      [documentId]
    );

    return NextResponse.json({
      success: true,
      data: versionsResult.rows,
    });
  } catch (error) {
    console.error('获取版本历史失败:', error);
    return NextResponse.json(
      { success: false, error: '获取版本历史失败' },
      { status: 500 }
    );
  }
}
