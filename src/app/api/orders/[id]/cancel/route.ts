import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 取消订单（用户端）
 * 只能取消待支付状态的订单
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
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
				{ success: false, error: '无权操作此订单' },
				{ status: 403 }
			);
		}

		// 检查订单状态（只能取消待支付订单）
		if (order.paymentStatus !== 'PENDING') {
			return NextResponse.json(
				{ success: false, error: '只能取消待支付状态的订单' },
				{ status: 400 }
			);
		}

		// 取消订单
		await membershipOrderManager.updatePaymentStatus(id, 'CANCELLED');

		return NextResponse.json({
			success: true,
			data: {
				orderId: id,
				message: '订单已取消',
			},
		});
	} catch (error) {
		console.error('取消订单失败:', error);
		return NextResponse.json(
			{ success: false, error: '取消订单失败' },
			{ status: 500 }
		);
	}
}
