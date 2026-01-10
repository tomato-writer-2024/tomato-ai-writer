import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, works, novels, chapters, apiKeys, membershipOrders, securityLogs, subAccounts, usageLogs } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: '邮箱不能为空' },
        { status: 400 }
      );
    }

    console.log('[删除用户] 开始删除用户:', email);

    const db = await getDb();

    // 查找用户
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userRecords.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const user = userRecords[0];
    console.log('[删除用户] 找到用户:', user.id, user.email);

    // 删除用户相关的所有 API 密钥
    const deletedApiKeys = await db
      .delete(apiKeys)
      .where(eq(apiKeys.userId, user.id))
      .returning();

    console.log('[删除用户] 删除 API 密钥数量:', deletedApiKeys.length);

    // 删除用户相关的所有会员订单
    const deletedOrders = await db
      .delete(membershipOrders)
      .where(eq(membershipOrders.userId, user.id))
      .returning();

    console.log('[删除用户] 删除会员订单数量:', deletedOrders.length);

    // 删除用户相关的所有安全日志
    const deletedSecurityLogs = await db
      .delete(securityLogs)
      .where(eq(securityLogs.userId, user.id))
      .returning();

    console.log('[删除用户] 删除安全日志数量:', deletedSecurityLogs.length);

    // 删除用户相关的所有使用日志
    const deletedUsageLogs = await db
      .delete(usageLogs)
      .where(eq(usageLogs.userId, user.id))
      .returning();

    console.log('[删除用户] 删除使用日志数量:', deletedUsageLogs.length);

    // 删除用户相关的所有子账号
    const deletedSubAccounts = await db
      .delete(subAccounts)
      .where(eq(subAccounts.parentId, user.id))
      .returning();

    console.log('[删除用户] 删除子账号数量:', deletedSubAccounts.length);

    // 删除用户相关的所有章节
    const deletedChapters = await db
      .delete(chapters)
      .where(eq(chapters.userId, user.id))
      .returning();

    console.log('[删除用户] 删除章节数量:', deletedChapters.length);

    // 删除用户相关的所有小说
    const deletedNovels = await db
      .delete(novels)
      .where(eq(novels.userId, user.id))
      .returning();

    console.log('[删除用户] 删除小说数量:', deletedNovels.length);

    // 删除用户相关的所有作品
    const deletedWorks = await db
      .delete(works)
      .where(eq(works.userId, user.id))
      .returning();

    console.log('[删除用户] 删除作品数量:', deletedWorks.length);

    // 删除用户
    const deletedUser = await db
      .delete(users)
      .where(eq(users.email, email))
      .returning();

    console.log('[删除用户] 删除用户成功:', deletedUser[0]);

    return NextResponse.json({
      success: true,
      message: '用户及所有相关数据已删除',
      data: {
        deletedApiKeys: deletedApiKeys.length,
        deletedOrders: deletedOrders.length,
        deletedSecurityLogs: deletedSecurityLogs.length,
        deletedUsageLogs: deletedUsageLogs.length,
        deletedSubAccounts: deletedSubAccounts.length,
        deletedChapters: deletedChapters.length,
        deletedNovels: deletedNovels.length,
        deletedWorks: deletedWorks.length,
        deletedUser: {
          id: deletedUser[0].id,
          email: deletedUser[0].email
        }
      }
    });
  } catch (error) {
    console.error('[删除用户] 错误:', error);
    return NextResponse.json(
      { error: '删除用户失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
