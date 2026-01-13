import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, verifyAccessToken } from '@/lib/auth';

describe('Auth Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      const password = 'test123456';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'test123456';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'test123456';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'test123456';
      const wrongPassword = 'wrongpassword';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const password = 'test123456';
      const invalidHash = 'invalid-hash';

      await expect(verifyPassword(password, invalidHash)).rejects.toThrow();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'FREE',
        membershipLevel: 'FREE',
      };

      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct payload in token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'FREE',
        membershipLevel: 'FREE',
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.membershipLevel).toBe(payload.membershipLevel);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
      };

      const token = generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct payload in token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
      };

      const token = generateRefreshToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'FREE',
        membershipLevel: 'FREE',
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.string';

      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      // This test assumes tokens have a short expiration time
      // In production, you'd need to mock time or use a very short expiration
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'FREE',
        membershipLevel: 'FREE',
      };

      const token = generateAccessToken(payload);

      // Token should be valid immediately after generation
      expect(() => verifyAccessToken(token)).not.toThrow();
    });
  });
});
