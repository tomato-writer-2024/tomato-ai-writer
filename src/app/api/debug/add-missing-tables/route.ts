import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

/**
 * 添加缺失的表和列
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

    // 读取SQL脚本
    const sqlFilePath = path.join(process.cwd(), 'src/migrations/add_missing_tables_and_columns.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf-8');

    // 执行SQL脚本
    await pool.query(sqlScript);

    return NextResponse.json({
      success: true,
      message: '所有缺失的表和列添加成功',
    });
  } catch (error: any) {
    console.error('添加表和列失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '添加表和列失败',
      },
      { status: 500 }
    );
  }
}
