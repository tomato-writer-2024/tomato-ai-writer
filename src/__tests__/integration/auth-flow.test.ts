import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * 集成测试：用户认证完整流程
 *
 * 测试用户注册、登录、token验证、登出等完整流程
 *
 * 注意：这些测试需要在真实或mock的API环境下运行
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

describe('Auth Integration Tests', () => {
  let testUserId: string;
  let testEmail: string;
  let testUsername: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(() => {
    // Generate test credentials
    testEmail = `test_${Date.now()}@example.com`;
    testUsername = `testuser_${Date.now()}`;
  });

  afterAll(async () => {
    // Cleanup: Delete test user if needed
    // await fetch(`${BASE_URL}/api/users/${testUserId}`, {
    //   method: 'DELETE',
    //   headers: { Authorization: `Bearer ${accessToken}` },
    // });
  });

  describe('User Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUsername,
          email: testEmail,
          password: 'Test123456',
          confirmPassword: 'Test123456',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe(testEmail);
      expect(data.data.user.username).toBe(testUsername);
      expect(data.data.token).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();

      testUserId = data.data.user.id;
      accessToken = data.data.token;
      refreshToken = data.data.refreshToken;
    });

    it('should prevent duplicate email registration', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'differentuser',
          email: testEmail,
          password: 'Test123456',
          confirmPassword: 'Test123456',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('已被注册');
    });

    it('should validate password confirmation', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test2@example.com',
          password: 'Test123456',
          confirmPassword: 'Different123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('密码不一致');
    });

    it('should validate email format', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Test123456',
          confirmPassword: 'Test123456',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('邮箱格式');
    });
  });

  describe('User Login Flow', () => {
    it('should login with correct credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'Test123456',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe(testEmail);
      expect(data.data.token).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();

      accessToken = data.data.token;
      refreshToken = data.data.refreshToken;
    });

    it('should reject wrong password', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('邮箱或密码');
    });

    it('should reject non-existent email', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Test123456',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('邮箱或密码');
    });
  });

  describe('Protected Routes Access', () => {
    it('should access protected route with valid token', async () => {
      const response = await fetch(`${BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(testEmail);
    });

    it('should reject protected route without token', async () => {
      const response = await fetch(`${BASE_URL}/api/user/profile`, {
        method: 'GET',
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject protected route with invalid token', async () => {
      const response = await fetch(`${BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid.token',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();

      accessToken = data.data.token;
      refreshToken = data.data.refreshToken;
    });

    it('should reject invalid refresh token', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: 'invalid.refresh.token',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });
});
