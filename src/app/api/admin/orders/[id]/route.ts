import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { membershipOrderManager, userManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 获取订单详情（管理员）
 */
export async function GET(
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

		// 获取订单
		const order = await membershipOrderManager.getOrderById(id);
		if (!order) {
			return NextResponse.json(
				{ success: false, error: '订单不存在' },
				{ status: 404 }
			);
		}

		// 获取用户信息
		const orderUser = await userManager.getUserById(order.userId);

		return NextResponse.json({
			success: true,
			data: {
				order,
				user: orderUser,
			},
		});
	} catch (error) {
		console.error('获取订单详情失败:', error);
		return NextResponse.json(
			{ success: false, error: '获取订单详情失败' },
			{ status: 500 }
		);
	}
}

/**
 * 更新订单状态（管理员）
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

		const { action, notes, refundAmount } = await request.json();

		// 获取订单
		const order = await membershipOrderManager.getOrderById(id);
		if (!order) {
			return NextResponse.json(
				{ success: false, error: '订单不存在' },
				{ status: 404 }
			);
		}

		// 根据不同的操作处理
		switch (action) {
			case 'approve': {
				// 审核通过（用于待审核订单）
				if (order.paymentStatus !== 'PENDING_REVIEW') {
					return NextResponse.json(
						{ success: false, error: '订单状态不正确' },
						{ status: 400 }
					);
				}

				const transactionId = `MANUAL_${Date.now()}_${user.id}`;

				// 更新订单状态为已支付
				await membershipOrderManager.markAsPaid(id, transactionId);

				// 计算会员到期时间
				const userInfo = await userManager.getUserById(order.userId);
				const expireDate = membershipOrderManager.calculateExpireDate(
					order.months,
					userInfo?.membershipExpireAt ? new Date(userInfo.membershipExpireAt) : undefined
				);

				// 升级会员
				await userManager.upgradeMembership(order.userId, order.level, expireDate);

				return NextResponse.json({
					success: true,
					data: {
						orderId: id,
						message: '订单审核通过，会员已激活',
					},
				});
			}

			case 'reject': {
				// 审核拒绝（用于待审核订单）
				if (order.paymentStatus !== 'PENDING_REVIEW') {
					return NextResponse.json(
						{ success: false, error: '订单状态不正确' },
						{ status: 400 }
					);
				}

				await membershipOrderManager.markAsFailed(id);

				return NextResponse.json({
					success: true,
					data: {
						orderId: id,
						message: '订单已拒绝',
					},
				});
			}

			case 'cancel': {
				// 取消订单（管理端强制取消）
				await membershipOrderManager.updatePaymentStatus(id, 'CANCELLED');

				return NextResponse.json({
					success: true,
					data: {
						orderId: id,
						message: '订单已取消',
					},
				});
			}

			case 'refund': {
				// 退款（管理端直接退款）
				if (order.paymentStatus !== 'PAID') {
					return NextResponse.json(
						{ success: false, error: '只能对已支付订单进行退款' },
						{ status: 400 }
					);
				}

				const actualRefundAmount = refundAmount || order.amount;

				await membershipOrderManager.updateOrder(id, {
					paymentStatus: 'REFUNDED',
					notes: JSON.stringify({
						proof: JSON.parse(order.notes || '{}').proof,
						status: 'REFUNDED',
						reviewNotes: notes || '管理员直接退款',
						refundAmount: actualRefundAmount,
						refundedAt: new Date().toISOString(),
						refundedBy: user.id,
					}),
				});

				return NextResponse.json({
					success: true,
					data: {
						orderId: id,
						message: '退款处理成功',
						refundAmount: actualRefundAmount,
					},
				});
			}

			case 'add_notes': {
				// 添加备注
				const existingNotes = JSON.parse(order.notes || '{}');
				await membershipOrderManager.updateOrder(id, {
					notes: JSON.stringify({
						...existingNotes,
						additionalNotes: notes,
						addedAt: new Date().toISOString(),
						addedBy: user.id,
					}),
				});

				return NextResponse.json({
					success: true,
					data: {
						orderId: id,
						message: '备注已添加',
					},
				});
			}

			default:
				return NextResponse.json(
					{ success: false, error: '无效的操作' },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('更新订单状态失败:', error);
		return NextResponse.json(
			{ success: false, error: '更新订单状态失败' },
			{ status: 500 }
		);
	}
}

/**
 * 删除订单（管理员）
 */
export async function DELETE(
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

		// 获取订单
		const order = await membershipOrderManager.getOrderById(id);
		if (!order) {
			return NextResponse.json(
				{ success: false, error: '订单不存在' },
				{ status: 404 }
			);
		}

		// 软删除订单（更新状态）
		await membershipOrderManager.updateOrder(id, {
			paymentStatus: 'DELETED',
		});

		return NextResponse.json({
			success: true,
			data: {
				orderId: id,
				message: '订单已删除',
			},
		});
	} catch (error) {
		console.error('删除订单失败:', error);
		return NextResponse.json(
			{ success: false, error: '删除订单失败' },
			{ status: 500 }
		);
	}
}
