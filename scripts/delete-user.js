const { getDb } = require('coze-coding-dev-sdk');

/**
 * 删除用户脚本
 * 用于删除指定邮箱的用户及其所有相关数据
 */
async function deleteUser(email) {
  try {
    console.log('连接数据库...');
    const db = await getDb();
    console.log('✅ 数据库连接成功');

    console.log(`\n查找用户: ${email}`);

    // 查找用户
    const userResult = await db.execute(
      `SELECT id, email, username FROM users WHERE email = '${email}'`
    );

    if (userResult.rows.length === 0) {
      console.log('❌ 用户不存在');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`✅ 找到用户: ${user.id}, ${user.email}, ${user.username}`);

    // 删除用户相关的所有 API 密钥
    console.log('\n删除 API 密钥...');
    const result1 = await db.execute(
      `DELETE FROM api_keys WHERE user_id = '${user.id}'`
    );
    console.log(`✅ 删除 API 密钥数量: ${result1.rowCount}`);

    // 删除用户相关的所有会员订单
    console.log('\n删除会员订单...');
    const result2 = await db.execute(
      `DELETE FROM membership_orders WHERE user_id = '${user.id}'`
    );
    console.log(`✅ 删除会员订单数量: ${result2.rowCount}`);

    // 删除用户相关的所有安全日志
    console.log('\n删除安全日志...');
    const result3 = await db.execute(
      `DELETE FROM security_logs WHERE user_id = '${user.id}'`
    );
    console.log(`✅ 删除安全日志数量: ${result3.rowCount}`);

    // 删除用户相关的所有使用日志
    console.log('\n删除使用日志...');
    const result4 = await db.execute(
      `DELETE FROM usage_logs WHERE user_id = '${user.id}'`
    );
    console.log(`✅ 删除使用日志数量: ${result4.rowCount}`);

    // 删除用户相关的所有子账号
    console.log('\n删除子账号...');
    const result5 = await db.execute(
      `DELETE FROM sub_accounts WHERE parent_id = '${user.id}'`
    );
    console.log(`✅ 删除子账号数量: ${result5.rowCount}`);

    // 删除用户相关的所有章节
    console.log('\n删除章节...');
    const result6 = await db.execute(
      `DELETE FROM chapters WHERE user_id = '${user.id}'`
    );
    console.log(`✅ 删除章节数量: ${result6.rowCount}`);

    // 删除用户相关的所有小说
    console.log('\n删除小说...');
    const result7 = await db.execute(
      `DELETE FROM novels WHERE user_id = '${user.id}'`
    );
    console.log(`✅ 删除小说数量: ${result7.rowCount}`);

    // 删除用户相关的所有作品
    console.log('\n删除作品...');
    const result8 = await db.execute(
      `DELETE FROM works WHERE user_id = '${user.id}'`
    );
    console.log(`✅ 删除作品数量: ${result8.rowCount}`);

    // 删除用户
    console.log('\n删除用户...');
    const result9 = await db.execute(
      `DELETE FROM users WHERE email = '${email}'`
    );
    console.log(`✅ 删除用户: ${result9.rowCount}`);

    console.log('\n========================================');
    console.log('✅ 用户及所有相关数据删除成功！');
    console.log('========================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 删除用户失败:', error);
    process.exit(1);
  }
}

// 运行脚本
const email = process.argv[2];
if (!email) {
  console.error('用法: node scripts/delete-user.js <email>');
  process.exit(1);
}

deleteUser(email);
