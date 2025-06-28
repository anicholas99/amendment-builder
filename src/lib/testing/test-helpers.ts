import { NextApiRequest, NextApiResponse } from 'next';

// Test file specific fixes:

// 1. For mock requests/responses in tests:
export const createMockRequest = (
  overrides: Partial<NextApiRequest> = {}
): NextApiRequest => {
  return {
    method: 'GET',
    query: {},
    body: {},
    headers: {},
    ...overrides,
  } as unknown as NextApiRequest;
};

export const createMockResponse = (): NextApiResponse => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
};

// 2. For handler calls in tests:
// await handler(req, res);  // No type assertions needed

// 3. For accessing mock properties:
export type MockedResponse = NextApiResponse & {
  _getStatusCode: () => number;
  _getJSONData: () => unknown;
};

// Example usage:
// const statusCode = (res as MockedResponse)._getStatusCode();
// const jsonData = (res as MockedResponse)._getJSONData();
