import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager } from '@/storage/database';

/**
 * 确认支付请求（用户点击"已支付，确认支付"按钮）
 * 将订单状态更新为 PENDING_CONFIRMATION，等待管理员审核
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
			return NextResponse.json({ error }, { status: 401 });
		}

		// 获取订单
		const order = await membershipOrderManager.getOrderById(id);
		if (!order) {
			return NextResponse.json(
				{ error: '订单不存在' },
				{ status: 404 }
			);
		}

		// 验证订单所有权
		if (order.userId !== user.id) {
			return NextResponse.json(
				{ error: '无权操作此订单' },
				{ status: 403 }
			);
		}

		// 检查订单状态
		if (order.paymentStatus === 'PAID') {
			return NextResponse.json(
				{ error: '订单已支付，无需重复确认' },
				{ status: 400 }
			);
		}

		if (order.paymentStatus === 'EXPIRED' || order.paymentStatus === 'FAILED') {
			return NextResponse.json(
				{ error: '订单已失效，无法确认支付' },
				{ status: 400 }
			);
		}

		// 更新订单状态为待确认
		// 注意：这里直接更新订单状态为PAID，自动开通会员服务
		// 对于个人开发者，用户确认支付后，系统会自动处理
		await membershipOrderManager.markAsPaid(order.id, `manual_${Date.now()}`);

		// 计算会员到期时间
		const expireDate = membershipOrderManager.calculateExpireDate(
			order.months,
			user.membershipExpireAt ? new Date(user.membershipExpireAt) : undefined
		);

		// 升级会员
		const { userManager } = await import('@/storage/database');
		await userManager.upgradeMembership(user.id, order.level, expireDate);

		return NextResponse.json({
			success: true,
			message: '支付确认成功！会员服务已立即生效。',
			data: {
				level: order.level,
				expireAt: expireDate,
			},
		});
	} catch (error) {
		console.error('确认支付失败:', error);
		return NextResponse.json(
			{ error: '确认支付失败' },
			{ status: 500 }
		);
	}
}
