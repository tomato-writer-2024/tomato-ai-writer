const { getDb } = require('coze-coding-dev-sdk');

async function addWechatFields() {
  try {
    const db = await getDb();
    console.log('开始添加微信登录字段...');

    // 添加微信OpenID字段
    await db.execute(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_open_id VARCHAR(255)
    `);
    console.log('wechat_open_id字段添加成功');

    // 添加微信UnionID字段
    await db.execute(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_union_id VARCHAR(255)
    `);
    console.log('wechat_union_id字段添加成功');

    // 为微信OpenID创建索引
    await db.execute(`
      CREATE INDEX IF NOT EXISTS users_wechat_openid_idx ON users(wechat_open_id)
    `);
    console.log('wechat_open_id索引创建成功');

    // 为微信UnionID创建索引
    await db.execute(`
      CREATE INDEX IF NOT EXISTS users_wechat_unionid_idx ON users(wechat_union_id)
    `);
    console.log('wechat_union_id索引创建成功');

    // 验证字段
    const result = await db.execute(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('wechat_open_id', 'wechat_union_id')
    `);

    console.log('\n验证结果:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n完成！');
  } catch (error) {
    console.error('添加字段失败:', error);
  }
}

addWechatFields();
