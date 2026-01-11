/**
 * 协作工作空间 API
 * 实现实时协作和版本控制
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';
import crypto from 'crypto';

/**
 * 创建协作工作空间
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
    const { name, description, type = 'document' } = body;

    // 生成唯一的工作空间ID
    const workspaceId = crypto.randomBytes(16).toString('hex');

    const pool = getPool();

    // 创建工作空间
    await pool.query(
      `INSERT INTO collaboration_workspaces
        (id, owner_id, name, description, type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [workspaceId, userId, name, description, type]
    );

    // 添加创建者为管理员
    await pool.query(
      `INSERT INTO workspace_members
        (workspace_id, user_id, role, joined_at)
       VALUES ($1, $2, 'owner', NOW())`,
      [workspaceId, userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        workspaceId,
        name,
        description,
        type,
      },
    });
  } catch (error) {
    console.error('创建工作空间失败:', error);
    return NextResponse.json(
      { success: false, error: '创建工作空间失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取用户的工作空间列表
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
    const pool = getPool();

    const result = await pool.query(
      `SELECT
        cw.id,
        cw.name,
        cw.description,
        cw.type,
        cw.created_at,
        cw.updated_at,
        wm.role,
        u.username as owner_name,
        (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = cw.id) as member_count,
        (SELECT COUNT(*) FROM workspace_documents WHERE workspace_id = cw.id) as document_count
      FROM collaboration_workspaces cw
      JOIN workspace_members wm ON cw.id = wm.workspace_id
      JOIN users u ON cw.owner_id = u.id
      WHERE wm.user_id = $1
      ORDER BY cw.updated_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('获取工作空间失败:', error);
    return NextResponse.json(
      { success: false, error: '获取工作空间失败' },
      { status: 500 }
    );
  }
}
