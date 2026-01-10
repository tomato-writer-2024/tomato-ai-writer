import { NextRequest, NextResponse } from 'next/server';
import { userManager, authManager } from '@/storage/database';
import { generateResetToken, verifyResetToken, getClientIp } from '@/lib/auth';
import { emailService, EmailTemplate } from '@/lib/emailService';

/**
 * 忘记密码API - 发送重置密码链接
 *
 * 集成了真实的邮件服务（Nodemailer）
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const user = await userManager.getUserByEmail(email);

    // 无论用户是否存在，都返回成功（防止邮箱枚举攻击）
    if (!user) {
      console.log(`[忘记密码] 邮箱未注册: ${email}`);
      return NextResponse.json({
        success: true,
        message: '如果该邮箱已注册，重置链接已发送',
      });
    }

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

    // 发送邮件
    const emailResult = await emailService.sendTemplateEmail(
      EmailTemplate.FORGOT_PASSWORD,
      {
        resetLink: resetUrl,
        username: user.username || undefined,
        expiresIn: 30,
      },
      email
    );

    if (!emailResult.success) {
      console.error('[忘记密码] 邮件发送失败:', emailResult.error);

      // 记录失败事件
      await authManager.logSecurityEvent({
        userId: user.id,
        action: 'PASSWORD_RESET',
        details: JSON.stringify({ email, error: emailResult.error }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: '邮件发送失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 记录安全事件
    await authManager.logSecurityEvent({
      userId: user.id,
      action: 'PASSWORD_RESET',
      details: JSON.stringify({ email, action: 'Password reset requested' }),
      ipAddress: getClientIp(request),
      status: 'SUCCESS',
    });

    // 返回成功
    return NextResponse.json({
      success: true,
      message: '如果该邮箱已注册，重置链接已发送',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    // 记录失败事件
    await authManager.logSecurityEvent({
      userId: null,
      action: 'PASSWORD_RESET',
      details: JSON.stringify({ error: String(error) }),
      ipAddress: getClientIp(request),
      status: 'FAILED',
    });

    return NextResponse.json(
      { success: false, error: '发送失败，请稍后重试' },
      { status: 500 }
    );
  }
}
