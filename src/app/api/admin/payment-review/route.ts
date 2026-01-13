import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager, userManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 获取待审核订单列表（管理员）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份和权限
    const { user, error } = await extractUserFromRequest(request);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    // 检查管理员权限
    if (!hasRole(user.role as any, [UserRole.SUPER_ADMIN, UserRole.ADMIN])) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 获取待审核订单
    const orders = await membershipOrderManager.getPendingReviewOrders();

    return NextResponse.json({
      success: true,
      data: orders.slice(skip, skip + limit),
      total: orders.length,
    });
  } catch (error) {
    console.error('获取待审核订单列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取待审核订单列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 审核支付凭证（管理员）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份和权限
    const { user, error } = await extractUserFromRequest(request);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    // 检查管理员权限
    if (!hasRole(user.role as any, [UserRole.SUPER_ADMIN, UserRole.ADMIN])) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const { orderId, approved, reviewNotes } = await request.json();

    if (!orderId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取订单
    const order = await membershipOrderManager.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 检查订单状态
    if (order.paymentStatus !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { success: false, error: '订单状态不正确' },
        { status: 400 }
      );
    }

    if (approved) {
      // 审核通过，激活会员
      const transactionId = `MANUAL_${Date.now()}_${user.id}`;

      // 更新订单状态为已支付
      await membershipOrderManager.markAsPaid(orderId, transactionId);

      // 计算会员到期时间
      const userInfo = await userManager.getUserById(order.userId);
      const expireDate = membershipOrderManager.calculateExpireDate(
        order.months,
        userInfo?.membershipExpireAt ? new Date(userInfo.membershipExpireAt) : undefined
      );

      // 升级会员
      await userManager.upgradeMembership(order.userId, order.level, expireDate);

      // 更新订单备注
      await membershipOrderManager.updateOrderNotes(orderId, JSON.stringify({
        proof: JSON.parse(order.notes || '{}').proof,
        status: 'APPROVED',
        reviewNotes: reviewNotes || '审核通过',
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
      }));
    } else {
      // 审核拒绝
      await membershipOrderManager.markAsFailed(orderId);

      // 更新订单备注
      await membershipOrderManager.updateOrderNotes(orderId, JSON.stringify({
        proof: JSON.parse(order.notes || '{}').proof,
        status: 'REJECTED',
        reviewNotes: reviewNotes || '审核拒绝',
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        approved,
        message: approved ? '审核通过，会员已激活' : '审核拒绝',
      },
    });
  } catch (error) {
    console.error('审核支付凭证失败:', error);
    return NextResponse.json(
      { success: false, error: '审核支付凭证失败' },
      { status: 500 }
    );
  }
}
