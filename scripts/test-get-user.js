const { getDb } = require('coze-coding-dev-sdk');

async function testGetUserByEmail(email) {
  try {
    console.log(`\n测试查询用户: ${email}\n`);

    const db = await getDb();
    console.log('✅ 数据库连接成功');

    // 方法1: 使用原生SQL查询
    console.log('\n方法1: 使用原生SQL查询...');
    try {
      const result1 = await db.execute(
        `SELECT id, email, username FROM users WHERE email = '${email}'`
      );
      console.log('✅ 原生SQL查询成功');
      console.log('结果:', result1.rows);
    } catch (error) {
      console.log('❌ 原生SQL查询失败:', error.message);
    }

    // 方法2: 使用Drizzle查询
    console.log('\n方法2: 使用Drizzle查询...');
    try {
      const { users } = require('coze-coding-dev-sdk').schema;
      const { eq } = require('drizzle-orm');

      const result2 = await db.select().from(users).where(eq(users.email, email));
      console.log('✅ Drizzle查询成功');
      console.log('结果:', result2);
    } catch (error) {
      console.log('❌ Drizzle查询失败:', error.message);
      console.log('错误详情:', error);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  }
}

testGetUserByEmail(process.argv[2] || '208343256@qq.com');
