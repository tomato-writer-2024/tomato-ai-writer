/**
 * Mock用户管理器
 * 在Mock模式下模拟用户数据库操作
 */

import { mockDb, MockUser } from './mockDb';
import { hashPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';

export interface InsertUser {
  username: string;
  email: string;
  passwordHash: string;
  role?: string;
  membershipLevel?: string;
}

export interface UpdateUser {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  membershipLevel?: string;
  isActive?: boolean;
  isBanned?: boolean;
  banReason?: string;
  lastLoginAt?: string;
}

export class MockUserManager {
  /**
   * 创建用户
   */
  async createUser(data: InsertUser): Promise<MockUser> {
    const user: MockUser = {
      id: randomUUID(),
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      password: '', // 保留字段兼容性
      role: data.role || 'user',
      membershipLevel: data.membershipLevel || 'free',
      isActive: true,
      isBanned: false,
      dailyUsageCount: 0,
      monthlyUsageCount: 0,
      storageUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockDb.users.insert(user);
  }

  /**
   * 获取用户列表
   */
  async getUsers(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<MockUser, 'id' | 'username' | 'email' | 'membershipLevel' | 'isActive' | 'isBanned'>>;
    searchQuery?: string;
  } = {}): Promise<MockUser[]> {
    const { filters = {}, searchQuery } = options;
    let users = mockDb.users.find({});

    // 精确条件过滤
    if (filters.id) {
      users = users.filter(u => u.id === filters.id);
    }
    if (filters.username) {
      users = users.filter(u => u.username === filters.username);
    }
    if (filters.email) {
      users = users.filter(u => u.email === filters.email);
    }
    if (filters.membershipLevel) {
      users = users.filter(u => u.membershipLevel === filters.membershipLevel);
    }
    if (filters.isActive !== undefined) {
      users = users.filter(u => u.isActive === filters.isActive);
    }
    if (filters.isBanned !== undefined) {
      users = users.filter(u => u.isBanned === filters.isBanned);
    }

    // 搜索查询
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      users = users.filter(u =>
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    // 分页
    const { skip = 0, limit = 100 } = options;
    return users.slice(skip, skip + limit);
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<MockUser | null> {
    const users = mockDb.users.find({ id });
    return users[0] || null;
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<MockUser | null> {
    const users = mockDb.users.find({ email });
    return users[0] || null;
  }

  /**
   * 根据用户名获取用户
   */
  async getUserByUsername(username: string): Promise<MockUser | null> {
    const users = mockDb.users.find({ username });
    return users[0] || null;
  }

  /**
   * 根据微信OpenID获取用户
   */
  async getUserByWechatOpenId(openId: string): Promise<MockUser | null> {
    // Mock模式下不支持微信登录
    return null;
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, data: UpdateUser): Promise<MockUser | null> {
    const updates: Partial<MockUser> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.password) {
      updates.password = await hashPassword(data.password);
    }

    return mockDb.users.update(id, updates);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<boolean> {
    return mockDb.users.delete(id);
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(id: string): Promise<boolean> {
    const user = await this.getUserById(id);
    if (!user) return false;
    await this.updateUser(id, { lastLoginAt: new Date().toISOString() });
    return true;
  }

  /**
   * 封禁用户
   */
  async banUser(id: string, reason: string): Promise<boolean> {
    const user = await this.updateUser(id, { isBanned: true, banReason: reason, isActive: false });
    return !!user;
  }

  /**
   * 解封用户
   */
  async unbanUser(id: string): Promise<boolean> {
    const user = await this.updateUser(id, { isBanned: false, isActive: true });
    return !!user;
  }

  /**
   * 获取用户数量
   */
  async getUsersCount(filters?: Partial<MockUser>): Promise<number> {
    let users = mockDb.users.find({});

    if (filters) {
      users = users.filter(user => {
        return Object.entries(filters).every(([key, value]) => user[key as keyof MockUser] === value);
      });
    }

    return users.length;
  }
}

// 导出单例
export const mockUserManager = new MockUserManager();
