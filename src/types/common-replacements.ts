import { NextApiRequest, NextApiResponse } from 'next';

// Common types for replacing any
export type UnknownObject = Record<string, unknown>;
export type UnknownArray = unknown[];
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;
export type SyncFunction<T = unknown> = (...args: unknown[]) => T;
export type ErrorWithCode = Error & { code?: string; statusCode?: number };
export type CommonApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;
export type TestMockRequest = Partial<NextApiRequest> & {
  method?: string;
  query?: UnknownObject;
  body?: UnknownObject;
};
export type TestMockResponse = Partial<NextApiResponse> & {
  status: (code: number) => TestMockResponse;
  json: (data: unknown) => TestMockResponse;
  setHeader: (name: string, value: string) => TestMockResponse;
};
