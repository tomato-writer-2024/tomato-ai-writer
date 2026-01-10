import { NextRequest, NextResponse } from 'next/server';
import { userManager, authManager } from '@/storage/database';
import { generateResetToken, verifyResetToken, getClientIp } from '@/lib/auth';
import { emailService, EmailTemplate } from '@/lib/emailService';

/**
 * 忘记密码API - 发送重置密码链接
 *
 * 支持Mock模式（未配置邮件时自动启用）
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('[忘记密码] 收到请求:', { email });

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      console.log('[忘记密码] 邮箱格式不正确:', email);
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    console.log('[忘记密码] 查询用户:', email);
    const user = await userManager.getUserByEmail(email);

    // 无论用户是否存在，都返回成功（防止邮箱枚举攻击）
    if (!user) {
      console.log('[忘记密码] 邮箱未注册:', email);
      return NextResponse.json({
        success: true,
        message: '如果该邮箱已注册，重置链接已发送',
      });
    }

    console.log('[忘记密码] 找到用户:', user.id);

    // 生成重置token（有效期30分钟）
    const resetToken = generateResetToken({
      userId: user.id,
      email: user.email,
    });

    // 构建重置链接
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // 在开发环境，打印重置链接到控制台（方便调试）
    console.log('\n========================================');
    console.log('[忘记密码] 重置密码链接:');
    console.log(resetUrl);
    console.log('========================================\n');

    // Mock模式：直接返回成功
    console.log('[忘记密码] Mock模式：模拟邮件发送成功');

    // 返回成功
    return NextResponse.json({
      success: true,
      message: '如果该邮箱已注册，重置链接已发送（开发环境Mock模式）',
      debug: {
        mockMode: true,
        resetUrl: resetUrl,
      },
    });

  } catch (error) {
    console.error('[忘记密码] 服务器错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
