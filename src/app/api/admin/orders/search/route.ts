import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { enhancedOrderManager, userManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 高级筛选订单（管理员）
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
		const limit = parseInt(searchParams.get('limit') || '20');
		const status = searchParams.get('status');
		const reviewStatus = searchParams.get('reviewStatus');
		const membershipLevel = searchParams.get('membershipLevel');
		const userId = searchParams.get('userId');
		const orderNumber = searchParams.get('orderNumber');
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		// 按订单号搜索
		if (orderNumber) {
			const order = await enhancedOrderManager.getOrderByOrderNumber(orderNumber);
			if (order) {
				return NextResponse.json({
					success: true,
					data: [order],
					pagination: {
						skip,
						limit,
						total: 1,
					},
				});
			} else {
				return NextResponse.json({
					success: true,
					data: [],
					pagination: {
						skip,
						limit,
						total: 0,
					},
				});
			}
		}

		// 获取订单列表
		const filters: any = {};

		if (status) {
			filters.status = status;
		}
		if (reviewStatus) {
			filters.reviewStatus = reviewStatus;
		}
		if (membershipLevel) {
			filters.membershipLevel = membershipLevel;
		}
		if (userId) {
			filters.userId = userId;
		}

		let orders = await enhancedOrderManager.getAllOrders({
			skip,
			limit,
			filters,
		});

		// 日期范围过滤
		if (startDate || endDate) {
			orders = orders.filter(order => {
				const orderDate = new Date(order.createdAt);
				if (startDate && orderDate < new Date(startDate)) return false;
				if (endDate && orderDate > new Date(endDate)) return false;
				return true;
			});
		}

		// 获取用户信息（如果需要）
		if (userId) {
			const userInfo = await userManager.getUserById(userId);
			orders = orders.map(order => ({
				...order,
				userInfo: userInfo ? {
					email: userInfo.email,
					username: userInfo.username,
				} : null,
			}));
		}

		return NextResponse.json({
			success: true,
			data: orders,
			pagination: {
				skip,
				limit,
				total: orders.length,
			},
		});
	} catch (error: any) {
		console.error('高级筛选订单失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '高级筛选订单失败' },
			{ status: 500 }
		);
	}
}
