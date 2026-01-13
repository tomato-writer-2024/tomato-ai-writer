/**
 * 重置超级管理员密码脚本
 *
 * 使用方法：
 * npx tsx src/scripts/reset-password.ts --email="208343256@qq.com" --password="新密码"
 */

import { userManager } from '@/storage/database';
import { hashPassword } from '@/lib/auth';

// ============================================================================
// 命令行参数解析
// ============================================================================

const args = process.argv.slice(2);

function getArg(key: string): string | undefined {
  const fullKey = `--${key}=`;
  const arg = args.find(a => a.startsWith(fullKey));
  return arg ? arg.slice(fullKey.length) : undefined;
}

const email = getArg('email');
const newPassword = getArg('password');

// ============================================================================
// 主函数
// ============================================================================

async function resetPassword() {
  console.log('='.repeat(80));
  console.log('密码重置脚本');
  console.log('='.repeat(80));

  try {
    // 1. 验证参数
    if (!email || !newPassword) {
      console.log('\n❌ 错误: 缺少必要参数');
      console.log('\n使用方法:');
      console.log('  npx tsx src/scripts/reset-password.ts --email="邮箱" --password="新密码"\n');
      console.log('示例:');
      console.log('  npx tsx src/scripts/reset-password.ts --email="208343256@qq.com" --password="TomatoAdmin@2024"\n');
      console.log('='.repeat(80));
      process.exit(1);
    }

    // 2. 验证密码强度
    if (newPassword.length < 8) {
      console.log('\n❌ 错误: 密码长度不能少于8位');
      process.exit(1);
    }

    console.log(`\n邮箱: ${email}`);
    console.log(`新密码: ${newPassword}`);
    console.log(`密码长度: ${newPassword.length} 位\n`);

    // 3. 检查用户是否存在
    console.log('步骤 1: 检查用户是否存在...');
    const user = await userManager.getUserByEmail(email);

    if (!user) {
      console.log(`\n❌ 错误: 用户不存在 (${email})`);
      process.exit(1);
    }

    console.log(`✅ 用户已找到: ${user.username} (${user.role})`);

    // 4. 生成新密码哈希
    console.log('\n步骤 2: 生成新密码哈希...');
    const passwordHash = await hashPassword(newPassword);
    console.log('✅ 密码哈希已生成');

    // 5. 更新密码
    console.log('\n步骤 3: 更新密码...');
    await userManager.updateUser(user.id, { passwordHash });
    console.log('✅ 密码已更新');

    // 6. 显示结果
    console.log('\n' + '='.repeat(80));
    console.log('密码重置成功!');
    console.log('='.repeat(80));
    console.log('\n用户信息:');
    console.log(`  邮箱: ${user.email}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  超级管理员: ${user.isSuperAdmin ? '是' : '否'}`);
    console.log(`  会员等级: ${user.membershipLevel}`);
    console.log('\n登录信息:');
    console.log(`  生产环境: https://tomato-ai-writer.vercel.app/login`);
    console.log(`  邮箱: ${email}`);
    console.log(`  密码: ${newPassword}`);
    console.log('\n⚠️  安全提示:');
    console.log('  - 请妥善保管密码');
    console.log('  - 建议定期更换密码');
    console.log('  - 不要在公共设备上登录');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ 重置失败:', error);
    console.error('\n请检查:');
    console.error('1. 数据库连接是否正常');
    console.error('2. 用户邮箱是否正确');
    console.error('3. 数据库表结构是否已创建');
    process.exit(1);
  }
}

// ============================================================================
// 执行重置
// ============================================================================

resetPassword()
  .then(() => {
    console.log('\n✅ 操作完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 操作失败:', error);
    process.exit(1);
  });
