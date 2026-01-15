import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

/**
 * 检查所有表是否存在
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

    // 获取所有表
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map(row => row.table_name);

    // 检查每个表的列
    const tablesWithColumns: any = {};
    for (const table of tables) {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      tablesWithColumns[table] = columnsResult.rows;
    }

    return NextResponse.json({
      success: true,
      data: {
        tables,
        tablesWithColumns,
      },
    });
  } catch (error: any) {
    console.error('检查表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '检查表失败',
      },
      { status: 500 }
    );
  }
}
