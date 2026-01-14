/**
 * 测试Neon PostgreSQL数据库连接
 * node test-db-connection.js
 */

const { Pool } = require('pg');

// 从.env.local读取数据库URL（这里直接使用配置值）
const DATABASE_URL = 'postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('========================================');
console.log('Neon PostgreSQL 数据库连接测试');
console.log('========================================\n');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  const client = await pool.connect();
  
  try {
    console.log('✅ 数据库连接成功！');
    
    // 测试1：检查数据库版本
    console.log('\n--- 测试1: 数据库版本 ---');
    const versionResult = await client.query('SELECT version()');
    console.log(versionResult.rows[0].version);
    
    // 测试2：检查所有表
    console.log('\n--- 测试2: 检查数据库表 ---');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('找到表:', tablesResult.rows.map(r => r.table_name).join(', '));
    
    // 测试3：检查users表结构
    console.log('\n--- 测试3: users表结构 ---');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    console.log('列信息:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 测试4：检查users表数据
    console.log('\n--- 测试4: users表数据 ---');
    const usersResult = await client.query(`
      SELECT 
        id, 
        email, 
        username, 
        role, 
        is_super_admin,
        is_active, 
        is_banned,
        membership_level,
        created_at,
        last_login_at
      FROM users 
      ORDER BY created_at DESC;
    `);
    console.log(`用户总数: ${usersResult.rowCount}`);
    usersResult.rows.forEach(user => {
      console.log(`\n用户 ${user.id}:`);
      console.log(`  - 邮箱: ${user.email}`);
      console.log(`  - 用户名: ${user.username}`);
      console.log(`  - 角色: ${user.role}`);
      console.log(`  - 超级管理员: ${user.is_super_admin}`);
      console.log(`  - 状态: ${user.is_active ? '激活' : '未激活'}, ${user.is_banned ? '已封禁' : '正常'}`);
      console.log(`  - 会员等级: ${user.membership_level}`);
      console.log(`  - 创建时间: ${user.created_at}`);
      console.log(`  - 最后登录: ${user.last_login_at}`);
    });
    
    // 测试5：检查超级管理员
    console.log('\n--- 测试5: 检查超级管理员账号 ---');
    const superAdminResult = await client.query(`
      SELECT 
        id, 
        email, 
        username,
        is_super_admin,
        is_active 
      FROM users 
      WHERE email = $1;
    `, ['208343256@qq.com']);
    
    if (superAdminResult.rowCount > 0) {
      console.log('✅ 超级管理员账号存在:');
      const admin = superAdminResult.rows[0];
      console.log(`  - ID: ${admin.id}`);
      console.log(`  - 邮箱: ${admin.email}`);
      console.log(`  - 用户名: ${admin.username}`);
      console.log(`  - 超级管理员: ${admin.is_super_admin}`);
      console.log(`  - 激活状态: ${admin.is_active}`);
    } else {
      console.log('❌ 超级管理员账号不存在！');
    }
    
    // 测试6：检查所有超级管理员
    console.log('\n--- 测试6: 所有超级管理员 ---');
    const allSuperAdminsResult = await client.query(`
      SELECT id, email, username, is_active, is_banned
      FROM users 
      WHERE is_super_admin = true;
    `);
    console.log(`超级管理员总数: ${allSuperAdminsResult.rowCount}`);
    allSuperAdminsResult.rows.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.username}) - ${admin.is_active ? '激活' : '未激活'}`);
    });
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\n========================================');
    console.log('数据库连接已关闭');
    console.log('========================================');
  }
}

testConnection().catch(console.error);
