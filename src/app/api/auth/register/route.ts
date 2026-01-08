import { NextRequest, NextResponse } from 'next/server';
import { users } from '../login/route';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    if (users[email]) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 创建用户（默认为免费版用户）
    users[email] = {
      username,
      email,
      password,
      role: 'free',
    };

    // 创建token
    const token = Buffer.from(JSON.stringify({ email, role: 'free' })).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          username,
          email,
          role: 'free',
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
