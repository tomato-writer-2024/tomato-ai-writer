import { NextRequest, NextResponse } from 'next/server';
import { orderManager, userManager } from '@/storage/database';
import { MembershipLevel, OrderStatus } from '@/storage/database';
import { verifyToken, checkUserQuota } from '@/lib/auth';

/**
 * 创建会员订单API
 */
export async function POST(request: NextRequest) {
  try {
    // 验证token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '令牌无效' },
        { status: 401 }
      );
    }

    // 获取用户信息
    const user = await userManager.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取请求体
    const { membershipLevel, billingCycle } = await request.json();

    // 验证参数
    if (!membershipLevel || !billingCycle) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // 验证会员等级
    const validLevels = [MembershipLevel.FREE, MembershipLevel.BASIC, MembershipLevel.PREMIUM, MembershipLevel.ENTERPRISE];
    if (!validLevels.includes(membershipLevel)) {
      return NextResponse.json(
        { success: false, error: '无效的会员等级' },
        { status: 400 }
      );
    }

    // 验证计费周期
    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      return NextResponse.json(
        { success: false, error: '无效的计费周期' },
        { status: 400 }
      );
    }

    // 计算价格
    const prices: Record<string, { monthly: number; yearly: number }> = {
      [MembershipLevel.FREE]: { monthly: 0, yearly: 0 },
      [MembershipLevel.BASIC]: { monthly: 29, yearly: 261 }, // 年付省10%
      [MembershipLevel.PREMIUM]: { monthly: 99, yearly: 891 },
      [MembershipLevel.ENTERPRISE]: { monthly: 299, yearly: 2691 },
    };

    const price = (prices as any)[membershipLevel]?.[billingCycle] || 0;

    // 计算会员到期时间
    const now = new Date();
    const membershipExpireAt = new Date(now);
    if (billingCycle === 'monthly') {
      membershipExpireAt.setMonth(membershipExpireAt.getMonth() + 1);
    } else {
      membershipExpireAt.setFullYear(membershipExpireAt.getFullYear() + 1);
    }

    // 创建订单
    const order = await orderManager.createOrder({
      userId: user.id,
      level: membershipLevel,
      months: billingCycle === 'monthly' ? 1 : 12,
      amount: price * 100, // 转换为分
      paymentMethod: 'alipay', // 默认支付宝
      paymentStatus: OrderStatus.PENDING,
    });

    // 返回订单信息（实际项目中应该返回支付URL或支付参数）
    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.transactionId || order.id,
        price: order.amount / 100, // 转换为元
        membershipLevel: order.level,
        billingCycle,
        membershipExpireAt,
        // 模拟支付URL，实际项目中应该对接支付宝/微信支付
        paymentUrl: `/api/payment/${order.id}`,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: '创建订单失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 获取用户订单列表API
 */
export async function GET(request: NextRequest) {
  try {
    // 验证token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '令牌无效' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | null;
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // 获取订单列表
    const orders = await orderManager.getOrdersByUserId(payload.userId, {
      skip,
      limit,
      status: status || undefined,
    });

    // 统计订单数量
    const total = await orderManager.countUserOrders(payload.userId, status || undefined);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        total,
        skip,
        limit,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: '获取订单失败，请稍后重试' },
      { status: 500 }
    );
  }
}
