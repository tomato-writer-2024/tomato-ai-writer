import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager } from '@/storage/database';
import { MEMBERSHIP_PRICING } from '@/lib/types/user';

/**
 * 会员定价配置（单位：元）
 */
const MEMBERSHIP_PRICES = {
	FREE: { monthly: 0, yearly: 0 },
	BASIC: { monthly: 29, yearly: 261 },
	PREMIUM: { monthly: 99, yearly: 891 },
	ENTERPRISE: { monthly: 299, yearly: 2691 },
};

/**
 * 获取用户的订单列表
 */
export async function GET(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const skip = parseInt(searchParams.get('skip') || '0');
		const limit = parseInt(searchParams.get('limit') || '20');

		// 获取订单列表
		const orders = await membershipOrderManager.getOrdersByUserId(user.id, {
			skip,
			limit,
		});

		// 获取消费统计
		const stats = await membershipOrderManager.getUserSpendingStats(user.id);

		return NextResponse.json({
			success: true,
			data: orders,
			stats,
		});
	} catch (error) {
		console.error('获取订单列表失败:', error);
		return NextResponse.json(
			{ error: '获取订单列表失败' },
			{ status: 500 }
		);
	}
}

/**
 * 创建会员订单
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const body = await request.json();
		const { level, billingCycle, paymentMethod } = body;

		// 验证会员等级
		const validLevels = ['BASIC', 'PREMIUM', 'ENTERPRISE'];
		if (!level || !validLevels.includes(level)) {
			return NextResponse.json(
				{ error: '无效的会员等级' },
				{ status: 400 }
			);
		}

		// 验证计费周期
		const validCycles = ['monthly', 'yearly'];
		if (!billingCycle || !validCycles.includes(billingCycle)) {
			return NextResponse.json(
				{ error: '无效的计费周期' },
				{ status: 400 }
			);
		}

		// 验证支付方式
		const validMethods = ['alipay', 'wechat'];
		if (!paymentMethod || !validMethods.includes(paymentMethod)) {
			return NextResponse.json(
				{ error: '无效的支付方式' },
				{ status: 400 }
			);
		}

		// 计算金额和月数
		const pricing = MEMBERSHIP_PRICES[level as keyof typeof MEMBERSHIP_PRICES] as { monthly: number; yearly: number };
		const months = billingCycle === 'yearly' ? 12 : 1;
		const amount = pricing[billingCycle as keyof typeof pricing];

		// 创建订单（使用enhancedOrderManager自动生成orderNumber）
		const { enhancedOrderManager } = await import('@/storage/database');
		const order = await enhancedOrderManager.createOrder({
			userId: user.id,
			level,
			months,
			amount,
			paymentMethod,
		});

		// 返回订单信息和支付链接
		return NextResponse.json({
			success: true,
			data: {
				orderId: order.id,
				amount,
				level,
				billingCycle,
				paymentMethod,
				// TODO: 在实际生产环境中，这里应该返回真实的支付链接
				// 目前返回模拟的支付页面URL
				paymentUrl: `/payment/${order.id}`,
			},
		});
	} catch (error) {
		console.error('创建订单失败:', error);
		return NextResponse.json(
			{ error: '创建订单失败' },
			{ status: 500 }
		);
	}
}
