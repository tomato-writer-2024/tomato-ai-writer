import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { novelManager, userManager } from '@/storage/database';
import { chapters } from '@/storage/database/shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';

/**
 * 获取用户统计数据
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error } = await extractUserFromRequest(request);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    // 获取用户信息
    const userInfo = await userManager.getUserById(user.id);

    // 获取作品统计
    const novelStats = await novelManager.getNovelStats(user.id);

    // 查询今日创作字数
    const db = await getDb();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const todayWordsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${chapters.wordCount}), 0)`,
      })
      .from(chapters)
      .where(
        and(
          eq(chapters.userId, user.id),
          gte(chapters.createdAt, todayStart),
          eq(chapters.isDeleted, false)
        )
      );

    const todayWords = parseInt(todayWordsResult[0]?.total?.toString() || '0', 10);

    // 确定会员等级
    const membershipLevel = userInfo?.membershipLevel || 'FREE';
    const memberLevel = membershipLevel === 'PRO' ? 'Pro会员' : '普通用户';

    return NextResponse.json({
      success: true,
      data: {
        totalWords: novelStats.totalWords,
        totalWorks: novelStats.totalNovels,
        todayWords,
        memberLevel,
      },
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
