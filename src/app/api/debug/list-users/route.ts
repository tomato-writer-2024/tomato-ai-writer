import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

/**
 * 列出所有用户（调试用）
 */
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    if (!pool) {
      return NextResponse.json(
        { error: '数据库连接池未创建' },
        { status: 500 }
      );
    }

    const result = await pool.query(
      'SELECT id, email, username, is_active, is_banned, created_at FROM users ORDER BY created_at DESC LIMIT 10'
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error: any) {
    console.error('列出用户失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '列出用户失败',
      },
      { status: 500 }
    );
  }
}
