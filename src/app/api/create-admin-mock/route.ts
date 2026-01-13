import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

/**
 * Mock创建管理员API（用于本地开发，无需数据库）
 *
 * 使用方法：
 * GET /api/create-admin-mock?email=admin@example.com&password=admin123&username=超级管理员
 */
export async function GET(request: Request) {
  console.log('===== Mock创建管理员API开始 =====');

  try {
    // 手动解析 URL 参数
    const rawUrl = request.url;
    const urlParts = rawUrl.split('?');
    let email = 'admin@tomato-ai.com';
    let password = 'Admin@123456';
    let username = '超级管理员';

    if (urlParts.length > 1) {
      const params = new URLSearchParams(urlParts[1]);
      if (params.has('email')) email = params.get('email')!;
      if (params.has('password')) password = params.get('password')!;
      if (params.has('username')) username = params.get('username')!;
    }

    console.log('初始化参数:', {
      email,
      username,
      hasPassword: !!password,
    });

    // 使用 bcryptjs 哈希密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 生成UUID
    const adminId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    const now = new Date();
    const membershipExpireAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1年后

    // Mock管理员数据
    const admin = {
      id: adminId,
      email,
      username,
      role: 'DEVELOPER',
      membershipLevel: 'PREMIUM',
      membershipExpireAt: membershipExpireAt.toISOString(),
      isSuperAdmin: true,
      passwordHash,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // 保存到临时JSON文件
    const fs = await import('fs/promises');
    const path = await import('path');

    const mockDataDir = path.join(process.cwd(), '.mock-data');
    const usersFile = path.join(mockDataDir, 'users.json');

    // 确保目录存在
    try {
      await fs.mkdir(mockDataDir, { recursive: true });
    } catch (e) {
      // 目录已存在，忽略错误
    }

    // 读取现有用户或创建新数组
    let users = [];
    try {
      const data = await fs.readFile(usersFile, 'utf-8');
      users = JSON.parse(data);
    } catch (e) {
      users = [];
    }

    // 检查是否已存在管理员
    const existing = users.find((u: any) => u.email === email);
    if (existing) {
      console.log('管理员已存在:', existing.id);

      return NextResponse.json(
        {
          success: false,
          error: '管理员账户已存在',
          data: {
            id: existing.id,
            email: existing.email,
            username: existing.username,
            role: existing.role,
          },
        },
        { status: 400 }
      );
    }

    // 添加管理员
    users.push(admin);
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));

    console.log('超级管理员创建成功:', adminId);

    // 返回管理员信息（不包含密码）
    return NextResponse.json(
      {
        success: true,
        message: '超级管理员创建成功（Mock模式）',
        data: {
          id: adminId,
          email,
          username,
          role: 'DEVELOPER',
          membershipLevel: 'PREMIUM',
          membershipExpireAt: membershipExpireAt.toISOString(),
        },
        warnings: [
          '当前使用Mock模式，数据保存在.mock-data/users.json',
          '生产环境请使用真实数据库',
          '请立即修改默认密码',
        ],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('超级管理员创建失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '超级管理员创建失败',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
