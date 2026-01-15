import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { enhancedOrderManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 批量处理退款（管理员）
 */
export async function POST(request: NextRequest) {
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

		const body = await request.json();
		const { orderIds, approved, notes, refundAmount } = body;

		// 验证必要参数
		if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
			return NextResponse.json(
				{ success: false, error: '缺少订单ID列表' },
				{ status: 400 }
			);
		}

		if (typeof approved !== 'boolean') {
			return NextResponse.json(
				{ success: false, error: '缺少审核结果' },
				{ status: 400 }
			);
		}

		// 批量处理退款
		const results = {
			success: 0,
			failed: 0,
			details: [] as any[],
		};

		for (const orderId of orderIds) {
			try {
				const updatedOrder = await enhancedOrderManager.processRefund(
					orderId,
					user.id,
					approved,
					refundAmount,
					notes
				);

				if (updatedOrder) {
					results.success++;
					results.details.push({
						orderId,
						success: true,
						orderNumber: updatedOrder.orderNumber,
					});
				} else {
					results.failed++;
					results.details.push({
						orderId,
						success: false,
						error: '订单不存在或处理失败',
					});
				}
			} catch (error: any) {
				results.failed++;
				results.details.push({
					orderId,
					success: false,
					error: error.message || '处理退款失败',
				});
			}
		}

		return NextResponse.json({
			success: true,
			data: results,
		});
	} catch (error: any) {
		console.error('批量处理退款失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '批量处理退款失败' },
			{ status: 500 }
		);
	}
}
