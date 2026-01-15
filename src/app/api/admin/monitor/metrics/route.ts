import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { performanceMonitor } from '@/lib/performanceMonitor';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

/**
 * 获取性能指标（管理员）
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
		const apiEndpoint = searchParams.get('apiEndpoint');
		const limit = parseInt(searchParams.get('limit') || '100');
		const startTime = searchParams.get('startTime');
		const endTime = searchParams.get('endTime');
		const type = searchParams.get('type') || 'metrics'; // metrics, stats

		const options: any = {
			limit,
		};

		if (apiEndpoint) {
			options.apiEndpoint = apiEndpoint;
		}

		if (startTime) {
			options.startTime = new Date(startTime);
		}

		if (endTime) {
			options.endTime = new Date(endTime);
		}

		// 根据类型返回数据
		if (type === 'stats') {
			const stats = performanceMonitor.getStats(options);
			return NextResponse.json({
				success: true,
				data: stats,
			});
		} else {
			const metrics = performanceMonitor.getMetrics(options);
			return NextResponse.json({
				success: true,
				data: metrics,
			});
		}
	} catch (error: any) {
		console.error('获取性能指标失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取性能指标失败' },
			{ status: 500 }
		);
	}
}
