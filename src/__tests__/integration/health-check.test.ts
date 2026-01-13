import { describe, it, expect } from '@jest/globals';

/**
 * 集成测试：系统健康检查
 *
 * 测试API健康检查端点、数据库连接、环境变量等
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

describe('Health Check Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return healthy status when all systems are operational', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.checks).toBeDefined();
      expect(data.checks.environment).toBeDefined();
      expect(data.checks.database).toBeDefined();
      expect(data.responseTime).toBeDefined();
    });

    it('should include environment variable checks', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      const data = await response.json();

      expect(data.checks.environment).toBeDefined();
      expect(data.checks.environment.status).toBe('ok' || 'error');
      expect(data.checks.environment.details).toBeDefined();
      expect(data.checks.environment.details.DATABASE_URL).toBeDefined();
      expect(data.checks.environment.details.JWT_SECRET).toBeDefined();
      expect(data.checks.environment.details.DOUBAO_API_KEY).toBeDefined();
    });

    it('should include database connection check', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      const data = await response.json();

      expect(data.checks.database).toBeDefined();
      expect(data.checks.database.status).toBe('ok' || 'error');
      expect(data.checks.database.connectionTime).toBeDefined();
    });

    it('should include system information', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      const data = await response.json();

      expect(data.system).toBeDefined();
      expect(data.system.nodeVersion).toBeDefined();
      expect(data.system.platform).toBeDefined();
      expect(data.system.uptime).toBeDefined();
      expect(data.system.memory).toBeDefined();
    });

    it('should have acceptable response time', async () => {
      const start = Date.now();
      const response = await fetch(`${BASE_URL}/api/health`);
      const end = Date.now();
      const responseTime = end - start;

      expect(responseTime).toBeLessThan(1000); // Should respond in less than 1 second
    });
  });

  describe('Database Initialization', () => {
    it('should initialize database tables via init-database API', async () => {
      const response = await fetch(`${BASE_URL}/api/init-database`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.existingTables).toBeDefined();
      expect(data.data.newTables).toBeDefined();
    });

    it('should show all required tables', async () => {
      const response = await fetch(`${BASE_URL}/api/init-database`);
      const data = await response.json();

      const requiredTables = [
        'users',
        'novels',
        'chapters',
        'security_logs',
        'usage_logs',
        'materials',
        'api_keys',
        'membership_orders',
      ];

      const allTables = [
        ...(data.data.existingTables || []),
        ...(data.data.newTables || []),
      ];

      requiredTables.forEach(table => {
        expect(allTables).toContain(table);
      });
    });
  });

  describe('Admin Initialization', () => {
    it('should create super admin via init-admin API', async () => {
      const timestamp = Date.now();
      const adminEmail = `admin_${timestamp}@tomato-ai.com`;

      const response = await fetch(
        `${BASE_URL}/api/init-admin?email=${adminEmail}&password=Admin123456`
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(adminEmail);
      expect(data.data.role).toBe('DEVELOPER');
      expect(data.data.membershipLevel).toBe('PREMIUM');
    });

    it('should prevent duplicate admin creation', async () => {
      const adminEmail = 'admin@example.com';

      // First creation
      await fetch(
        `${BASE_URL}/api/init-admin?email=${adminEmail}&password=Admin123456`
      );

      // Second creation (should fail)
      const response = await fetch(
        `${BASE_URL}/api/init-admin?email=${adminEmail}&password=Admin123456`
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('已存在');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/nonexistent-route`);
      const data = await response.json();

      expect(response.status).toBe(404);
    });

    it('should handle invalid HTTP methods', async () => {
      const response = await fetch(`${BASE_URL}/api/health`, {
        method: 'POST',
      });

      expect(response.status).toBe(405); // Method Not Allowed
    });

    it('should handle malformed JSON in POST requests', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json{',
      });

      expect(response.status).toBe(400);
    });
  });
});
