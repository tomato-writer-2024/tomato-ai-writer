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
		// 增强Token提取：支持多种方式
		let token: string | null = null;
		let tokenSource = '';

		// 方式1: Authorization header (Bearer token)
		const authHeader = request.headers.get('authorization');
		if (authHeader && authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7);
			tokenSource = 'Authorization header (Bearer)';
			console.log(`[${requestId}] 从Authorization header获取token`);
		}

		// 方式2: X-Auth-Token header
		if (!token) {
			const xAuthToken = request.headers.get('x-auth-token');
			if (xAuthToken) {
				token = xAuthToken;
				tokenSource = 'X-Auth-Token header';
				console.log(`[${requestId}] 从X-Auth-Token header获取token`);
			}
		}

		// 方式3: body参数
		if (!token) {
			try {
				const body = await request.json();
				if (body.token) {
					token = body.token;
					tokenSource = 'body参数';
					console.log(`[${requestId}] 从body参数获取token`);
				}
			} catch (e) {
				// body解析失败，继续
			}
		}

		console.log(`[${requestId}] Token提取结果:`, {
			tokenSource,
			hasToken: !!token,
			tokenLength: token?.length,
			allHeaders: Object.fromEntries(request.headers.entries()),
		});

		if (!token) {
			console.log(`[${requestId}] 所有Token获取方式均失败`);
			return NextResponse.json(
				{ error: '未提供认证token' },
				{ status: 401 }
			);
		}

		console.log(`[${requestId}] Token长度: ${token.length}`);

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
		let payload: any = null;
		try {
			payload = verifyToken(token);
			console.log(`[${requestId}] Token验证结果:`, {
				hasPayload: !!payload,
				hasUserId: !!(payload?.userId),
			});
		} catch (error: any) {
			console.error(`[${requestId}] Token验证异常:`, error);

			// 尝试再次解析以获取详细错误
			try {
				jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
			} catch (e: any) {
				console.error(`[${requestId}] JWT验证详细错误:`, {
					name: e?.name,
					message: e?.message,
				});

				if (e?.name === 'TokenExpiredError') {
					return NextResponse.json(
						{ error: 'token已过期，请重新登录' },
						{ status: 401 }
					);
				}

				if (e?.name === 'JsonWebTokenError') {
					return NextResponse.json(
						{ error: `无效的token: ${e?.message}` },
						{ status: 401 }
					);
				}
			}

			return NextResponse.json(
				{ error: '无效的token' },
				{ status: 401 }
			);
		}

		if (!payload || !payload.userId) {
			return NextResponse.json(
				{ error: '无效的token：缺少用户信息' },
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
