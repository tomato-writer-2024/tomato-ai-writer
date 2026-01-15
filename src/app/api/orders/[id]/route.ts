import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager } from '@/storage/database';

/**
 * 获取订单详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户身份
    const { user, error } = await extractUserFromRequest(request);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    const { id } = await params;

    // 获取订单
    const order = await membershipOrderManager.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单所有权（管理员可以查看所有订单）
    if (order.userId !== user.id && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权访问此订单' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取订单详情失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新订单信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户身份
    const { user, error } = await extractUserFromRequest(request);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { notes } = body;

    // 获取订单
    const order = await membershipOrderManager.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单所有权
    if (order.userId !== user.id && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权修改此订单' },
        { status: 403 }
      );
    }

    // 检查订单状态（只有待支付或待审核的订单可以修改）
    if (
      order.paymentStatus !== 'PENDING' &&
      order.paymentStatus !== 'PENDING_REVIEW'
    ) {
      return NextResponse.json(
        { success: false, error: '订单状态不允许修改' },
        { status: 400 }
      );
    }

    // 更新订单备注
    if (notes !== undefined) {
      await membershipOrderManager.updateOrderNotes(id, notes);
    }

    // 获取更新后的订单
    const updatedOrder = await membershipOrderManager.getOrderById(id);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json(
      { success: false, error: '更新订单失败' },
      { status: 500 }
    );
  }
}
