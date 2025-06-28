/**
 * Unit tests for object utilities
 */
import {
  getNestedProperty,
  resolveTenantIdFromCitation,
  hasNestedProperty,
  setNestedProperty,
} from '../object-utils';

describe('object-utils', () => {
  describe('getNestedProperty', () => {
    const testObj = {
      user: {
        profile: {
          name: 'John Doe',
          age: 30,
        },
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
          },
        },
      },
      items: [1, 2, 3],
    };

    it('should get nested property value', () => {
      expect(getNestedProperty(testObj, 'user.profile.name')).toBe('John Doe');
      expect(getNestedProperty(testObj, 'user.settings.theme')).toBe('dark');
      expect(
        getNestedProperty(testObj, 'user.settings.notifications.email')
      ).toBe(true);
    });

    it('should return undefined for non-existent properties', () => {
      expect(getNestedProperty(testObj, 'user.profile.email')).toBeUndefined();
      expect(
        getNestedProperty(testObj, 'user.settings.invalid.path')
      ).toBeUndefined();
    });

    it('should return default value for non-existent properties', () => {
      expect(getNestedProperty(testObj, 'user.profile.email', 'N/A')).toBe(
        'N/A'
      );
      expect(getNestedProperty(testObj, 'invalid.path', 'default')).toBe(
        'default'
      );
    });

    it('should handle null and undefined objects', () => {
      expect(getNestedProperty(null, 'any.path', 'default')).toBe('default');
      expect(getNestedProperty(undefined, 'any.path', 'default')).toBe(
        'default'
      );
    });

    it('should handle non-object values', () => {
      expect(getNestedProperty('string', 'any.path', 'default')).toBe(
        'default'
      );
      expect(getNestedProperty(123, 'any.path', 'default')).toBe('default');
    });

    it('should handle array access', () => {
      expect(getNestedProperty(testObj, 'items')).toEqual([1, 2, 3]);
    });

    it('should handle empty path', () => {
      expect(getNestedProperty(testObj, '')).toBeUndefined();
    });

    it('should handle single level property', () => {
      expect(getNestedProperty(testObj, 'user')).toEqual(testObj.user);
    });

    it('should handle falsy values correctly', () => {
      const objWithFalsy = {
        zero: 0,
        false: false,
        null: null,
        empty: '',
      };
      expect(getNestedProperty(objWithFalsy, 'zero')).toBe(0);
      expect(getNestedProperty(objWithFalsy, 'false')).toBe(false);
      expect(getNestedProperty(objWithFalsy, 'null')).toBe(null);
      expect(getNestedProperty(objWithFalsy, 'empty')).toBe('');
    });
  });

  describe('resolveTenantIdFromCitation', () => {
    it('should resolve tenantId from searchHistory.project path', () => {
      const obj = {
        searchHistory: {
          project: {
            tenantId: 'tenant123',
          },
        },
      };
      expect(resolveTenantIdFromCitation(obj)).toBe('tenant123');
    });

    it('should resolve tenantId from project path', () => {
      const obj = {
        project: {
          tenantId: 'tenant456',
        },
      };
      expect(resolveTenantIdFromCitation(obj)).toBe('tenant456');
    });

    it('should resolve tenantId from direct property', () => {
      const obj = {
        tenantId: 'tenant789',
      };
      expect(resolveTenantIdFromCitation(obj)).toBe('tenant789');
    });

    it('should prioritize searchHistory.project.tenantId over other paths', () => {
      const obj = {
        tenantId: 'direct',
        project: {
          tenantId: 'project',
        },
        searchHistory: {
          project: {
            tenantId: 'searchHistory',
          },
        },
      };
      expect(resolveTenantIdFromCitation(obj)).toBe('searchHistory');
    });

    it('should return null for invalid structures', () => {
      expect(resolveTenantIdFromCitation(null)).toBeNull();
      expect(resolveTenantIdFromCitation(undefined)).toBeNull();
      expect(resolveTenantIdFromCitation({})).toBeNull();
      expect(resolveTenantIdFromCitation({ searchHistory: null })).toBeNull();
      expect(resolveTenantIdFromCitation({ project: {} })).toBeNull();
    });

    it('should handle non-object values', () => {
      expect(resolveTenantIdFromCitation('string')).toBeNull();
      expect(resolveTenantIdFromCitation(123)).toBeNull();
      expect(resolveTenantIdFromCitation([])).toBeNull();
    });
  });

  describe('hasNestedProperty', () => {
    const testObj = {
      user: {
        name: 'test',
        settings: {
          theme: 'dark',
          enabled: false,
          count: 0,
        },
      },
    };

    it('should return true for existing properties', () => {
      expect(hasNestedProperty(testObj, 'user')).toBe(true);
      expect(hasNestedProperty(testObj, 'user.name')).toBe(true);
      expect(hasNestedProperty(testObj, 'user.settings.theme')).toBe(true);
    });

    it('should return true for falsy values', () => {
      expect(hasNestedProperty(testObj, 'user.settings.enabled')).toBe(true);
      expect(hasNestedProperty(testObj, 'user.settings.count')).toBe(true);
    });

    it('should return false for non-existent properties', () => {
      expect(hasNestedProperty(testObj, 'missing')).toBe(false);
      expect(hasNestedProperty(testObj, 'user.missing')).toBe(false);
      expect(hasNestedProperty(testObj, 'user.settings.missing')).toBe(false);
    });

    it('should handle null and undefined objects', () => {
      expect(hasNestedProperty(null, 'any')).toBe(false);
      expect(hasNestedProperty(undefined, 'any')).toBe(false);
    });
  });

  describe('setNestedProperty', () => {
    it('should set nested property value', () => {
      const obj: unknown = {};
      expect(setNestedProperty(obj, 'user.profile.name', 'John')).toBe(true);
      expect(obj).toEqual({
        user: {
          profile: {
            name: 'John',
          },
        },
      });
    });

    it('should overwrite existing values', () => {
      const obj = {
        user: {
          profile: {
            name: 'Jane',
          },
        },
      };
      expect(setNestedProperty(obj, 'user.profile.name', 'John')).toBe(true);
      expect(obj.user.profile.name).toBe('John');
    });

    it('should create intermediate objects as needed', () => {
      const obj: unknown = { existing: true };
      expect(setNestedProperty(obj, 'a.b.c.d', 'value')).toBe(true);
      expect(obj).toEqual({
        existing: true,
        a: {
          b: {
            c: {
              d: 'value',
            },
          },
        },
      });
    });

    it('should handle single level property', () => {
      const obj: unknown = {};
      expect(setNestedProperty(obj, 'name', 'test')).toBe(true);
      expect(obj).toEqual({ name: 'test' });
    });

    it('should return false for invalid objects', () => {
      expect(setNestedProperty(null, 'any.path', 'value')).toBe(false);
      expect(setNestedProperty(undefined, 'any.path', 'value')).toBe(false);
      expect(setNestedProperty('string', 'any.path', 'value')).toBe(false);
      expect(setNestedProperty(123, 'any.path', 'value')).toBe(false);
    });

    it('should return false for empty path', () => {
      const obj = {};
      expect(setNestedProperty(obj, '', 'value')).toBe(false);
    });

    it('should handle arrays in the path', () => {
      interface ArrayObj {
        items: Array<{ name: string }>;
      }
      const obj = { items: [{ name: 'first' }] } as ArrayObj;
      expect(setNestedProperty(obj, 'items.0.name', 'updated')).toBe(true);
      expect(obj.items[0].name).toBe('updated');
    });

    it('should overwrite non-object values in the path', () => {
      const obj: unknown = { user: 'string' };
      expect(setNestedProperty(obj, 'user.name', 'John')).toBe(true);
      expect(obj).toEqual({
        user: {
          name: 'John',
        },
      });
    });

    it('should update deeply nested array elements', () => {
      interface NestedObj {
        items: Array<{ name: string }>;
      }

      const obj: NestedObj = {
        items: [{ name: 'original' }],
      };

      expect(setNestedProperty(obj, 'items[0].name', 'updated')).toBe(true);
      expect(obj.items[0].name).toBe('updated');
    });
  });
});
