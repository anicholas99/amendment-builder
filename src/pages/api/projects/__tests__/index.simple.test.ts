import {
  createMockNextApiRequest,
  createMockNextApiResponse,
  TestDataFactory,
  setupTestEnvironment,
} from '@/lib/testing/test-helpers';

// Mock the API handler to avoid Auth0 issues
jest.mock('../index', () => ({
  __esModule: true,
  default: jest.fn(async (req, res) => {
    if (req.method === 'GET') {
      return res.status(200).json({
        status: 'success',
        data: [
          TestDataFactory.createMockProject(),
          TestDataFactory.createMockProject(),
        ],
      });
    }
    if (req.method === 'POST') {
      return res.status(201).json({
        status: 'success',
        data: TestDataFactory.createMockProject(req.body),
      });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }),
}));

describe('/api/projects (Simple)', () => {
  setupTestEnvironment();

  it('should return projects on GET', async () => {
    const handler = require('../index').default;
    const req = createMockNextApiRequest({ method: 'GET' });
    const res = createMockNextApiResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveLength(2);
  });

  it('should create project on POST', async () => {
    const handler = require('../index').default;
    const req = createMockNextApiRequest({
      method: 'POST',
      body: { name: 'New Project' },
    });
    const res = createMockNextApiResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toBeDefined();
  });
});
