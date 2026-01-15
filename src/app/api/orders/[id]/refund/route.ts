import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager, userManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 申请退款（用户端）
 * 只能对已支付的订单申请退款
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
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		const body = await request.json();
		const { reason } = body;

		if (!reason) {
			return NextResponse.json(
				{ success: false, error: '请提供退款原因' },
				{ status: 400 }
			);
		}

		// 获取订单
		const order = await membershipOrderManager.getOrderById(id);
		if (!order) {
			return NextResponse.json(
				{ success: false, error: '订单不存在' },
				{ status: 404 }
			);
		}

		// 验证订单所有权
		if (order.userId !== user.id) {
			return NextResponse.json(
				{ success: false, error: '无权操作此订单' },
				{ status: 403 }
			);
		}

		// 检查订单状态（只能对已支付订单申请退款）
		if (order.paymentStatus !== 'PAID') {
			return NextResponse.json(
				{ success: false, error: '只能对已支付的订单申请退款' },
				{ status: 400 }
			);
		}

		// 检查是否已经申请过退款
		const status: string = order.paymentStatus;
		if (status === 'REFUNDING' || status === 'REFUNDED') {
			return NextResponse.json(
				{ success: false, error: '此订单已经申请过退款' },
				{ status: 400 }
			);
		}

		// 检查订单状态（只能对已支付订单申请退款）
		if (status !== 'PAID') {
			return NextResponse.json(
				{ success: false, error: '只能对已支付订单申请退款' },
				{ status: 400 }
			);
		}

		// 更新订单状态为退款中
		await membershipOrderManager.updateOrder(id, {
			paymentStatus: 'REFUNDING',
			notes: JSON.stringify({
				reason,
				refundRequestedAt: new Date().toISOString(),
				requestedBy: user.id,
			}),
		});

		return NextResponse.json({
			success: true,
			data: {
				orderId: id,
				message: '退款申请已提交，等待管理员审核',
			},
		});
	} catch (error) {
		console.error('申请退款失败:', error);
		return NextResponse.json(
			{ success: false, error: '申请退款失败' },
			{ status: 500 }
		);
	}
}

/**
 * 处理退款申请（管理员端）
 * 管理员审核退款申请
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

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

		const { approved, reviewNotes, refundAmount } = await request.json();

		if (typeof approved !== 'boolean') {
			return NextResponse.json(
				{ success: false, error: '缺少必要参数' },
				{ status: 400 }
			);
		}

		// 获取订单
		const order = await membershipOrderManager.getOrderById(id);
		if (!order) {
			return NextResponse.json(
				{ success: false, error: '订单不存在' },
				{ status: 404 }
			);
		}

		// 检查订单状态
		if (order.paymentStatus !== 'REFUNDING') {
			return NextResponse.json(
				{ success: false, error: '订单状态不正确' },
				{ status: 400 }
			);
		}

		// 解析订单备注中的退款信息
		const notes = JSON.parse(order.notes || '{}');

		if (approved) {
			// 审核通过，处理退款

			// 计算退款金额（默认全额退款）
			const actualRefundAmount = refundAmount || order.amount;

			// 更新订单状态为已退款
			await membershipOrderManager.updateOrder(id, {
				paymentStatus: 'REFUNDED',
				notes: JSON.stringify({
					...notes,
					status: 'APPROVED',
					reviewNotes: reviewNotes || '退款审核通过',
					refundAmount: actualRefundAmount,
					refundedAt: new Date().toISOString(),
					refundedBy: user.id,
				}),
			});

			// 扣除会员时间（如果订单是在近期内）
			// 这里简化处理，实际应该根据具体业务逻辑扣除会员时间
			// 例如：如果会员到期时间大于支付时间+会员时长，则扣除

			return NextResponse.json({
				success: true,
				data: {
					orderId: id,
					message: '退款处理成功',
					refundAmount: actualRefundAmount,
				},
			});
		} else {
			// 审核拒绝，恢复订单状态
			await membershipOrderManager.updateOrder(id, {
				paymentStatus: 'PAID',
				notes: JSON.stringify({
					...notes,
					status: 'REJECTED',
					reviewNotes: reviewNotes || '退款申请被拒绝',
					reviewedAt: new Date().toISOString(),
					reviewedBy: user.id,
				}),
			});

			return NextResponse.json({
				success: true,
				data: {
					orderId: id,
					message: '退款申请已拒绝',
				},
			});
		}
	} catch (error) {
		console.error('处理退款失败:', error);
		return NextResponse.json(
			{ success: false, error: '处理退款失败' },
			{ status: 500 }
		);
	}
}
