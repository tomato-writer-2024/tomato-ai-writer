/**
 * 服务端认证工具
 * 从请求中获取并验证JWT Token
 */
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JwtPayload {
  userId: number;
  email: string;
  username?: string;
  role: string;
  membershipLevel: string;
  iat: number;
  exp: number;
}

/**
 * 从请求中获取Token
 */
export function getToken(request: NextRequest): JwtPayload | null {
  try {
    // 从Authorization header获取
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return decoded;
    }

    // 从cookie获取
    const tokenCookie = request.cookies.get('token');
    if (tokenCookie) {
      const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as JwtPayload;
      return decoded;
    }

    return null;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(request: NextRequest): boolean {
  return getToken(request) !== null;
}
