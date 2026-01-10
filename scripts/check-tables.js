const { getDb } = require('coze-coding-dev-sdk');

async function checkTables() {
  try {
    const db = await getDb();

    // 检查users表
    console.log('检查users表...');
    const usersResult = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('users表结构:');
    usersResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // 检查是否存在wechat_open_id字段
    const hasWechatOpenId = usersResult.rows.some(row => row.column_name === 'wechat_open_id');
    console.log(`\nwechat_open_id字段存在: ${hasWechatOpenId}`);

    // 检查wechat_union_id字段
    const hasWechatUnionId = usersResult.rows.some(row => row.column_name === 'wechat_union_id');
    console.log(`wechat_union_id字段存在: ${hasWechatUnionId}`);

  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkTables();
