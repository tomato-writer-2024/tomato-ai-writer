/**
 * 超级管理员初始化脚本
 *
 * 使用方法：
 * 1. 在 .env.local 中配置环境变量
 * 2. 运行: npx tsx src/scripts/init-super-admin.ts
 */

import { userManager } from '@/storage/database';
import { hashPassword } from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';

// ============================================================================
// 超级管理员配置
// ============================================================================

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@tomatowriter.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'TomatoAdmin@2024';
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || '超级管理员';

// ============================================================================
// 初始化函数
// ============================================================================

async function initSuperAdmin() {
  console.log('='.repeat(80));
  console.log('超级管理员初始化脚本');
  console.log('='.repeat(80));

  try {
    // 1. 检查超级管理员是否已存在
    console.log('\n步骤 1: 检查超级管理员是否已存在...');
    const existingAdmin = await userManager.getUserByEmail(SUPER_ADMIN_EMAIL);

    if (existingAdmin) {
      console.log(`✅ 超级管理员已存在: ${existingAdmin.email}`);
      console.log(`   用户名: ${existingAdmin.username}`);
      console.log(`   角色: ${existingAdmin.role}`);
      console.log(`   会员等级: ${existingAdmin.membershipLevel}`);
      console.log(`   创建时间: ${existingAdmin.createdAt}`);
      console.log('\n如需重置密码，请手动修改数据库或联系开发团队');
      return;
    }

    // 2. 创建超级管理员
    console.log('\n步骤 2: 创建超级管理员...');
    const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);

    const superAdmin = await userManager.createUser({
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      username: SUPER_ADMIN_USERNAME,
      role: UserRole.SUPER_ADMIN,
      membershipLevel: MembershipLevel.ENTERPRISE,
    });

    console.log(`\n✅ 超级管理员创建成功!`);
    console.log('\n' + '-'.repeat(80));
    console.log('管理员信息:');
    console.log('-'.repeat(80));
    console.log(`邮箱: ${superAdmin.email}`);
    console.log(`用户名: ${superAdmin.username}`);
    console.log(`角色: ${superAdmin.role}`);
    console.log(`会员等级: ${superAdmin.membershipLevel}`);
    console.log(`ID: ${superAdmin.id}`);
    console.log(`创建时间: ${superAdmin.createdAt}`);
    console.log('\n' + '-'.repeat(80));
    console.log('登录信息:');
    console.log('-'.repeat(80));
    console.log(`登录地址: http://localhost:5000/login`);
    console.log(`邮箱: ${SUPER_ADMIN_EMAIL}`);
    console.log(`密码: ${SUPER_ADMIN_PASSWORD}`);
    console.log('\n⚠️  安全提示:');
    console.log('-'.repeat(80));
    console.log('1. 请立即修改默认密码');
    console.log('2. 请妥善保管管理员账户信息');
    console.log('3. 不要在生产环境使用默认密码');
    console.log('4. 建议启用双因素认证（待实现）');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ 初始化失败:', error);
    console.error('\n请检查:');
    console.error('1. 数据库连接是否正常');
    console.error('2. 环境变量是否正确配置');
    console.error('3. 数据库表结构是否已创建');
    process.exit(1);
  }
}

// ============================================================================
// 执行初始化
// ============================================================================

initSuperAdmin()
  .then(() => {
    console.log('\n✅ 初始化完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 初始化失败:', error);
    process.exit(1);
  });
