import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 获取订单趋势数据（管理员）
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
		const period = searchParams.get('period') || '7days'; // 7days, 30days, 90days, 1year

		// 计算日期范围
		const endDate = new Date();
		const startDate = new Date();

		switch (period) {
			case '7days':
				startDate.setDate(startDate.getDate() - 7);
				break;
			case '30days':
				startDate.setDate(startDate.getDate() - 30);
				break;
			case '90days':
				startDate.setDate(startDate.getDate() - 90);
				break;
			case '1year':
				startDate.setFullYear(startDate.getFullYear() - 1);
				break;
			default:
				startDate.setDate(startDate.getDate() - 7);
		}

		// 获取所有订单
		const allOrders = await membershipOrderManager.getOrders({ limit: 10000 });

		// 过滤日期范围内的订单
		const filteredOrders = allOrders.filter(order => {
			const orderDate = new Date(order.createdAt);
			return orderDate >= startDate && orderDate <= endDate;
		});

		// 按天分组数据
		const dailyData: Record<string, {
			date: string;
			totalOrders: number;
			paidOrders: number;
			revenue: number;
		}> = {};

		// 初始化每一天的数据
		const currentDate = new Date(startDate);
		while (currentDate <= endDate) {
			const dateStr = currentDate.toISOString().split('T')[0];
			dailyData[dateStr] = {
				date: dateStr,
				totalOrders: 0,
				paidOrders: 0,
				revenue: 0,
			};
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// 统计每天的订单数据
		filteredOrders.forEach(order => {
			const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
			if (dailyData[dateStr]) {
				dailyData[dateStr].totalOrders++;
				if (order.paymentStatus === 'PAID') {
					dailyData[dateStr].paidOrders++;
					dailyData[dateStr].revenue += order.amount;
				}
			}
		});

		// 转换为数组
		const trends = Object.values(dailyData).sort((a, b) =>
			a.date.localeCompare(b.date)
		);

		return NextResponse.json({
			success: true,
			data: {
				period,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
				trends,
			},
		});
	} catch (error) {
		console.error('获取订单趋势失败:', error);
		return NextResponse.json(
			{ success: false, error: '获取订单趋势失败' },
			{ status: 500 }
		);
	}
}
