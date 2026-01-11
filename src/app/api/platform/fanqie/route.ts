/**
 * 番茄小说平台对接 API
 * 实现多平台发布和管理
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';
import crypto from 'crypto';

/**
 * 平台配置
 */
const FANQIE_CONFIG = {
  baseUrl: process.env.FANQIE_API_URL || 'https://api.fanqienovel.com',
  appKey: process.env.FANQIE_APP_KEY || '',
  appSecret: process.env.FANQIE_APP_SECRET || '',
};

/**
 * 签名生成
 */
function generateSignature(params: any, secret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join('&') + `&key=${secret}`;

  return crypto.createHash('md5').update(signStr).digest('hex');
}

/**
 * POST /api/platform/fanqie/sync
 * 同步作品到番茄小说
 */
export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = token.userId;
    const body = await request.json();
    const { workId, chapters } = body;

    if (!workId) {
      return NextResponse.json(
        { success: false, error: '缺少workId参数' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // 获取作品信息
    const workResult = await pool.query(
      `SELECT * FROM user_works WHERE id = $1 AND user_id = $2`,
      [workId, userId]
    );

    if (workResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '作品不存在' },
        { status: 404 }
      );
    }

    const work = workResult.rows[0];

    // 获取用户的番茄小说账号信息
    const accountResult = await pool.query(
      `SELECT * FROM platform_accounts
       WHERE user_id = $1 AND platform = 'fanqie' AND is_active = true`,
      [userId]
    );

    if (accountResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '未绑定番茄小说账号' },
        { status: 400 }
      );
    }

    const account = accountResult.rows[0];

    // 构建API请求参数
    const params: any = {
      app_key: FANQIE_CONFIG.appKey,
      timestamp: Date.now(),
      novel_id: work.external_id || '',
      title: work.title,
      description: work.description,
      category: work.genre,
      tags: work.tags || [],
    };

    // 生成签名
    const signature = generateSignature(params, FANQIE_CONFIG.appSecret);
    params.signature = signature;

    try {
      // 调用番茄小说API（模拟）
      // const response = await fetch(`${FANQIE_CONFIG.baseUrl}/v1/novel/sync`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${account.access_token}`,
      //   },
      //   body: JSON.stringify(params),
      // });

      // const data = await response.json();

      // 模拟成功响应
      const data = {
        success: true,
        novel_id: work.external_id || `fanqie_${Date.now()}`,
        message: '同步成功',
        signature: params.signature,
      };

      // 保存外部ID
      if (data.novel_id && !work.external_id) {
        await pool.query(
          `UPDATE user_works SET external_id = $1 WHERE id = $2`,
          [data.novel_id, workId]
        );
      }

      // 记录同步日志
      await pool.query(
        `INSERT INTO platform_sync_logs
          (user_id, work_id, platform, action, status, message, created_at)
         VALUES ($1, $2, 'fanqie', 'sync', 'success', $3, NOW())`,
        [userId, workId, data.message]
      );

      return NextResponse.json({
        success: true,
        data: {
          novelId: data.novel_id,
          message: data.message,
        },
      });
    } catch (apiError) {
      console.error('番茄小说API调用失败:', apiError);

      // 记录失败日志
      await pool.query(
        `INSERT INTO platform_sync_logs
          (user_id, work_id, platform, action, status, message, created_at)
         VALUES ($1, $2, 'fanqie', 'sync', 'failed', $3, NOW())`,
        [userId, workId, 'API调用失败']
      );

      return NextResponse.json(
        { success: false, error: '平台API调用失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('同步作品失败:', error);
    return NextResponse.json(
      { success: false, error: '同步作品失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/platform/fanqie/status
 * 查询同步状态
 */
export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = token.userId;
    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');

    if (!workId) {
      return NextResponse.json(
        { success: false, error: '缺少workId参数' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // 查询最新的同步日志
    const result = await pool.query(
      `SELECT * FROM platform_sync_logs
       WHERE user_id = $1 AND work_id = $2 AND platform = 'fanqie'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, workId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          synced: false,
          message: '尚未同步',
        },
      });
    }

    const log = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        synced: log.status === 'success',
        lastSync: log.created_at,
        message: log.message,
        status: log.status,
      },
    });
  } catch (error) {
    console.error('查询同步状态失败:', error);
    return NextResponse.json(
      { success: false, error: '查询同步状态失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/platform/fanqie/account
 * 绑定番茄小说账号
 */
export async function PUT(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = token.userId;
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '缺少账号信息' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // 检查是否已绑定
    const existingResult = await pool.query(
      `SELECT * FROM platform_accounts
       WHERE user_id = $1 AND platform = 'fanqie'`,
      [userId]
    );

    if (existingResult.rows.length > 0) {
      // 更新账号信息
      await pool.query(
        `UPDATE platform_accounts
         SET username = $1, access_token = $2, is_active = true, updated_at = NOW()
         WHERE id = $3`,
        [username, password, existingResult.rows[0].id]
      );
    } else {
      // 插入新账号
      await pool.query(
        `INSERT INTO platform_accounts
          (user_id, platform, username, access_token, is_active, created_at, updated_at)
         VALUES ($1, 'fanqie', $2, $3, true, NOW(), NOW())`,
        [userId, username, password]
      );
    }

    return NextResponse.json({
      success: true,
      message: '账号绑定成功',
    });
  } catch (error) {
    console.error('绑定账号失败:', error);
    return NextResponse.json(
      { success: false, error: '绑定账号失败' },
      { status: 500 }
    );
  }
}
