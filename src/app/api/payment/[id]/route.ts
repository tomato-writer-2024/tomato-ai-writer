import { NextRequest, NextResponse } from 'next/server';
import { orderManager, userManager } from '@/storage/database';
import { OrderStatus } from '@/storage/database';
import { verifyToken } from '@/lib/auth';

/**
 * 支付接口
 * 注意：这是一个模拟支付接口，实际项目中应该对接支付宝、微信支付等第三方支付平台
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 获取订单
    const order = await orderManager.getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单所属用户
    if (order.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: '无权访问此订单' },
        { status: 403 }
      );
    }

    // 验证订单状态
    if (order.paymentStatus !== OrderStatus.PENDING) {
      return NextResponse.json(
        { success: false, error: '订单状态不允许支付' },
        { status: 400 }
      );
    }

    // 获取支付方式
    const { paymentMethod } = await request.json();

    // 模拟支付处理
    // 实际项目中应该：
    // 1. 调用支付宝/微信支付API创建支付订单
    // 2. 返回支付URL或支付参数
    // 3. 接收支付回调
    // 4. 验证支付结果
    // 5. 更新订单状态

    // 模拟支付成功
    const transactionId = `TXN${Date.now()}`;

    // 更新订单状态为已支付
    const updatedOrder = await orderManager.updateOrderStatus(
      id,
      OrderStatus.PAID,
      { transactionId }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: '更新订单状态失败' },
        { status: 500 }
      );
    }

    // 计算会员到期时间
    const now = new Date();
    const membershipExpireAt = new Date(now);
    if (order.months === 1) {
      membershipExpireAt.setMonth(membershipExpireAt.getMonth() + 1);
    } else if (order.months === 12) {
      membershipExpireAt.setFullYear(membershipExpireAt.getFullYear() + 1);
    } else {
      membershipExpireAt.setMonth(membershipExpireAt.getMonth() + order.months);
    }

    // 更新用户会员等级
    await userManager.updateMembership(
      order.userId,
      updatedOrder.level as any,
      membershipExpireAt
    );

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.transactionId || updatedOrder.id,
        status: updatedOrder.paymentStatus,
        paidAt: updatedOrder.paidAt,
        paymentDetails: { transactionId },
        membershipLevel: updatedOrder.level,
        membershipExpireAt,
      },
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { success: false, error: '支付失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 获取支付状态
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 获取订单
    const order = await orderManager.getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单所属用户
    if (order.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: '无权访问此订单' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.transactionId || order.id,
        status: order.paymentStatus,
        price: order.amount / 100, // 转换为元
        membershipLevel: order.level,
        paidAt: order.paidAt,
        paymentDetails: { transactionId: order.transactionId },
      },
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json(
      { success: false, error: '获取支付状态失败，请稍后重试' },
      { status: 500 }
    );
  }
}
