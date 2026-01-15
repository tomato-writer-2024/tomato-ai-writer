import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

/**
 * 检查membership_orders表的结构
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

    // 获取表结构
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'membership_orders'
      ORDER BY ordinal_position;
    `);

    return NextResponse.json({
      success: true,
      data: {
        tableName: 'membership_orders',
        columns: columnsResult.rows,
      },
    });
  } catch (error: any) {
    console.error('检查表结构失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '检查表结构失败',
      },
      { status: 500 }
    );
  }
}
