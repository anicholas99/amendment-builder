import { logger, safeStringify } from '../logger';

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });

  describe('safeStringify', () => {
    it('should handle null and undefined', () => {
      expect(safeStringify(null)).toBe('null');
      expect(safeStringify(undefined)).toBe('undefined');
    });

    it('should handle primitive values', () => {
      expect(safeStringify('test')).toBe('test');
      expect(safeStringify(123)).toBe('123');
      expect(safeStringify(true)).toBe('true');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = safeStringify(error);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('Error');
      expect(parsed.message).toBe('Test error');
      expect(parsed.stack).toBeDefined();
    });

    it('should handle circular references', () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.circular = obj;
      const result = safeStringify(obj);
      expect(result).toContain('[Circular Reference]');
    });

    it('should truncate very long strings', () => {
      const longObj = { data: 'x'.repeat(3000) };
      const result = safeStringify(longObj);
      expect(result.length).toBeLessThanOrEqual(2100); // 2000 + some overhead
      expect(result).toContain('[truncated]');
    });
  });

  describe('Logger methods', () => {
    it('should log debug messages in development', () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'development';
      logger.debug('Debug message', { extra: 'data' });
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Info message', { extra: 'data' });
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      logger.warn('Warning message', { extra: 'data' });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Error message', { error: new Error('Test') });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should format messages with timestamp', () => {
      logger.info('Test message');
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toMatch(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Test message/
      );
    });
  });
});
