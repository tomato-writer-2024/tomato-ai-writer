/**
 * 创建真实测试用户实例
 *
 * 用于创建各种类型的测试用户，进行功能测试
 */

import { hashPassword } from '@/lib/auth';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// ============================================================================
// 辅助函数：生成UUID（简化版）
// ============================================================================

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// 测试用户配置
// ============================================================================

const TEST_USERS = [
  {
    email: 'test.free@example.com',
    username: '免费用户',
    password: 'TestUser123!',
    role: 'FREE',
    membershipLevel: 'FREE',
    description: '免费用户，测试基础功能',
  },
  {
    email: 'test.basic@example.com',
    username: '基础会员',
    password: 'TestUser123!',
    role: 'USER',
    membershipLevel: 'BASIC',
    description: '基础会员，测试高级功能',
  },
  {
    email: 'test.premium@example.com',
    username: '高级会员',
    password: 'TestUser123!',
    role: 'USER',
    membershipLevel: 'PREMIUM',
    description: '高级会员，测试所有功能',
  },
  {
    email: 'test.admin@example.com',
    username: '测试管理员',
    password: 'TestAdmin123!',
    role: 'ADMIN',
    membershipLevel: 'ENTERPRISE',
    description: '管理员，测试后台管理功能',
  },
  {
    email: 'test.writer@example.com',
    username: '专业写手',
    password: 'TestWriter123!',
    role: 'USER',
    membershipLevel: 'PREMIUM',
    description: '专业写手，测试创作功能',
  },
  {
    email: 'test.beginner@example.com',
    username: '新手作者',
    password: 'TestBeginner123!',
    role: 'FREE',
    membershipLevel: 'FREE',
    description: '新手作者，测试新手引导',
  },
];

// ============================================================================
// 创建用户函数
// ============================================================================

async function createTestUser(userConfig: typeof TEST_USERS[0]) {
  const db = await getDb();
  const userId = generateUUID();
  const passwordHash = await hashPassword(userConfig.password);
  const now = new Date();

  try {
    // 检查用户是否已存在
    const existing = await db.execute(sql`
      SELECT id FROM users WHERE email = ${userConfig.email}
    `);

    if (existing.rows.length > 0) {
      console.log(`  ⏭️  用户已存在，跳过创建: ${userConfig.email}`);
      return existing.rows[0].id;
    }

    // 创建用户
    await db.execute(sql`
      INSERT INTO users (
        id, email, password_hash, username, role, membership_level,
        daily_usage_count, monthly_usage_count, storage_used,
        created_at, updated_at, last_login_at, is_active, is_banned
      ) VALUES (
        ${userId},
        ${userConfig.email},
        ${passwordHash},
        ${userConfig.username},
        ${userConfig.role},
        ${userConfig.membershipLevel},
        0,
        0,
        0,
        ${now},
        ${now},
        ${now},
        true,
        false
      )
    `);

    console.log(`  ✅ 创建成功: ${userConfig.username} (${userConfig.email})`);
    return userId;
  } catch (error) {
    console.error(`  ❌ 创建失败: ${userConfig.email}`, error);
    throw error;
  }
}

// ============================================================================
// 创建测试小说
// ============================================================================

async function createTestNovel(userId: string) {
  const db = await getDb();
  const novelId = generateUUID();
  const now = new Date();

  try {
    await db.execute(sql`
      INSERT INTO novels (
        id, user_id, title, description, genre, status,
        word_count, originality_score, quality_score, completion_rate,
        created_at, updated_at, is_deleted
      ) VALUES (
        ${novelId},
        ${userId},
        '测试小说',
        '这是一个测试小说，用于功能验证',
        '玄幻',
        '连载中',
        0,
        85,
        88,
        0,
        ${now},
        ${now},
        false
      )
    `);

    console.log(`    ✅ 创建测试小说: ${novelId}`);
    return novelId;
  } catch (error) {
    console.error(`    ❌ 创建测试小说失败`, error);
    throw error;
  }
}

// ============================================================================
// 创建测试章节
// ============================================================================

async function createTestChapter(novelId: string, userId: string) {
  const db = await getDb();
  const chapterId = generateUUID();
  const now = new Date();

  try {
    await db.execute(sql`
      INSERT INTO chapters (
        id, novel_id, user_id, chapter_number, title, content, word_count,
        originality_score, quality_score, completion_rate, status,
        created_at, updated_at, is_deleted
      ) VALUES (
        ${chapterId},
        ${novelId},
        ${userId},
        1,
        '第一章',
        '这是第一章的测试内容。在一个遥远的星球上，有一个勇敢的少年...',
        100,
        80,
        85,
        90,
        'DRAFT',
        ${now},
        ${now},
        false
      )
    `);

    console.log(`    ✅ 创建测试章节: ${chapterId}`);
    return chapterId;
  } catch (error) {
    console.error(`    ❌ 创建测试章节失败`, error);
    throw error;
  }
}

// ============================================================================
// 主函数
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('创建真实测试用户实例');
  console.log('='.repeat(80));
  console.log('');

  try {
    // 连接数据库
    console.log('步骤 1: 连接数据库...');
    await getDb();
    console.log('✅ 数据库连接成功\n');

    // 创建测试用户
    console.log('步骤 2: 创建测试用户...');
    console.log('-'.repeat(80));

    const createdUsers: any[] = [];

    for (const userConfig of TEST_USERS) {
      console.log(`\n创建用户: ${userConfig.description}`);
      console.log(`  邮箱: ${userConfig.email}`);
      console.log(`  角色: ${userConfig.role}`);
      console.log(`  会员等级: ${userConfig.membershipLevel}`);

      const userId = await createTestUser(userConfig);
      createdUsers.push({ ...userConfig, userId });

      // 为部分用户创建测试数据
      if (['test.writer@example.com', 'test.premium@example.com'].includes(userConfig.email)) {
        console.log('\n  创建测试数据...');
        const novelId = await createTestNovel(userId);
        await createTestChapter(novelId, userId);
      }
    }

    console.log('\n' + '-'.repeat(80));

    // 总结
    console.log('\n步骤 3: 创建完成总结');
    console.log('='.repeat(80));
    console.log(`✅ 成功创建 ${createdUsers.length} 个测试用户\n`);

    console.log('测试用户列表:');
    console.log('-'.repeat(80));
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   角色: ${user.role}`);
      console.log(`   会员: ${user.membershipLevel}`);
      console.log(`   密码: ${user.password}`);
      console.log(`   描述: ${user.description}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('💡 提示:');
    console.log('-'.repeat(80));
    console.log('1. 使用上述账号登录进行功能测试');
    console.log('2. 访问地址: http://localhost:5000/login');
    console.log('3. 测试不同角色的权限和功能');
    console.log('4. 所有测试数据已自动创建');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ 创建失败:', error);
    console.error('\n请检查:');
    console.error('1. 数据库连接是否正常');
    console.error('2. 数据库表结构是否正确');
    console.error('3. 是否有足够的权限');
    process.exit(1);
  }
}

// ============================================================================
// 执行
// ============================================================================

main()
  .then(() => {
    console.log('\n✅ 测试用户创建完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 创建失败:', error);
    process.exit(1);
  });
