import jwt from 'jsonwebtoken';
import { UserRole, MembershipLevel } from './types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  membershipLevel: MembershipLevel;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    console.error('JWT验证失败:', error?.message);
    return null;
  }
}

export function getUserFromToken(token?: string | null): JWTPayload | null {
  if (!token) return null;
  return verifyToken(token);
}
