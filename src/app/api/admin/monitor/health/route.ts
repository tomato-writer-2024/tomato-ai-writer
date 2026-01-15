import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { performanceMonitor } from '@/lib/performanceMonitor';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 获取系统健康状态（管理员）
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

		// 获取健康状态
		const healthStatus = performanceMonitor.getHealthStatus();

		// 格式化运行时间
		const uptime = healthStatus.uptime;
		const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
		const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
		const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
		const uptimeString = `${days}天 ${hours}小时 ${minutes}分钟`;

		return NextResponse.json({
			success: true,
			data: {
				...healthStatus,
				uptimeString,
			},
		});
	} catch (error: any) {
		console.error('获取系统健康状态失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取系统健康状态失败' },
			{ status: 500 }
		);
	}
}
