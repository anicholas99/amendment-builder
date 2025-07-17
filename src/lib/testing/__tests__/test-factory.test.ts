import { TestDataFactory } from '../test-factory';

describe('TestDataFactory', () => {
  beforeEach(() => {
    TestDataFactory.reset();
  });

  describe('createMockUser', () => {
    it('should create a user with default values', () => {
      const user = TestDataFactory.createMockUser();

      expect(user).toMatchObject({
        id: expect.stringContaining('user-'),
        auth0Id: expect.stringContaining('auth0|'),
        email: expect.stringContaining('@example.com'),
        name: expect.stringContaining('Test User'),
        role: 'USER',
        tenantId: expect.stringContaining('tenant-'),
        deletedAt: null,
      });
    });

    it('should allow overriding values', () => {
      const customData = {
        email: 'custom@test.com',
        name: 'Custom User',
        role: 'ADMIN',
      };

      const user = TestDataFactory.createMockUser(customData);

      expect(user.email).toBe('custom@test.com');
      expect(user.name).toBe('Custom User');
      expect(user.role).toBe('ADMIN');
    });
  });

  describe('createMockProject', () => {
    it('should create a project with default values', () => {
      const project = TestDataFactory.createMockProject();

      expect(project).toMatchObject({
        id: expect.stringContaining('project-'),
        name: expect.stringContaining('Test Project'),
        status: 'DRAFT',
        deletedAt: null,
      });
    });
  });

  describe('createMockRequest and createMockResponse', () => {
    it('should create functional mock request and response objects', () => {
      const req = TestDataFactory.createMockRequest({
        method: 'POST',
        body: { test: true },
      });

      const res = TestDataFactory.createMockResponse();

      expect(req.method).toBe('POST');
      expect(req.body).toEqual({ test: true });

      res.status(201).json({ success: true });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ success: true });
    });
  });
});
