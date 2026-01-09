import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager } from '@/storage/database';

/**
 * 获取所有订单列表（管理员专用）
 */
export async function GET(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		// 验证管理员权限
		if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
			return NextResponse.json(
				{ error: '无权访问此功能' },
				{ status: 403 }
			);
		}

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const status = searchParams.get('status');
		const level = searchParams.get('level');

		// 计算偏移量
		const skip = (page - 1) * limit;

		// 获取订单列表
		const orders = await membershipOrderManager.getOrders({
			skip,
			limit,
			filters: status || level ? {
				...(status && { paymentStatus: status }),
				...(level && { level }),
			} : undefined,
		});

		// 获取总数（这里简化处理，不实现分页总数）
		return NextResponse.json({
			success: true,
			data: {
				orders,
				page,
				limit,
			},
		});
	} catch (error) {
		console.error('获取订单列表失败:', error);
		return NextResponse.json(
			{ error: '获取订单列表失败' },
			{ status: 500 }
		);
	}
}
