/**
 * Mock认证管理器
 * 在Mock模式下模拟认证数据库操作
 */

import { mockDb } from './mockDb';
import { getClientIp } from '@/lib/auth';
import { randomUUID } from 'crypto';

export interface SecurityLog {
  id: string;
  userId: string | null;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export class MockAuthManager {
  /**
   * 记录安全事件
   */
  async logSecurityEvent(data: {
    userId: string | null;
    action: string;
    details: string;
    ipAddress: string;
    userAgent?: string;
    status: 'SUCCESS' | 'FAILED';
  }): Promise<void> {
    // Mock模式下只记录日志，不实际存储
    console.log(`[Mock] 安全事件: ${data.action} - ${data.status}`, {
      userId: data.userId,
      ipAddress: data.ipAddress,
      details: data.details,
    });
  }

  /**
   * 检测异常登录行为
   */
  async detectAbnormalLogin(userId: string, ipAddress: string): Promise<{
    isAbnormal: boolean;
    reason?: string;
  }> {
    // Mock模式下不进行异常检测
    return {
      isAbnormal: false,
    };
  }

  /**
   * 记录登录尝试
   */
  async recordLoginAttempt(data: {
    userId: string;
    ipAddress: string;
    userAgent: string;
    status: 'SUCCESS' | 'FAILED';
  }): Promise<void> {
    console.log(`[Mock] 登录尝试: ${data.status}`, {
      userId: data.userId,
      ipAddress: data.ipAddress,
    });
  }

  /**
   * 获取用户的安全日志
   */
  async getUserSecurityLogs(userId: string): Promise<SecurityLog[]> {
    // Mock模式下返回空数组
    return [];
  }

  /**
   * 检查IP地址是否被封禁
   */
  async isIpBanned(ipAddress: string): Promise<boolean> {
    // Mock模式下不封禁IP
    return false;
  }
}

// 导出单例
export const mockAuthManager = new MockAuthManager();
