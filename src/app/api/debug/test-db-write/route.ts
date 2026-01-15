import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

/**
 * 测试数据库写入
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

    // 测试插入一条记录
    const testEmail = `test_${Date.now()}@example.com`;
    const result = await pool.query(
      'INSERT INTO users (id, email, username, password_hash, is_active, is_banned) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, username',
      [
        `test-${Date.now()}`,
        testEmail,
        `testuser_${Date.now()}`,
        'test_hash',
        true,
        false
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        inserted: result.rows[0],
        testEmail,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '写入失败',
        details: error.stack?.substring(0, 200),
      },
      { status: 500 }
    );
  }
}
