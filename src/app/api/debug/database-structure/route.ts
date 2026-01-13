import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

/**
 * 数据库结构诊断API
 * 用于检查users表的实际结构和指定用户的数据
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || '208343256@qq.com';

    const db = await getDb();

    // 1. 检查users表结构
    const columnsResult = await db.execute(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('Users表结构:', columnsResult.rows);

    // 2. 查询指定用户的数据
    const escapedEmail = email.replace(/'/g, "''");
    const userResult = await db.execute(`
      SELECT * FROM users WHERE email = '${escapedEmail}'
    `);

    console.log('用户查询结果:', userResult.rows);

    // 3. 返回诊断信息
    return NextResponse.json({
      success: true,
      data: {
        tableStructure: columnsResult.rows,
        userData: userResult.rows.length > 0 ? userResult.rows[0] : null,
        allFields: userResult.rows.length > 0 ? Object.keys(userResult.rows[0]) : [],
      },
    });
  } catch (error) {
    console.error('数据库结构诊断失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
