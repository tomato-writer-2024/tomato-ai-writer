import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { userManager } from '@/storage/database';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 获取即将到期的会员列表（管理员）
 * 用于提醒用户续费
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
		const days = parseInt(searchParams.get('days') || '7'); // 默认7天内到期
		const limit = parseInt(searchParams.get('limit') || '50');

		// 计算截止日期
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() + days);

		// 获取所有用户
		// 注意：这里简化处理，实际应该使用 userManager.getUsers() 或类似方法
		const allUsers = await (userManager as any).getUsers?.() || [];

		// 过滤即将到期的会员
		const expiringSoon = allUsers
			.filter((user: any) => {
				if (!user.membershipExpireAt) return false;
				if (user.membershipLevel === 'FREE') return false;

				const expireDate = new Date(user.membershipExpireAt);
				const now = new Date();

				// 会员已过期但未超过30天
				if (expireDate < now) {
					const daysSinceExpired = Math.floor((now.getTime() - expireDate.getTime()) / (1000 * 60 * 60 * 24));
					return daysSinceExpired <= 30;
				}

				// 会员即将在指定天数内到期
				const daysUntilExpire = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
				return daysUntilExpire <= days && daysUntilExpire >= 0;
			})
			.slice(0, limit)
			.map((user: any) => {
				const expireDate = new Date(user.membershipExpireAt!);
				const now = new Date();
				const daysUntilExpire = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

				return {
					...user,
					daysUntilExpire,
					isExpired: daysUntilExpire < 0,
				};
			})
			.sort((a: any, b: any) => {
				// 先排序已过期的（按过期时间升序），再排序即将到期的（按到期时间升序）
				if (a.isExpired && b.isExpired) {
					return new Date(a.membershipExpireAt!).getTime() - new Date(b.membershipExpireAt!).getTime();
				}
				if (a.isExpired) return 1;
				if (b.isExpired) return -1;
				return a.daysUntilExpire - b.daysUntilExpire;
			});

		return NextResponse.json({
			success: true,
			data: {
				users: expiringSoon,
				total: expiringSoon.length,
				cutoffDate: cutoffDate.toISOString(),
			},
		});
	} catch (error) {
		console.error('获取即将到期会员失败:', error);
		return NextResponse.json(
			{ success: false, error: '获取即将到期会员失败' },
			{ status: 500 }
		);
	}
}
