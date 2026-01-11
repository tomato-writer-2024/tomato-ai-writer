/**
 * 协作功能 - 工作空间 API
 * 支持工作空间创建、管理、实时协作
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * GET /api/collaboration/workspace
 * 获取用户的工作空间列表
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

    const userId = payload.userId;

    const result = await db.query(
      `SELECT
        w.workspace_id,
        w.name,
        w.description,
        w.created_at,
        w.updated_at,
        COUNT(uw.user_id) as member_count
      FROM workspaces w
      JOIN workspace_members uw ON w.workspace_id = uw.workspace_id
      WHERE uw.user_id = $1 OR w.owner_id = $1
      GROUP BY w.workspace_id
      ORDER BY w.updated_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('获取工作空间失败:', error);
    return NextResponse.json({ error: '获取工作空间失败' }, { status: 500 });
  }
}

/**
 * POST /api/collaboration/workspace
 * 创建新工作空间
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
    const { name, description } = await request.json();

    const result = await db.query(
      `INSERT INTO workspaces (name, description, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING workspace_id`,
      [name, description, userId]
    );

    // 添加创建者为成员
    await db.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
       VALUES ($1, $2, 'owner', NOW())`,
      [result.rows[0].workspace_id, userId]
    );

    return NextResponse.json({
      success: true,
      data: { workspaceId: result.rows[0].workspace_id },
    });
  } catch (error) {
    console.error('创建工作空间失败:', error);
    return NextResponse.json({ error: '创建工作空间失败' }, { status: 500 });
  }
}
