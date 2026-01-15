import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import jwt from 'jsonwebtoken';

/**
 * Token测试API
 * POST /api/debug/token/test
 *
 * 用于测试 token 生成和验证
 */
export async function POST(request: NextRequest) {
	try {
		const { userId, email, role, membershipLevel } = await request.json();

		// 生成token
		const token = generateAccessToken({
			userId: userId || 'test-user-id',
			email: email || 'test@example.com',
			role: role || 'FREE',
			membershipLevel: membershipLevel || 'FREE',
		});

		// 解码token（不验证签名）
		const decoded = jwt.decode(token);
		const now = Math.floor(Date.now() / 1000);

		// 验证token
		const verifyResult = verifyToken(token);

		return NextResponse.json({
			success: true,
			generatedToken: token,
			decoded: {
				...decoded,
				remainingTime: decoded?.exp ? decoded.exp - now : null,
				isExpired: decoded?.exp ? decoded.exp < now : null,
			},
			verifyResult,
			config: {
				jwtSecret: process.env.JWT_SECRET?.substring(0, 10) + '...',
				accessTokenExpiresIn: '7d',
			},
			timestamp: {
				now: now,
				nowFormatted: new Date(now * 1000).toISOString(),
				iatFormatted: decoded?.iat ? new Date(decoded.iat * 1000).toISOString() : null,
				expFormatted: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null,
			},
		});
	} catch (error: any) {
		console.error('Token测试失败:', error);
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 }
		);
	}
}
