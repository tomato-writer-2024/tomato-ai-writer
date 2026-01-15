import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyToken } from '@/lib/jwt';

/**
 * Token诊断工具
 * POST /api/debug/token
 *
 * 用于诊断 token 生成和验证问题
 */
export async function POST(request: NextRequest) {
	try {
		const { token } = await request.json();

		if (!token) {
			return NextResponse.json(
				{ error: '请提供 token' },
				{ status: 400 }
			);
		}

		// 解码 token（不验证签名）
		const decoded = jwt.decode(token) as jwt.JwtPayload | null;
		const now = Math.floor(Date.now() / 1000);

		// 验证 token
		let verifyResult: any = null;
		let verifyError: any = null;

		try {
			verifyResult = jwt.verify(
				token,
				process.env.JWT_SECRET || 'your-secret-key-change-in-production'
			);
		} catch (error: any) {
			verifyError = {
				name: error.name,
				message: error.message,
			};
		}

		// 使用我们的 verifyToken 函数
		const ourVerifyResult = verifyToken(token);

		return NextResponse.json({
			success: true,
			token: {
				length: token.length,
				parts: token.split('.').length,
			},
			decoded: decoded ? {
				...decoded,
				remainingTime: decoded.exp ? decoded.exp - now : null,
				isExpired: decoded.exp ? decoded.exp < now : null,
			} : null,
			verifyResult,
			verifyError,
			ourVerifyResult,
			config: {
				jwtSecret: process.env.JWT_SECRET?.substring(0, 10) + '...',
				accessTokenExpiresIn: '7d',
				refreshTokenExpiresIn: '30d',
			},
			timestamp: {
				now: now,
				nowFormatted: new Date(now * 1000).toISOString(),
				iatFormatted: decoded?.iat ? new Date(decoded.iat * 1000).toISOString() : null,
				expFormatted: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null,
			},
		});
	} catch (error: any) {
		console.error('Token诊断失败:', error);
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 }
		);
	}
}
