import { NextRequest, NextResponse } from 'next/server';

// 简化的用户存储（生产环境应使用数据库）
const users: Record<string, { username: string; email: string; password: string; role: string }> = {};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = users[email];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 创建token（简化版，生产环境应使用JWT）
    const token = Buffer.from(JSON.stringify({ email, role: user.role })).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 导出用户存储供注册API使用
export { users };
