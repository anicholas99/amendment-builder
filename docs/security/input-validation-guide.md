# Input Validation Security Guide

## Overview

This guide documents best practices for input validation across all API routes to prevent security vulnerabilities and ensure data integrity.

## Validation Constants

All validation limits are centralized in `/src/constants/validation.ts` to ensure consistency:

```typescript
import { VALIDATION_LIMITS, VALIDATION_PATTERNS } from '@/constants/validation';
```

## Implementation Patterns

### 1. Basic String Validation

```typescript
import { z } from 'zod';
import { VALIDATION_LIMITS } from '@/constants/validation';

const schema = z.object({
  name: z
    .string()
    .min(VALIDATION_LIMITS.NAME.MIN, 'Name is required')
    .max(VALIDATION_LIMITS.NAME.MAX, `Name must be less than ${VALIDATION_LIMITS.NAME.MAX} characters`)
    .trim(),
  
  email: z
    .string()
    .email('Invalid email format')
    .max(VALIDATION_LIMITS.EMAIL.MAX)
    .toLowerCase()
    .trim(),
});
```

### 2. Array Validation

```typescript
const schema = z.object({
  tags: z
    .array(z.string().max(50))
    .max(VALIDATION_LIMITS.MAX_TAGS, `Maximum ${VALIDATION_LIMITS.MAX_TAGS} tags allowed`)
    .optional(),
  
  items: z
    .array(z.any())
    .max(VALIDATION_LIMITS.MAX_ARRAY_SIZE, 'Too many items')
    .min(1, 'At least one item required'),
});
```

### 3. Pagination Validation

```typescript
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z
    .coerce
    .number()
    .int()
    .positive()
    .max(VALIDATION_LIMITS.MAX_PAGE_SIZE)
    .default(VALIDATION_LIMITS.DEFAULT_PAGE_SIZE),
});
```

### 4. Pattern-Based Validation

```typescript
const schema = z.object({
  slug: z
    .string()
    .min(VALIDATION_LIMITS.SLUG.MIN)
    .max(VALIDATION_LIMITS.SLUG.MAX)
    .regex(VALIDATION_PATTERNS.SLUG, 'Invalid slug format'),
  
  projectId: z
    .string()
    .uuid('Invalid project ID format'),
  
  patentNumber: z
    .string()
    .max(VALIDATION_LIMITS.PATENT_NUMBER.MAX)
    .regex(VALIDATION_PATTERNS.PATENT_NUMBER, 'Invalid patent number format'),
});
```

## Security Considerations

### 1. Prevent DoS Attacks

Always set maximum limits on:
- String lengths
- Array sizes
- File sizes
- Request body size

### 2. Sanitization

```typescript
const schema = z.object({
  // Trim whitespace
  name: z.string().trim(),
  
  // Normalize email
  email: z.string().email().toLowerCase().trim(),
  
  // Remove HTML tags
  description: z.string().transform(val => 
    val.replace(/<[^>]*>/g, '')
  ),
});
```

### 3. Type Coercion

```typescript
const schema = z.object({
  // Safely convert string to number
  age: z.coerce.number().int().positive().max(150),
  
  // Convert string to boolean
  isActive: z.coerce.boolean(),
  
  // Parse JSON safely
  metadata: z.string().transform((val) => {
    try {
      return JSON.parse(val);
    } catch {
      throw new Error('Invalid JSON');
    }
  }),
});
```

## Common Validation Rules

### Text Fields

| Field Type | Min Length | Max Length | Notes |
|------------|-----------|------------|-------|
| Name | 1 | 100 | Trim whitespace |
| Title | 1 | 200 | Trim whitespace |
| Description | 0 | 1000 | Optional field |
| Email | - | 254 | RFC 5321 standard |
| URL | - | 2048 | Browser limit |
| Slug | 1 | 50 | Lowercase, alphanumeric + hyphens |

### Patent-Specific Fields

| Field Type | Min Length | Max Length | Notes |
|------------|-----------|------------|-------|
| Patent Number | 1 | 50 | Various formats supported |
| Claim Text | 10 | 5000 | ~1 page of text |
| Abstract | 10 | 2000 | ~0.5 page |
| Invention Text | 10 | 100000 | ~25 pages |

### Arrays and Limits

| Type | Maximum | Notes |
|------|---------|-------|
| Array Size | 100 | General arrays |
| Batch Operations | 50 | Bulk updates |
| Tags | 20 | Per resource |
| Claims | 50 | Per request |
| Page Size | 100 | Pagination |

## Error Messages

Provide clear, user-friendly error messages:

```typescript
const schema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
```

## Migration Checklist

When updating existing endpoints:

- [ ] Import validation constants
- [ ] Replace hardcoded limits with constants
- [ ] Add missing max length validations
- [ ] Add array size limits
- [ ] Test with boundary values
- [ ] Update API documentation

## Testing Validation

Always test with:
1. **Minimum values**: Empty strings, zero, negative numbers
2. **Maximum values**: Max length strings, large numbers
3. **Invalid types**: Wrong data types, null, undefined
4. **Injection attempts**: SQL, XSS, path traversal
5. **Large payloads**: Test request size limits

## References

- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Zod Documentation](https://zod.dev)
- Validation Constants: `/src/constants/validation.ts` 