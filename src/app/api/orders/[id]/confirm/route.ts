import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager, userManager } from '@/storage/database';

/**
 * 确认支付（管理员审核通过后使用）
 */
export async function POST(
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
    const { transactionId, notes } = body;

    // 验证订单是否存在
    const order = await membershipOrderManager.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 只有订单所有者可以确认支付
    if (order.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作此订单' },
        { status: 403 }
      );
    }

    // 检查订单状态
    if (order.paymentStatus !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { success: false, error: '订单状态不正确，当前状态: ' + order.paymentStatus },
        { status: 400 }
      );
    }

    // 更新订单备注（添加用户确认信息）
    const existingNotes = order.notes || '{}';
    let notesObj;
    try {
      notesObj = typeof existingNotes === 'string'
        ? JSON.parse(existingNotes)
        : existingNotes;
    } catch (e) {
      notesObj = {};
    }

    notesObj.userConfirm = {
      confirmedAt: new Date().toISOString(),
      notes: notes || '',
      transactionId: transactionId || '',
    };

    await membershipOrderManager.updateOrderNotes(id, JSON.stringify(notesObj));

    // 获取更新后的订单
    const updatedOrder = await membershipOrderManager.getOrderById(id);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: '支付确认成功，等待管理员审核',
    });
  } catch (error) {
    console.error('确认支付失败:', error);
    return NextResponse.json(
      { success: false, error: '确认支付失败' },
      { status: 500 }
    );
  }
}
