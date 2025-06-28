/**
 * Unit tests for API validation utilities
 */
import { z } from 'zod';
import { validateApiResponse, validateRequestBody } from '../apiValidation';

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('API Validation', () => {
  describe('validateApiResponse', () => {
    const userSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      age: z.number().min(0),
    });

    it('validates correct response data', () => {
      const validData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const result = validateApiResponse(validData, userSchema);
      expect(result).toEqual(validData);
    });

    it('throws error for invalid response data', () => {
      const invalidData = {
        id: '123',
        name: 'John Doe',
        email: 'invalid-email',
        age: -5,
      };

      expect(() => validateApiResponse(invalidData, userSchema)).toThrow();
    });

    it('handles missing required fields', () => {
      const incompleteData = {
        id: '123',
        name: 'John Doe',
        // missing email and age
      };

      expect(() => validateApiResponse(incompleteData, userSchema)).toThrow();
    });

    it('strips unknown fields when strict mode is disabled', () => {
      const dataWithExtra = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        extraField: 'should be stripped',
      };

      const result = validateApiResponse(dataWithExtra, userSchema);
      expect(result).not.toHaveProperty('extraField');
    });

    it('validates arrays of data', () => {
      const arraySchema = z.array(userSchema);
      const validArray = [
        {
          id: '1',
          name: 'John',
          email: 'john@example.com',
          age: 30,
        },
        {
          id: '2',
          name: 'Jane',
          email: 'jane@example.com',
          age: 25,
        },
      ];

      const result = validateApiResponse(validArray, arraySchema);
      expect(result).toEqual(validArray);
    });

    it('handles complex nested objects', () => {
      const nestedSchema = z.object({
        user: userSchema,
        metadata: z.object({
          createdAt: z.string(),
          updatedAt: z.string(),
        }),
      });

      const validNestedData = {
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
        },
        metadata: {
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
        },
      };

      const result = validateApiResponse(validNestedData, nestedSchema);
      expect(result).toEqual(validNestedData);
    });
  });

  describe('validateRequestBody', () => {
    const createUserSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(0).optional(),
    });

    it('validates correct request body', () => {
      const validBody = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const result = validateRequestBody(validBody, createUserSchema);
      expect(result).toEqual(validBody);
    });

    it('throws detailed error for invalid request body', () => {
      const invalidBody = {
        name: '',
        email: 'invalid-email',
        age: -1,
      };

      expect(() => validateRequestBody(invalidBody, createUserSchema)).toThrow();
    });

    it('handles optional fields', () => {
      const bodyWithoutOptional = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = validateRequestBody(bodyWithoutOptional, createUserSchema);
      expect(result).toEqual(bodyWithoutOptional);
    });

    it('applies default values', () => {
      const schemaWithDefaults = z.object({
        name: z.string(),
        role: z.string().default('user'),
        isActive: z.boolean().default(true),
      });

      const bodyWithoutDefaults = {
        name: 'John Doe',
      };

      const result = validateRequestBody(bodyWithoutDefaults, schemaWithDefaults);
      expect(result).toEqual({
        name: 'John Doe',
        role: 'user',
        isActive: true,
      });
    });

    it('transforms data according to schema', () => {
      const transformSchema = z.object({
        name: z.string().trim().toLowerCase(),
        age: z.string().transform(Number),
      });

      const bodyToTransform = {
        name: '  JOHN DOE  ',
        age: '30',
      };

      const result = validateRequestBody(bodyToTransform, transformSchema);
      expect(result).toEqual({
        name: 'john doe',
        age: 30,
      });
    });

    it('handles null and undefined values', () => {
      const schema = z.object({
        optionalField: z.string().optional(),
        nullableField: z.string().nullable(),
      });

      const bodyWithNulls = {
        optionalField: undefined,
        nullableField: null,
      };

      const result = validateRequestBody(bodyWithNulls, schema);
      expect(result.nullableField).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('provides meaningful error messages', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      const invalidData = {
        email: 'not-an-email',
        age: 10,
      };

      try {
        validateApiResponse(invalidData, schema);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('email');
        expect(error.message).toContain('age');
      }
    });

    it('includes field paths in nested validation errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            email: z.string().email(),
          }),
        }),
      });

      const invalidData = {
        user: {
          profile: {
            email: 'invalid',
          },
        },
      };

      try {
        validateApiResponse(invalidData, schema);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('user.profile.email');
      }
    });
  });
});