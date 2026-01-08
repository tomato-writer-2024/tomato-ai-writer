import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager, userManager } from '@/storage/database';

/**
 * 获取支付页面信息
 */
export async function GET(
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
				{ error: '无权访问此订单' },
				{ status: 403 }
			);
		}

		// 返回订单信息
		return NextResponse.json({
			success: true,
			data: {
				orderId: order.id,
				level: order.level,
				months: order.months,
				amount: order.amount,
				paymentMethod: order.paymentMethod,
				paymentStatus: order.paymentStatus,
				createdAt: order.createdAt,
			},
		});
	} catch (error) {
		console.error('获取支付信息失败:', error);
		return NextResponse.json(
			{ error: '获取支付信息失败' },
			{ status: 500 }
		);
	}
}

/**
 * 模拟支付完成（生产环境应该使用真实的支付回调）
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

		const body = await request.json();
		const { success, transactionId } = body;

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

		// 如果支付成功
		if (success) {
			// 更新订单状态
			await membershipOrderManager.markAsPaid(id, transactionId || `mock_${Date.now()}`);

			// 计算会员到期时间
			const expireDate = membershipOrderManager.calculateExpireDate(
				order.months,
				user.membershipExpireAt ? new Date(user.membershipExpireAt) : undefined
			);

			// 升级会员
			await userManager.upgradeMembership(user.id, order.level, expireDate);

			return NextResponse.json({
				success: true,
				data: {
					message: '支付成功，会员升级完成',
					level: order.level,
					expireAt: expireDate,
				},
			});
		} else {
			// 支付失败
			await membershipOrderManager.markAsFailed(id);

			return NextResponse.json({
				success: false,
				error: '支付失败',
			});
		}
	} catch (error) {
		console.error('处理支付失败:', error);
		return NextResponse.json(
			{ error: '处理支付失败' },
			{ status: 500 }
		);
	}
}
