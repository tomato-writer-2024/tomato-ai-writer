import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

/**
 * 检查用户信息（调试用）
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

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: '缺少email参数' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT id, email, username, password_hash, is_active, is_banned FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: '用户不存在',
        data: null,
      });
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        passwordHashLength: user.password_hash ? user.password_hash.length : 0,
        passwordHashPrefix: user.password_hash ? user.password_hash.substring(0, 20) : null,
        isActive: user.is_active,
        isBanned: user.is_banned,
      },
    });
  } catch (error: any) {
    console.error('检查用户失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '检查用户失败',
      },
      { status: 500 }
    );
  }
}
