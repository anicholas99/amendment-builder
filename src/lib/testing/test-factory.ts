import { Project, User, Tenant } from '@prisma/client';

/**
 * Test data factory for creating consistent mock data across tests
 */
export class TestDataFactory {
  private static counter = 0;

  static reset() {
    this.counter = 0;
  }

  static generateId(prefix: string): string {
    return `${prefix}-${++this.counter}`;
  }

  static createMockUser(overrides?: Partial<User>): User {
    return {
      id: this.generateId('user'),
      email: `test${this.counter}@example.com`,
      name: `Test User ${this.counter}`,
      passwordHash: null,
      salt: null,
      role: 'USER',
      avatarUrl: null,
      isVerified: true,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      lastLogin: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      ...overrides,
    };
  }

  static createMockTenant(overrides?: Partial<Tenant>): Tenant {
    return {
      id: this.generateId('tenant'),
      name: `Test Tenant ${this.counter}`,
      slug: `test-tenant-${this.counter}`,
      description: null,
      settings: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      ...overrides,
    };
  }

  static createMockProject(overrides?: Partial<Project>): Project {
    const userId = overrides?.userId || this.generateId('user');
    const tenantId = overrides?.tenantId || this.generateId('tenant');

    return {
      id: this.generateId('project'),
      name: `Test Project ${this.counter}`,
      userId,
      tenantId,
      status: 'draft',
      textInput: 'Test input',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      deletedAt: null,
      ...overrides,
    };
  }

  static createMockSession(user?: Partial<User>, tenant?: Partial<Tenant>) {
    const mockUser = this.createMockUser(user);
    const mockTenant = this.createMockTenant(tenant);

    return {
      user: mockUser,
      tenant: mockTenant,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  static createPrismaError(code: string, meta?: any) {
    const error = new Error('Prisma error') as any;
    error.code = code;
    error.meta = meta;
    error.clientVersion = '4.0.0';
    return error;
  }
}
