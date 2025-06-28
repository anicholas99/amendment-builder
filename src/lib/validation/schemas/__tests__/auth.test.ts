import { auth0UserIdSchema, userIdSchema, parseAuth0UserId } from '../auth';

describe('Auth Validation Schemas', () => {
  describe('auth0UserIdSchema', () => {
    it('should validate correct Auth0 ID formats', () => {
      const validIds = [
        'auth0|123abc',
        'google-oauth2|456def',
        'github|user123',
        'linkedin|test-user',
        'microsoft|abc-123',
      ];

      validIds.forEach(id => {
        const result = auth0UserIdSchema.safeParse(id);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid Auth0 ID formats', () => {
      const invalidIds = [
        'invalid',
        '123456',
        'auth0-123abc', // Wrong separator
        'auth0|', // Missing ID part
        '|123abc', // Missing provider part
        'auth0|123|extra', // Too many parts
        '', // Empty string
      ];

      invalidIds.forEach(id => {
        const result = auth0UserIdSchema.safeParse(id);
        expect(result.success).toBe(false);
      });
    });

    it('should reject UUID format', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = auth0UserIdSchema.safeParse(uuid);
      expect(result.success).toBe(false);
    });
  });

  describe('userIdSchema', () => {
    it('should accept both Auth0 and UUID formats', () => {
      const validIds = [
        // Auth0 formats
        'auth0|123abc',
        'google-oauth2|456def',
        // UUID formats
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ];

      validIds.forEach(id => {
        const result = userIdSchema.safeParse(id);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid formats', () => {
      const invalidIds = [
        'invalid',
        '123456',
        'not-a-uuid',
        'auth0-wrong-separator',
        '',
      ];

      invalidIds.forEach(id => {
        const result = userIdSchema.safeParse(id);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('parseAuth0UserId', () => {
    it('should parse valid Auth0 IDs', () => {
      const result = parseAuth0UserId('auth0|123abc');
      expect(result).toEqual({
        provider: 'auth0',
        id: '123abc',
      });
    });

    it('should return null for invalid formats', () => {
      expect(parseAuth0UserId('invalid')).toBeNull();
      expect(parseAuth0UserId('auth0-123')).toBeNull();
      expect(parseAuth0UserId('')).toBeNull();
    });
  });
});
