import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';

/**
 * Mock 模式创建超级管理员 API
 * 完全不依赖数据库，使用本地 JSON 文件存储
 */
export async function GET(request: Request) {
  console.log('===== Mock 模式超级管理员创建开始 =====');

  try {
    // Mock 管理员信息
    const adminEmail = 'admin@tomato-ai.com';
    const adminPassword = 'Admin123!';
    const adminUsername = '超级管理员';

    // 读取现有用户
    const mockDataPath = join(process.cwd(), '.mock-data', 'users.json');
    let users = [];

    try {
      const data = await fs.readFile(mockDataPath, 'utf-8');
      users = JSON.parse(data);
    } catch (error) {
      // 文件不存在，创建空数组
      users = [];
    }

    // 检查管理员是否已存在
    const existingAdmin = users.find((u: any) => u.email === adminEmail);
    if (existingAdmin) {
      console.log('超级管理员已存在:', adminEmail);
      return NextResponse.json({
        success: true,
        message: '超级管理员已存在',
        user: {
          email: adminEmail,
          username: adminUsername,
        },
      });
    }

    // 创建新管理员
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newAdmin = {
      id: 1,
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newAdmin);

    // 保存到文件
    await fs.writeFile(mockDataPath, JSON.stringify(users, null, 2), 'utf-8');

    console.log('✅ Mock 模式超级管理员创建成功:', adminEmail);

    return NextResponse.json({
      success: true,
      message: '超级管理员创建成功（Mock 模式）',
      user: {
        email: adminEmail,
        username: adminUsername,
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
      note: '请妥善保管管理员账号密码，用于登录系统',
    });
  } catch (error: any) {
    console.error('❌ Mock 模式超级管理员创建失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Mock 模式管理员创建失败',
      },
      { status: 500 }
    );
  }
}
