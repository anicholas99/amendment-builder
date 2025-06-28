/**
 * Unit tests for JSON utilities
 */
import { z } from 'zod';
import {
  safeJsonParse,
  parseJsonWithSchema,
  tryParseJson,
  safeJsonStringify,
} from '../json-utils';
import { logger } from '@/lib/monitoring/logger';

// Mock the logger to avoid console output during tests
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('json-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON strings correctly', () => {
      const input = '{"name": "test", "value": 123}';
      const result = safeJsonParse(input);
      expect(result).toEqual({ name: 'test', value: 123 });
    });

    it('returns default value for invalid JSON', () => {
      const input = 'invalid json';
      const defaultValue = { error: true };
      const result = safeJsonParse(input, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('returns undefined for invalid JSON when no default provided', () => {
      const input = '{invalid}';
      const result = safeJsonParse(input);
      expect(result).toBeUndefined();
    });

    it('handles empty strings', () => {
      const result = safeJsonParse('');
      expect(result).toBeUndefined();
    });

    it('should return undefined for null input', () => {
      const result = safeJsonParse(null as unknown as string);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      const result = safeJsonParse(undefined as unknown as string);
      expect(result).toBeUndefined();
    });

    it('preserves type when using generics', () => {
      interface TestType {
        id: number;
        name: string;
      }
      const input = '{"id": 1, "name": "test"}';
      const result = safeJsonParse<TestType>(input);
      expect(result).toEqual({ id: 1, name: 'test' });
      // TypeScript should infer result as TestType | null
    });

    it('should truncate long JSON in error logs', () => {
      const longJson = 'a'.repeat(200);
      safeJsonParse(longJson);
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to parse JSON',
        expect.objectContaining({
          jsonSnippet: 'a'.repeat(100),
        })
      );
    });
  });

  describe('parseJsonWithSchema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    it('should parse and validate JSON with correct schema', () => {
      const json = '{"name": "John", "age": 30}';
      const result = parseJsonWithSchema(json, schema);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should return null for invalid JSON syntax', () => {
      const json = 'not json';
      const result = parseJsonWithSchema(json, schema);
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Invalid JSON syntax',
        expect.objectContaining({
          error: expect.any(String),
          jsonSnippet: 'not json',
        })
      );
    });

    it('should return null for JSON that does not match schema', () => {
      const json = '{"name": "John", "age": "thirty"}'; // age should be number
      const result = parseJsonWithSchema(json, schema);
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'JSON validation failed',
        expect.objectContaining({
          errors: expect.any(Array),
          jsonSnippet: json,
        })
      );
    });

    it('should handle missing required fields', () => {
      const json = '{"name": "John"}'; // missing age
      const result = parseJsonWithSchema(json, schema);
      expect(result).toBeNull();
    });

    it('should handle unexpected errors', () => {
      const badSchema = {
        parse: () => {
          throw new Error('Unexpected error');
        },
      } as unknown as z.ZodSchema<unknown>;

      const json = '{"valid": "json"}';
      const result = parseJsonWithSchema(json, badSchema);
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Unexpected error parsing JSON',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('tryParseJson', () => {
    it('should parse valid JSON', () => {
      const result = tryParseJson('{"test": true}');
      expect(result).toEqual({ test: true });
    });

    it('should return original string if not valid JSON', () => {
      const input = 'not json';
      const result = tryParseJson(input);
      expect(result).toBe(input);
    });

    it('should handle arrays', () => {
      const result = tryParseJson('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle primitive values', () => {
      expect(tryParseJson('"string"')).toBe('string');
      expect(tryParseJson('123')).toBe(123);
      expect(tryParseJson('true')).toBe(true);
      expect(tryParseJson('null')).toBe(null);
    });

    it('should handle empty string', () => {
      const result = tryParseJson('');
      expect(result).toBe('');
    });
  });

  describe('safeJsonStringify', () => {
    it('stringifies objects correctly', () => {
      const input = { name: 'test', value: 123 };
      const result = safeJsonStringify(input);
      expect(result).toBe('{"name":"test","value":123}');
    });

    it('handles circular references', () => {
      interface CircularObj {
        name: string;
        circular?: CircularObj;
      }

      const obj: CircularObj = { name: 'test' };
      obj.circular = obj;
      const result = safeJsonStringify(obj);
      expect(result).toBeNull();
    });

    it('handles null input', () => {
      const result = safeJsonStringify(null);
      expect(result).toBe('null');
    });

    it('handles undefined input', () => {
      const result = safeJsonStringify(undefined);
      expect(result).toBeNull();
    });

    it('handles arrays', () => {
      const input = [1, 2, 3, 'test'];
      const result = safeJsonStringify(input);
      expect(result).toBe('[1,2,3,"test"]');
    });

    it('handles nested objects', () => {
      const input = {
        level1: {
          level2: {
            level3: 'deep value',
          },
        },
      };
      const result = safeJsonStringify(input);
      expect(result).toBe('{"level1":{"level2":{"level3":"deep value"}}}');
    });

    it('handles functions by omitting them', () => {
      const input = {
        name: 'test',
        func: () => console.log('test'),
        value: 123,
      };
      const result = safeJsonStringify(input);
      expect(result).toBe('{"name":"test","value":123}');
    });

    it('should handle space parameter for formatting', () => {
      const obj = { a: 1, b: 2 };
      const result = safeJsonStringify(obj, 2);
      expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    it('should handle BigInt by returning null', () => {
      const result = safeJsonStringify(BigInt(123));
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to stringify JSON',
        expect.objectContaining({
          error: expect.any(String),
          valueType: 'bigint',
        })
      );
    });
  });
});
