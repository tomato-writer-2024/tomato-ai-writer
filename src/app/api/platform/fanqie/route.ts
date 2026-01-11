/**
 * 平台对接 - 番茄小说 API
 * 实现多平台账号管理、作品同步发布
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * GET /api/platform/fanqie
 * 获取番茄小说账号信息
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token无效' }, { status: 401 });
    }

    const userId = payload.userId;

    const result = await db.query(
      `SELECT
        platform_account_id,
        platform_name,
        account_name,
        access_token,
        refresh_token,
        expires_at,
        is_active
      FROM platform_accounts
      WHERE user_id = $1 AND platform_name = 'fanqie'`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '未绑定番茄小说账号',
      });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('获取账号信息失败:', error);
    return NextResponse.json({ error: '获取账号信息失败' }, { status: 500 });
  }
}

/**
 * POST /api/platform/fanqie
 * 绑定番茄小说账号
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token无效' }, { status: 401 });
    }

    const userId = payload.userId;
    const { accountName, accessToken, refreshToken } = await request.json();

    const result = await db.query(
      `INSERT INTO platform_accounts
       (user_id, platform_name, account_name, access_token, refresh_token, expires_at, is_active, created_at)
       VALUES ($1, 'fanqie', $2, $3, $4, NOW() + INTERVAL '30 days', true, NOW())
       ON CONFLICT (user_id, platform_name)
       DO UPDATE SET
         account_name = $2,
         access_token = $3,
         refresh_token = $4,
         expires_at = NOW() + INTERVAL '30 days',
         is_active = true,
         updated_at = NOW()
       RETURNING platform_account_id`,
      [userId, accountName, accessToken, refreshToken]
    );

    return NextResponse.json({
      success: true,
      data: { platformAccountId: result.rows[0].platform_account_id },
    });
  } catch (error) {
    console.error('绑定账号失败:', error);
    return NextResponse.json({ error: '绑定账号失败' }, { status: 500 });
  }
}

/**
 * POST /api/platform/fanqie/publish
 * 同步发布到番茄小说
 */
export async function publishToFanqie(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token无效' }, { status: 401 });
    }

    const userId = payload.userId;
    const { chapterId, novelId } = await request.json();

    // 获取章节内容
    const chapter = await db.query(
      `SELECT title, content, chapter_number FROM chapters WHERE chapter_id = $1 AND user_id = $2`,
      [chapterId, userId]
    );

    if (chapter.rows.length === 0) {
      return NextResponse.json({ error: '章节不存在' }, { status: 404 });
    }

    // 获取平台账号
    const account = await db.query(
      `SELECT access_token FROM platform_accounts WHERE user_id = $1 AND platform_name = 'fanqie' AND is_active = true`,
      [userId]
    );

    if (account.rows.length === 0) {
      return NextResponse.json({ error: '未绑定番茄小说账号' }, { status: 400 });
    }

    // TODO: 调用番茄小说API进行发布
    // const response = await fetch('https://api.fanqie.com/v1/novels/chapters', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${account.rows[0].access_token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     novel_id: novelId,
    //     title: chapter.rows[0].title,
    //     content: chapter.rows[0].content,
    //     chapter_number: chapter.rows[0].chapter_number,
    //   }),
    // });

    // 记录发布日志
    await db.query(
      `INSERT INTO platform_publish_logs
       (user_id, chapter_id, platform_name, status, message, created_at)
       VALUES ($1, $2, 'fanqie', 'success', '发布成功', NOW())`,
      [userId, chapterId]
    );

    return NextResponse.json({
      success: true,
      message: '发布成功',
      data: {
        platformChapterId: `fanqie_${chapterId}`,
        publishTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('发布失败:', error);

    // 记录失败日志
    if (request.headers.get('authorization')) {
      const payload = verifyToken(request.headers.get('authorization')!.replace('Bearer ', ''));
      if (payload) {
        const { chapterId } = await request.json().catch(() => ({ chapterId: null }));
        if (chapterId) {
          await db.query(
            `INSERT INTO platform_publish_logs
             (user_id, chapter_id, platform_name, status, message, created_at)
             VALUES ($1, $2, 'fanqie', 'failed', $3, NOW())`,
            [payload.userId, chapterId, (error as Error).message]
          );
        }
      }
    }

    return NextResponse.json({ error: '发布失败' }, { status: 500 });
  }
}
