import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { hashPassword } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * 管理员重置用户密码API
 *
 * 需要超级管理员权限
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== 管理员重置用户密码请求开始 =====`);

  try {
    // 验证管理员token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[${requestId}] 未提供认证token`);
      return NextResponse.json(
        { success: false, error: '未提供认证token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      console.log(`[${requestId}] Token验证失败`);
      return NextResponse.json(
        { success: false, error: '无效的token' },
        { status: 401 }
      );
    }

    // 查询管理员信息
    const admin = await userManager.getUserById(payload.userId);
    if (!admin || !admin.isSuperAdmin) {
      console.log(`[${requestId}] 管理员权限验证失败`);
      return NextResponse.json(
        { success: false, error: '无权访问此功能' },
        { status: 403 }
      );
    }

    console.log(`[${requestId}] 管理员验证通过: ${admin.email}`);

    // 获取请求参数
    const { email, newPassword } = await request.json();

    console.log(`[${requestId}] 请求参数:`, {
      targetEmail: email,
      hasPassword: !!newPassword,
    });

    // 验证参数
    if (!email || !newPassword) {
      console.log(`[${requestId}] 参数不完整`);
      return NextResponse.json(
        { success: false, error: '邮箱和新密码不能为空' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      console.log(`[${requestId}] 密码长度不足`);
      return NextResponse.json(
        { success: false, error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 查询目标用户
    console.log(`[${requestId}] 查询用户: ${email}`);
    const targetUser = await userManager.getUserByEmail(email);

    if (!targetUser) {
      console.log(`[${requestId}] 用户不存在: ${email}`);
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    console.log(`[${requestId}] 找到用户:`, {
      userId: targetUser.id,
      email: targetUser.email,
      username: targetUser.username,
    });

    // 哈希新密码
    console.log(`[${requestId}] 哈希新密码...`);
    const passwordHash = await hashPassword(newPassword);

    // 更新密码
    const db = await getDb();
    await db.update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, targetUser.id));

    console.log(`[${requestId}] 密码更新成功`);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '密码重置成功',
      data: {
        userId: targetUser.id,
        email: targetUser.email,
        username: targetUser.username,
        newPassword: newPassword, // 仅在响应中返回一次，方便管理员告知用户
      },
    });
  } catch (error) {
    console.error(`[${requestId}] 重置密码失败:`, error);
    return NextResponse.json(
      { success: false, error: '重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}
