import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';

/**
 * 提交用户反馈
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份（可选）
    let userId: string | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // 简化验证，直接通过token获取用户ID（实际应该调用验证函数）
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      } catch (error) {
        // Token无效，用户以匿名身份提交
      }
    }

    const { type, category, subject, description, email, attachment } = await request.json();

    // 验证必填字段
    if (!type || !category || !subject || !description) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证反馈类型
    const validTypes = ['bug', 'feature', 'feedback', 'complaint', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: '无效的反馈类型' },
        { status: 400 }
      );
    }

    // 验证反馈分类
    const validCategories = ['general', 'ui', 'performance', 'ai', 'payment', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: '无效的反馈分类' },
        { status: 400 }
      );
    }

    // 验证字段长度
    if (subject.length > 200) {
      return NextResponse.json(
        { success: false, error: '主题不能超过200字' },
        { status: 400 }
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        { success: false, error: '描述不能超过5000字' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 构建反馈数据
    const feedback = {
      id: crypto.randomUUID(),
      userId,
      type,
      category,
      subject,
      description,
      email,
      attachment: attachment || null,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      createdAt: new Date().toISOString(),
      status: 'pending', // pending, reviewing, resolved, closed
    };

    // TODO: 将反馈保存到数据库
    // 暂时记录到日志
    console.log('[用户反馈]', feedback);

    // TODO: 发送邮件通知
    // 可以使用nodemailer发送邮件到 support@tomato-ai-writer.com

    return NextResponse.json({
      success: true,
      data: {
        feedbackId: feedback.id,
        message: '感谢您的反馈！我们会尽快处理。',
      },
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    return NextResponse.json(
      { success: false, error: '提交反馈失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 获取反馈类型和分类列表
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      types: [
        { value: 'bug', label: 'Bug反馈', description: '报告产品中的问题或错误' },
        { value: 'feature', label: '功能建议', description: '建议新功能或改进现有功能' },
        { value: 'feedback', label: '使用反馈', description: '分享您的使用体验和建议' },
        { value: 'complaint', label: '投诉', description: '对产品或服务的投诉' },
        { value: 'other', label: '其他', description: '其他类型的反馈' },
      ],
      categories: [
        { value: 'general', label: '常规问题', description: '一般性问题' },
        { value: 'ui', label: '界面问题', description: '用户界面相关' },
        { value: 'performance', label: '性能问题', description: '性能和速度相关' },
        { value: 'ai', label: 'AI生成', description: 'AI功能相关' },
        { value: 'payment', label: '支付问题', description: '会员和支付相关' },
        { value: 'other', label: '其他', description: '其他分类' },
      ],
    },
  });
}
