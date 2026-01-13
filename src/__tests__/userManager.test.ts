import { userManager } from '@/storage/database';
import { hashPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';

// Mock database connection
jest.mock('@/storage/database', () => ({
  ...jest.requireActual('@/storage/database'),
  getDb: jest.fn().mockResolvedValue({
    execute: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }),
}));

describe('UserManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: randomUUID(),
        email: 'test@example.com',
        passwordHash: await hashPassword('test123'),
        username: 'testuser',
        role: 'FREE',
        membershipLevel: 'FREE',
      };

      // Mock the database response
      const { getDb } = require('@/storage/database');
      const mockDb = await getDb();
      mockDb.execute.mockResolvedValue({ rows: [mockUser] });

      const user = await userManager.getUserByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const { getDb } = require('@/storage/database');
      const mockDb = await getDb();
      mockDb.execute.mockResolvedValue({ rows: [] });

      const user = await userManager.getUserByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = {
        id: randomUUID(),
        email: 'test@example.com',
        passwordHash: await hashPassword('test123'),
        username: 'testuser',
        role: 'FREE',
        membershipLevel: 'FREE',
      };

      const { getDb } = require('@/storage/database');
      const mockDb = await getDb();
      mockDb.execute.mockResolvedValue({ rows: [mockUser] });

      const user = await userManager.getUserByUsername('testuser');

      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
    });

    it('should return null for non-existent username', async () => {
      const { getDb } = require('@/storage/database');
      const mockDb = await getDb();
      mockDb.execute.mockResolvedValue({ rows: [] });

      const user = await userManager.getUserByUsername('nonexistent');

      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        passwordHash: await hashPassword('password123'),
        username: 'newuser',
        role: 'FREE',
        membershipLevel: 'FREE',
      };

      const { getDb } = require('@/storage/database');
      const mockDb = await getDb();
      mockDb.execute.mockResolvedValue({ rows: [newUser] });

      const user = await userManager.createUser(newUser);

      expect(user).toBeDefined();
      expect(user.email).toBe(newUser.email);
      expect(user.username).toBe(newUser.username);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time', async () => {
      const userId = randomUUID();
      const timestamp = new Date().toISOString();

      const { getDb } = require('@/storage/database');
      const mockDb = await getDb();
      mockDb.execute.mockResolvedValue({ rows: [{ last_login_at: timestamp }] });

      await userManager.updateLastLogin(userId);

      expect(mockDb.execute).toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const userId = randomUUID();
      const newPassword = await hashPassword('newpassword123');

      const { getDb } = require('@/storage/database');
      const mockDb = await getDb();
      mockDb.execute.mockResolvedValue({ rows: [{ password_hash: newPassword }] });

      await userManager.updatePassword(userId, newPassword);

      expect(mockDb.execute).toHaveBeenCalled();
    });
  });
});
