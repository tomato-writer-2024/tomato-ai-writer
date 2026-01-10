const { getDb } = require('coze-coding-dev-sdk');

async function testUserFields(email) {
  try {
    console.log(`\n测试查询用户字段: ${email}\n`);

    const db = await getDb();
    const result = await db.execute(
      `SELECT * FROM users WHERE email = '${email}'`
    );

    if (result.rows.length === 0) {
      console.log('用户不存在');
      process.exit(1);
    }

    const user = result.rows[0];

    console.log('所有字段名:', Object.keys(user));
    console.log('\n用户数据:');
    console.log(JSON.stringify(user, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

testUserFields(process.argv[2] || '208343256@qq.com');
