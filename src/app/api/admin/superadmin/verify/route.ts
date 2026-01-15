import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

/**
 * 验证超级管理员身份
 * POST /api/admin/superadmin/verify
 */
export async function POST(request: NextRequest) {
	const requestId = Math.random().toString(36).substring(7);
	console.log(`[${requestId}] ===== 验证超级管理员请求开始 =====`);

	try {
		// 获取token
		const authHeader = request.headers.get('authorization');

		console.log(`[${requestId}] 请求头信息:`, {
			hasAuthHeader: !!authHeader,
			authHeaderPrefix: authHeader?.substring(0, 20),
		});

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			console.log(`[${requestId}] 未提供认证token或格式错误`);
			return NextResponse.json(
				{ error: '未提供认证token' },
				{ status: 401 }
			);
		}

		const token = authHeader.substring(7);
		console.log(`[${requestId}] 提取token长度: ${token.length}`);

		// 尝试解析token（不验证签名，只获取payload）
		try {
			const decoded = jwt.decode(token) as any;
			console.log(`[${requestId}] Token payload（解码）:`, {
				userId: decoded?.userId,
				email: decoded?.email,
				role: decoded?.role,
				iat: decoded?.iat,
				exp: decoded?.exp,
			});
		} catch (e) {
			console.log(`[${requestId}] Token解码失败:`, e);
		}

		// 验证token
		let payload: ReturnType<typeof verifyToken>;
		try {
			payload = verifyToken(token);
		} catch (error: any) {
			console.error(`[${requestId}] Token验证异常:`, error);
		}

		console.log(`[${requestId}] Token验证结果:`, {
			hasPayload: !!payload,
			hasUserId: !!(payload?.userId),
		});

		if (!payload || !payload.userId) {
			// 尝试再次解析以获取详细错误
			try {
				jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
			} catch (error: any) {
				console.error(`[${requestId}] JWT验证详细错误:`, {
					name: error?.name,
					message: error?.message,
				});

				if (error?.name === 'TokenExpiredError') {
					return NextResponse.json(
						{ error: 'token已过期，请重新登录' },
						{ status: 401 }
					);
				}

				if (error?.name === 'JsonWebTokenError') {
					return NextResponse.json(
						{ error: `无效的token: ${error?.message}` },
						{ status: 401 }
					);
				}
			}

			return NextResponse.json(
				{ error: '无效的token' },
				{ status: 401 }
			);
		}

		console.log(`[${requestId}] Token验证成功，用户ID: ${payload.userId}`);

		// 查询用户信息
		const db = await getDb();
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.userId))
			.limit(1);

		if (!user) {
			console.log(`[${requestId}] 用户不存在: ${payload.userId}`);
			return NextResponse.json(
				{ error: '用户不存在' },
				{ status: 404 }
			);
		}

		console.log(`[${requestId}] 找到用户，检查超级管理员权限:`, {
			userId: user.id,
			email: user.email,
			isSuperAdmin: user.isSuperAdmin,
		});

		// 验证是否为超级管理员
		if (!user.isSuperAdmin) {
			console.log(`[${requestId}] 用户不是超级管理员`);
			return NextResponse.json(
				{ error: '无权访问此资源' },
				{ status: 403 }
			);
		}

		console.log(`[${requestId}] 超级管理员验证通过`);

		// 返回管理员信息
		const { passwordHash: _, ...adminWithoutPassword } = user;

		return NextResponse.json({
			success: true,
			admin: adminWithoutPassword,
		});
	} catch (error) {
		console.error(`[${requestId}] 验证超级管理员失败:`, error);
		return NextResponse.json(
			{ error: '验证失败' },
			{ status: 500 }
		);
	}
}
