import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager } from '@/storage/database';
import { membershipOrders } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';

/**
 * 上传支付凭证
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
    const { proofUrl, proofType = 'image', notes } = body;

    // 验证参数
    if (!proofUrl) {
      return NextResponse.json(
        { success: false, error: '缺少支付凭证URL' },
        { status: 400 }
      );
    }

    if (typeof proofUrl !== 'string' || proofUrl.length > 500) {
      return NextResponse.json(
        { success: false, error: '支付凭证URL格式不正确' },
        { status: 400 }
      );
    }

    // 验证凭证类型
    const validTypes = ['image', 'pdf', 'text'];
    if (!validTypes.includes(proofType)) {
      return NextResponse.json(
        { success: false, error: '无效的凭证类型' },
        { status: 400 }
      );
    }

    // 获取订单
    const order = await membershipOrderManager.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单所有权
    if (order.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权修改此订单' },
        { status: 403 }
      );
    }

    // 检查订单状态（只有待支付的订单可以上传凭证）
    if (order.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: '订单状态不允许上传凭证' },
        { status: 400 }
      );
    }

    // 更新订单状态为待审核
    const db = await getDb();
    await db
      .update(membershipOrders)
      .set({
        proofUrl,
        proofType,
        paymentStatus: 'PENDING_REVIEW',
        reviewStatus: 'PENDING',
        notes: notes || '',
      })
      .where(eq(membershipOrders.id, id));

    // 获取更新后的订单
    const updatedOrder = await membershipOrderManager.getOrderById(id);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: '支付凭证上传成功，等待管理员审核',
    });
  } catch (error) {
    console.error('上传支付凭证失败:', error);
    return NextResponse.json(
      { success: false, error: '上传支付凭证失败' },
      { status: 500 }
    );
  }
}
