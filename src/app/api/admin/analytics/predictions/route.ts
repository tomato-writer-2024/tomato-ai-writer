import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { enhancedOrderManager, userManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 数据预测分析（管理员）
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
		const predictionType = searchParams.get('type') || 'revenue'; // revenue, users, growth

		// 获取历史数据
		const now = new Date();
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		const allOrders = await enhancedOrderManager.getAllOrders({
			limit: 10000,
		});

		// 过滤最近30天的订单
		const recentOrders = allOrders.filter(
			order => new Date(order.createdAt) >= thirtyDaysAgo
		);

		// 获取用户数据
		const allUsers = await userManager.getUsers({ limit: 10000 });
		const recentUsers = allUsers.filter(
			user => new Date(user.createdAt) >= thirtyDaysAgo
		);

		let predictions = {};

		switch (predictionType) {
			case 'revenue':
				predictions = await predictRevenue(recentOrders);
				break;
			case 'users':
				predictions = await predictUsers(recentUsers, allUsers);
				break;
			case 'growth':
				predictions = await predictGrowth(recentOrders, recentUsers);
				break;
			default:
				predictions = await predictRevenue(recentOrders);
		}

		return NextResponse.json({
			success: true,
			data: predictions,
		});
	} catch (error: any) {
		console.error('数据预测分析失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '数据预测分析失败' },
			{ status: 500 }
		);
	}
}

/**
 * 预测收入趋势
 */
async function predictRevenue(orders: any[]): Promise<any> {
	// 按天统计收入
	const dailyRevenue: Record<string, number> = {};
	const now = new Date();

	for (let i = 30; i >= 0; i--) {
		const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
		const dateStr = date.toISOString().split('T')[0];
		dailyRevenue[dateStr] = 0;
	}

	orders.forEach(order => {
		if (order.paymentStatus === 'PAID') {
			const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
			if (dailyRevenue[dateStr] !== undefined) {
				dailyRevenue[dateStr] += order.amount;
			}
		}
	});

	// 计算移动平均（7天）
	const movingAverages: Record<string, number> = {};
	Object.keys(dailyRevenue).forEach((date, index) => {
		if (index >= 6) {
			const sum = Object.values(dailyRevenue)
				.slice(index - 6, index + 1)
				.reduce((a, b) => a + b, 0);
			movingAverages[date] = sum / 7;
		}
	});

	// 预测未来7天
	const predictions: any[] = [];
	const last7DaysAverage = Object.values(movingAverages).slice(-7).reduce((a: number, b: number) => a + b, 0) / 7;
	const trend = (Object.values(dailyRevenue).slice(-7).reduce((a: number, b: number) => a + b, 0) /
		Object.values(dailyRevenue).slice(-14, -7).reduce((a: number, b: number) => a + b, 0)) - 1;

	for (let i = 1; i <= 7; i++) {
		const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
		const dateStr = date.toISOString().split('T')[0];
		const predictedValue = last7DaysAverage * (1 + trend * i);
		predictions.push({
			date: dateStr,
			predicted: Math.round(predictedValue),
			confidence: Math.max(0.7, 0.95 - i * 0.03), // 置信度随天数递减
		});
	}

	return {
		type: 'revenue',
		period: '30天历史数据 + 7天预测',
		historical: Object.entries(dailyRevenue).map(([date, value]) => ({ date, value })),
		movingAverages: Object.entries(movingAverages).map(([date, value]) => ({ date, value })),
		predictions,
		summary: {
			totalRevenue: orders
				.filter(o => o.paymentStatus === 'PAID')
				.reduce((sum, o) => sum + o.amount, 0),
			averageDailyRevenue: last7DaysAverage,
			trend: trend > 0 ? '上升' : trend < 0 ? '下降' : '平稳',
			trendRate: `${(trend * 100).toFixed(2)}%`,
			predicted7DayRevenue: predictions.reduce((sum, p) => sum + p.predicted, 0),
		},
	};
}

/**
 * 预测用户增长
 */
async function predictUsers(recentUsers: any[], allUsers: any[]): Promise<any> {
	// 按天统计新用户
	const dailyUsers: Record<string, number> = {};
	const now = new Date();

	for (let i = 30; i >= 0; i--) {
		const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
		const dateStr = date.toISOString().split('T')[0];
		dailyUsers[dateStr] = 0;
	}

	recentUsers.forEach(user => {
		const dateStr = new Date(user.createdAt).toISOString().split('T')[0];
		if (dailyUsers[dateStr] !== undefined) {
			dailyUsers[dateStr]++;
		}
	});

	// 计算移动平均
	const movingAverages: Record<string, number> = {};
	Object.keys(dailyUsers).forEach((date, index) => {
		if (index >= 6) {
			const sum = Object.values(dailyUsers)
				.slice(index - 6, index + 1)
				.reduce((a, b) => a + b, 0);
			movingAverages[date] = sum / 7;
		}
	});

	// 预测未来7天
	const predictions: any[] = [];
	const last7DaysAverage = Object.values(movingAverages).slice(-7).reduce((a: number, b: number) => a + b, 0) / 7;
	const trend = (Object.values(dailyUsers).slice(-7).reduce((a: number, b: number) => a + b, 0) /
		Object.values(dailyUsers).slice(-14, -7).reduce((a: number, b: number) => a + b, 0)) - 1;

	for (let i = 1; i <= 7; i++) {
		const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
		const dateStr = date.toISOString().split('T')[0];
		const predictedValue = Math.round(last7DaysAverage * (1 + trend * i));
		predictions.push({
			date: dateStr,
			predicted: Math.max(0, predictedValue),
			confidence: Math.max(0.7, 0.95 - i * 0.03),
		});
	}

	// 会员分布
	const membershipDistribution = allUsers.reduce((acc, user) => {
		acc[user.membershipLevel] = (acc[user.membershipLevel] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	return {
		type: 'users',
		period: '30天历史数据 + 7天预测',
		historical: Object.entries(dailyUsers).map(([date, value]) => ({ date, value })),
		movingAverages: Object.entries(movingAverages).map(([date, value]) => ({ date, value })),
		predictions,
		summary: {
			totalUsers: allUsers.length,
			newUsersLast30Days: recentUsers.length,
			averageDailyNewUsers: last7DaysAverage,
			trend: trend > 0 ? '上升' : trend < 0 ? '下降' : '平稳',
			trendRate: `${(trend * 100).toFixed(2)}%`,
			predicted7DayNewUsers: predictions.reduce((sum, p) => sum + p.predicted, 0),
			membershipDistribution,
		},
	};
}

/**
 * 预测综合增长
 */
async function predictGrowth(recentOrders: any[], recentUsers: any[]): Promise<any> {
	// 收入预测
	const revenuePrediction = await predictRevenue(recentOrders);
	const userPrediction = await predictUsers(recentUsers, []);

	return {
		type: 'growth',
		revenue: revenuePrediction,
		users: userPrediction,
		insights: [
			{
				metric: '收入增长',
				value: revenuePrediction.summary.trendRate,
				trend: revenuePrediction.summary.trend,
				confidence: '高',
			},
			{
				metric: '用户增长',
				value: userPrediction.summary.trendRate,
				trend: userPrediction.summary.trend,
				confidence: '中',
			},
			{
				metric: '客单价',
				value: revenuePrediction.summary.predicted7DayRevenue / (userPrediction.summary.predicted7DayNewUsers || 1),
				trend: '平稳',
				confidence: '中',
			},
		],
	};
}
