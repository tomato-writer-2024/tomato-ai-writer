/**
 * 版权保护 API
 * 数字水印、时间戳、原创检测
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getToken } from '@/lib/auth-server';
import crypto from 'crypto';

/**
 * 生成数字水印
 */
function generateDigitalWatermark(userId: number, content: string): string {
  // 使用用户ID、时间戳和内容哈希生成唯一水印
  const timestamp = Date.now();
  const contentHash = crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
    .substring(0, 16);

  const watermarkData = `WATERMARK|${userId}|${timestamp}|${contentHash}`;
  const watermark = crypto
    .createHash('sha256')
    .update(watermarkData)
    .digest('hex')
    .substring(0, 32);

  return watermark;
}

/**
 * 验证数字水印
 */
function verifyDigitalWatermark(
  content: string,
  watermark: string
): { valid: boolean; userId?: number; timestamp?: number } {
  try {
    const data = Buffer.from(watermark, 'hex').toString();
    const parts = data.split('|');

    if (parts.length !== 4 || parts[0] !== 'WATERMARK') {
      return { valid: false };
    }

    const userId = parseInt(parts[1]);
    const timestamp = parseInt(parts[2]);
    const contentHash = parts[3];

    // 验证内容是否匹配
    const currentHash = crypto
      .createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 16);

    if (currentHash !== contentHash) {
      return { valid: false };
    }

    return { valid: true, userId, timestamp };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * 检测内容原创性（简单实现）
 */
async function checkOriginality(content: string, pool: any): Promise<{
  isOriginal: boolean;
  similarityScore: number;
  matches?: any[];
}> {
  // 检查数据库中是否存在相似内容
  const contentHash = crypto.createHash('md5').update(content).digest('hex');

  const result = await pool.query(
    `SELECT
      id,
      user_id,
      similarity($1, content) as similarity
    FROM copyright_records
    WHERE similarity($1, content) > 0.8
    LIMIT 10`,
    [content]
  );

  if (result.rows.length === 0) {
    return {
      isOriginal: true,
      similarityScore: 0,
    };
  }

  return {
    isOriginal: false,
    similarityScore: Math.max(...result.rows.map((r: any) => r.similarity)),
    matches: result.rows,
  };
}

/**
 * POST /api/protection/watermark
 * 添加数字水印
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
    const { content, documentId } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    // 生成数字水印
    const watermark = generateDigitalWatermark(userId, content);

    const pool = getPool();

    // 保存水印记录
    await pool.query(
      `INSERT INTO copyright_records
        (user_id, document_id, content_hash, watermark, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, document_id)
       DO UPDATE SET
         content_hash = $3,
         watermark = $4,
         updated_at = NOW()`,
      [
        userId,
        documentId || null,
        crypto.createHash('md5').update(content).digest('hex'),
        watermark,
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        watermark,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('添加水印失败:', error);
    return NextResponse.json(
      { success: false, error: '添加水印失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/protection/watermark
 * 验证数字水印
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: '缺少documentId参数' },
        { status: 400 }
      );
    }

    const pool = getPool();

    const result = await pool.query(
      `SELECT * FROM copyright_records WHERE document_id = $1`,
      [documentId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasWatermark: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasWatermark: true,
        watermark: result.rows[0].watermark,
        createdAt: result.rows[0].created_at,
        userId: result.rows[0].user_id,
      },
    });
  } catch (error) {
    console.error('验证水印失败:', error);
    return NextResponse.json(
      { success: false, error: '验证水印失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/protection/originality
 * 检测原创性
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

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const result = await checkOriginality(content, pool);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('检测原创性失败:', error);
    return NextResponse.json(
      { success: false, error: '检测原创性失败' },
      { status: 500 }
    );
  }
}
