import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { enhancedOrderManager, userManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 数据导出（管理员）
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
		const dataType = searchParams.get('type') || 'orders'; // orders, users, revenue
		const format = searchParams.get('format') || 'csv'; // csv, json
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		let data: any[] = [];
		let filename = '';

		switch (dataType) {
			case 'orders':
				data = await exportOrders(startDate, endDate);
				filename = `订单数据_${format.toUpperCase()}_${Date.now()}.${format}`;
				break;
			case 'users':
				data = await exportUsers(startDate, endDate);
				filename = `用户数据_${format.toUpperCase()}_${Date.now()}.${format}`;
				break;
			case 'revenue':
				data = await exportRevenue(startDate, endDate);
				filename = `收入数据_${format.toUpperCase()}_${Date.now()}.${format}`;
				break;
			default:
				return NextResponse.json(
					{ success: false, error: '不支持的数据类型' },
					{ status: 400 }
				);
		}

		// 根据格式返回数据
		if (format === 'csv') {
			const csv = convertToCSV(data);
			return new NextResponse(csv, {
				headers: {
					'Content-Type': 'text/csv; charset=utf-8',
					'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
				},
			});
		} else {
			return new NextResponse(JSON.stringify(data, null, 2), {
				headers: {
					'Content-Type': 'application/json',
					'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
				},
			});
		}
	} catch (error: any) {
		console.error('数据导出失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '数据导出失败' },
			{ status: 500 }
		);
	}
}

/**
 * 导出订单数据
 */
async function exportOrders(startDate?: string | null, endDate?: string | null): Promise<any[]> {
	const orders = await enhancedOrderManager.getAllOrders({ limit: 10000 });

	let filteredOrders = orders;

	if (startDate || endDate) {
		filteredOrders = orders.filter(order => {
			const orderDate = new Date(order.createdAt);
			if (startDate && orderDate < new Date(startDate)) return false;
			if (endDate && orderDate > new Date(endDate)) return false;
			return true;
		});
	}

	// 获取用户信息
	const userIds = [...new Set(filteredOrders.map(o => o.userId))];
	const userMap = new Map();
	for (const userId of userIds) {
		const user = await userManager.getUserById(userId);
		if (user) {
			userMap.set(userId, user);
		}
	}

	return filteredOrders.map(order => {
		const user = userMap.get(order.userId);
		return {
			订单号: order.orderNumber,
			用户ID: order.userId,
			用户邮箱: user?.email || '',
			用户名: user?.username || '',
			会员等级: order.level,
			月数: order.months,
			金额: order.amount,
			支付方式: order.paymentMethod,
			支付状态: order.paymentStatus,
			审核状态: order.reviewStatus || '',
			交易ID: order.transactionId || '',
			创建时间: new Date(order.createdAt).toLocaleString('zh-CN'),
			支付时间: order.paidAt ? new Date(order.paidAt).toLocaleString('zh-CN') : '',
			退款金额: order.refundAmount || 0,
			退款原因: order.refundReason || '',
		};
	});
}

/**
 * 导出用户数据
 */
async function exportUsers(startDate?: string | null, endDate?: string | null): Promise<any[]> {
	const users = await userManager.getUsers({ limit: 10000 });

	let filteredUsers = users;

	if (startDate || endDate) {
		filteredUsers = users.filter(user => {
			const userDate = new Date(user.createdAt);
			if (startDate && userDate < new Date(startDate)) return false;
			if (endDate && userDate > new Date(endDate)) return false;
			return true;
		});
	}

	return filteredUsers.map(user => ({
		用户ID: user.id,
		邮箱: user.email,
		用户名: user.username || '',
		手机号: user.phone || '',
		地区: user.location || '',
		角色: user.role,
		会员等级: user.membershipLevel,
		会员到期时间: user.membershipExpireAt ? new Date(user.membershipExpireAt).toLocaleString('zh-CN') : '',
		每日使用次数: user.dailyUsageCount,
		每月使用次数: user.monthlyUsageCount,
		存储使用量: user.storageUsed,
		是否激活: user.isActive ? '是' : '否',
		是否封禁: user.isBanned ? '是' : '否',
		封禁原因: user.banReason || '',
		注册时间: new Date(user.createdAt).toLocaleString('zh-CN'),
		最后登录: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : '',
	}));
}

/**
 * 导出收入数据
 */
async function exportRevenue(startDate?: string | null, endDate?: string | null): Promise<any[]> {
	const orders = await enhancedOrderManager.getAllOrders({ limit: 10000 });

	let filteredOrders = orders.filter(order => order.paymentStatus === 'PAID');

	if (startDate || endDate) {
		filteredOrders = filteredOrders.filter(order => {
			const orderDate = new Date(order.createdAt);
			if (startDate && orderDate < new Date(startDate)) return false;
			if (endDate && orderDate > new Date(endDate)) return false;
			return true;
		});
	}

	// 按天统计
	const dailyRevenue: Record<string, any> = {};

	filteredOrders.forEach(order => {
		const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
		if (!dailyRevenue[dateStr]) {
			dailyRevenue[dateStr] = {
				日期: dateStr,
				订单数: 0,
				总收入: 0,
				基础会员订单: 0,
				基础会员收入: 0,
				高级会员订单: 0,
				高级会员收入: 0,
				企业会员订单: 0,
				企业会员收入: 0,
				支付宝订单: 0,
				支付宝收入: 0,
				微信支付订单: 0,
				微信支付收入: 0,
			};
		}

		const day = dailyRevenue[dateStr];
		day.订单数++;
		day.总收入 += order.amount;

		if (order.level === 'BASIC') {
			day.基础会员订单++;
			day.基础会员收入 += order.amount;
		} else if (order.level === 'PREMIUM') {
			day.高级会员订单++;
			day.高级会员收入 += order.amount;
		} else if (order.level === 'ENTERPRISE') {
			day.企业会员订单++;
			day.企业会员收入 += order.amount;
		}

		if (order.paymentMethod === 'alipay') {
			day.支付宝订单++;
			day.支付宝收入 += order.amount;
		} else if (order.paymentMethod === 'wechat') {
			day.微信支付订单++;
			day.微信支付收入 += order.amount;
		}
	});

	return Object.values(dailyRevenue).sort((a, b) => a.日期.localeCompare(b.日期));
}

/**
 * 转换为CSV格式
 */
function convertToCSV(data: any[]): string {
	if (data.length === 0) {
		return '';
	}

	// 获取表头
	const headers = Object.keys(data[0]);

	// 构建CSV内容
	const rows = data.map(item =>
		headers.map(header => {
			let value = item[header];
			// 处理包含逗号、引号或换行符的字段
			if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
				value = `"${value.replace(/"/g, '""')}"`;
			}
			return value;
		}).join(',')
	);

	// 添加BOM头以支持Excel正确显示中文
	return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}
