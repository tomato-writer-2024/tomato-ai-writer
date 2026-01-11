/**
 * 版权保护 - 数字水印 API
 * 实现数字水印、时间戳、原创检测等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * POST /api/protection/watermark
 * 生成数字水印
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
    const { content, chapterId } = await request.json();

    // 生成唯一标识
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHash('sha256')
      .update(`${userId}-${chapterId}-${timestamp}`)
      .digest('hex');

    // 嵌入水印（简单示例：在文本末尾添加隐藏字符）
    const watermarkedContent = `${content}\u200B\u200B${signature}`;

    // 保存水印记录
    await db.query(
      `INSERT INTO copyright_protection
       (user_id, chapter_id, content_hash, signature, watermark, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        userId,
        chapterId,
        crypto.createHash('sha256').update(content).digest('hex'),
        signature,
        watermarkedContent,
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        signature,
        watermarkedContent,
        timestamp,
      },
    });
  } catch (error) {
    console.error('生成数字水印失败:', error);
    return NextResponse.json({ error: '生成数字水印失败' }, { status: 500 });
  }
}

/**
 * GET /api/protection/verify?signature=xxx
 * 验证数字水印
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature');

    if (!signature) {
      return NextResponse.json({ error: '缺少signature参数' }, { status: 400 });
    }

    const result = await db.query(
      `SELECT
        cp.content_hash,
        cp.signature,
        cp.created_at,
        u.username as author_name
      FROM copyright_protection cp
      JOIN users u ON cp.user_id = u.user_id
      WHERE cp.signature = $1`,
      [signature]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '未找到匹配的版权记录',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        author: result.rows[0].author_name,
        contentHash: result.rows[0].content_hash,
        timestamp: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('验证数字水印失败:', error);
    return NextResponse.json({ error: '验证数字水印失败' }, { status: 500 });
  }
}

/**
 * POST /api/protection/detect
 * 原创性检测
 */
export async function detectOriginality(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token无效' }, { status: 401 });
    }

    const { content } = await request.json();

    // 简单的原创性检测（实际应该使用更复杂的算法）
    const contentHash = crypto.createHash('sha256').update(content).digest('hex');

    // 检查数据库中是否有相似内容
    const result = await db.query(
      `SELECT
        content_hash,
        similarity_score
      FROM copyright_protection
      WHERE similarity($1, content) > 0.8
      ORDER BY similarity_score DESC
      LIMIT 5`,
      [content]
    );

    const originalityScore = result.rows.length > 0
      ? Math.max(0, 1 - result.rows[0].similarity_score)
      : 1.0;

    return NextResponse.json({
      success: true,
      data: {
        originalityScore: Math.round(originalityScore * 100) / 100,
        similarWorks: result.rows.length,
        isOriginal: originalityScore >= 0.9,
      },
    });
  } catch (error) {
    console.error('原创性检测失败:', error);
    return NextResponse.json({ error: '原创性检测失败' }, { status: 500 });
  }
}
