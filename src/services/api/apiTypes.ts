/**
 * Common types for API services
 */

export class APIResponseError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.name = 'APIResponseError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.response = response;
  }
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
