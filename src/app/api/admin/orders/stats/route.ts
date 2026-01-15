import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager, userManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 获取订单统计信息（管理员）
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
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		// 获取所有订单
		const allOrders = await membershipOrderManager.getOrders({ limit: 10000 });

		// 根据日期范围过滤
		const filteredOrders = startDate || endDate
			? allOrders.filter(order => {
				const orderDate = new Date(order.createdAt);
				if (startDate && orderDate < new Date(startDate)) return false;
				if (endDate && orderDate > new Date(endDate)) return false;
				return true;
			})
			: allOrders;

		// 计算统计数据
		const stats: any = {
			// 订单总数
			totalOrders: filteredOrders.length,

			// 各状态订单数量
			pendingOrders: filteredOrders.filter(o => o.paymentStatus === 'PENDING').length,
			paidOrders: filteredOrders.filter(o => o.paymentStatus === 'PAID').length,
			failedOrders: filteredOrders.filter(o => o.paymentStatus === 'FAILED').length,
			cancelledOrders: filteredOrders.filter(o => o.paymentStatus === 'CANCELLED').length,
			refundedOrders: filteredOrders.filter(o => o.paymentStatus === 'REFUNDED').length,
			pendingReviewOrders: filteredOrders.filter(o => o.paymentStatus === 'PENDING_REVIEW').length,
			refundingOrders: filteredOrders.filter(o => o.paymentStatus === 'REFUNDING').length,

			// 收入统计
			totalRevenue: filteredOrders
				.filter(o => o.paymentStatus === 'PAID')
				.reduce((sum, o) => sum + o.amount, 0),

			// 退款金额
			totalRefunded: filteredOrders
				.filter(o => o.paymentStatus === 'REFUNDED')
				.reduce((sum, o) => {
					const notes = JSON.parse(o.notes || '{}');
					return sum + (notes.refundAmount || o.amount);
				}, 0),

			// 净收入
			netRevenue: 0, // 稍后计算

			// 各套餐销售数量
			basicOrders: filteredOrders.filter(o => o.level === 'BASIC').length,
			premiumOrders: filteredOrders.filter(o => o.level === 'PREMIUM').length,
			enterpriseOrders: filteredOrders.filter(o => o.level === 'ENTERPRISE').length,

			// 各套餐收入
			basicRevenue: filteredOrders
				.filter(o => o.level === 'BASIC' && o.paymentStatus === 'PAID')
				.reduce((sum, o) => sum + o.amount, 0),
			premiumRevenue: filteredOrders
				.filter(o => o.level === 'PREMIUM' && o.paymentStatus === 'PAID')
				.reduce((sum, o) => sum + o.amount, 0),
			enterpriseRevenue: filteredOrders
				.filter(o => o.level === 'ENTERPRISE' && o.paymentStatus === 'PAID')
				.reduce((sum, o) => sum + o.amount, 0),

			// 支付方式统计
			alipayOrders: filteredOrders.filter(o => o.paymentMethod === 'alipay').length,
			wechatOrders: filteredOrders.filter(o => o.paymentMethod === 'wechat').length,

			// 支付方式收入
			alipayRevenue: filteredOrders
				.filter(o => o.paymentMethod === 'alipay' && o.paymentStatus === 'PAID')
				.reduce((sum, o) => sum + o.amount, 0),
			wechatRevenue: filteredOrders
				.filter(o => o.paymentMethod === 'wechat' && o.paymentStatus === 'PAID')
				.reduce((sum, o) => sum + o.amount, 0),
		};

		// 计算净收入
		stats.netRevenue = stats.totalRevenue - stats.totalRefunded;

		// 计算支付成功率
		stats.paymentSuccessRate = stats.totalOrders > 0
			? Math.round((stats.paidOrders / (stats.paidOrders + stats.failedOrders)) * 100)
			: 0;

		return NextResponse.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error('获取订单统计失败:', error);
		return NextResponse.json(
			{ success: false, error: '获取订单统计失败' },
			{ status: 500 }
		);
	}
}
