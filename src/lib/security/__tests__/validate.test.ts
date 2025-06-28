/**
 * Unit tests for security validation utilities
 */
import {
  sanitizeInput,
  validateFileUpload,
  isValidEmail,
  isValidUrl,
  sanitizeFilename,
  validateApiKey,
} from '../validate';

describe('Security Validation Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes script tags', () => {
      const input = 'Hello <script>alert("xss")</script> world';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello  world');
    });

    it('removes javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">link</a>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('javascript:');
    });

    it('preserves safe HTML', () => {
      const input = '<p>Safe <strong>content</strong></p>';
      const result = sanitizeInput(input);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });

    it('handles empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('removes event handlers', () => {
      const input = '<div onclick="alert(1)">content</div>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onclick');
    });
  });

  describe('validateFileUpload', () => {
    it('validates allowed file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      
      expect(validateFileUpload('test.jpg', 1000000, allowedTypes)).toBe(true);
      expect(validateFileUpload('test.png', 1000000, allowedTypes)).toBe(true);
      expect(validateFileUpload('test.pdf', 1000000, allowedTypes)).toBe(true);
    });

    it('rejects disallowed file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png'];
      
      expect(validateFileUpload('test.exe', 1000000, allowedTypes)).toBe(false);
      expect(validateFileUpload('test.js', 1000000, allowedTypes)).toBe(false);
      expect(validateFileUpload('test.php', 1000000, allowedTypes)).toBe(false);
    });

    it('validates file size limits', () => {
      const allowedTypes = ['image/jpeg'];
      const maxSize = 5000000; // 5MB
      
      expect(validateFileUpload('test.jpg', maxSize - 1, allowedTypes, maxSize)).toBe(true);
      expect(validateFileUpload('test.jpg', maxSize, allowedTypes, maxSize)).toBe(true);
      expect(validateFileUpload('test.jpg', maxSize + 1, allowedTypes, maxSize)).toBe(false);
    });

    it('handles missing file extension', () => {
      const allowedTypes = ['image/jpeg'];
      
      expect(validateFileUpload('noextension', 1000000, allowedTypes)).toBe(false);
    });

    it('handles empty filename', () => {
      const allowedTypes = ['image/jpeg'];
      
      expect(validateFileUpload('', 1000000, allowedTypes)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@test-domain.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user..double.dot@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(isValidEmail('a@b.c')).toBe(true); // Minimal valid email
      expect(isValidEmail('user@localhost')).toBe(true); // Local domain
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('validates HTTP and HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://test.org/path?query=1')).toBe(true);
      expect(isValidUrl('https://sub.domain.com:8080/path')).toBe(true);
    });

    it('rejects non-HTTP protocols by default', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('file:///path/to/file')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('allows custom protocols when specified', () => {
      expect(isValidUrl('ftp://example.com', ['ftp'])).toBe(true);
      expect(isValidUrl('custom://protocol', ['custom'])).toBe(true);
    });

    it('rejects malformed URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null as any)).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('removes dangerous characters', () => {
      expect(sanitizeFilename('file<>name.txt')).toBe('filename.txt');
      expect(sanitizeFilename('file|name.txt')).toBe('filename.txt');
      expect(sanitizeFilename('file"name.txt')).toBe('filename.txt');
    });

    it('replaces path separators', () => {
      expect(sanitizeFilename('path/to/file.txt')).toBe('pathtofile.txt');
      expect(sanitizeFilename('path\\to\\file.txt')).toBe('pathtofile.txt');
    });

    it('handles Windows reserved names', () => {
      expect(sanitizeFilename('CON.txt')).toBe('_CON.txt');
      expect(sanitizeFilename('PRN.jpg')).toBe('_PRN.jpg');
      expect(sanitizeFilename('AUX')).toBe('_AUX');
    });

    it('limits filename length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result.endsWith('.txt')).toBe(true);
    });

    it('preserves valid filenames', () => {
      expect(sanitizeFilename('normal-file_name.txt')).toBe('normal-file_name.txt');
      expect(sanitizeFilename('file.2023.backup.zip')).toBe('file.2023.backup.zip');
    });

    it('handles empty or invalid input', () => {
      expect(sanitizeFilename('')).toBe('untitled');
      expect(sanitizeFilename('   ')).toBe('untitled');
      expect(sanitizeFilename(null as any)).toBe('untitled');
    });
  });

  describe('validateApiKey', () => {
    it('validates correct API key format', () => {
      expect(validateApiKey('sk-1234567890abcdef1234567890abcdef')).toBe(true);
      expect(validateApiKey('pk_test_1234567890abcdef')).toBe(true);
      expect(validateApiKey('bearer_' + 'a'.repeat(32))).toBe(true);
    });

    it('rejects invalid API key formats', () => {
      expect(validateApiKey('short')).toBe(false);
      expect(validateApiKey('')).toBe(false);
      expect(validateApiKey('invalid key with spaces')).toBe(false);
      expect(validateApiKey(null as any)).toBe(false);
    });

    it('validates specific prefix requirements', () => {
      expect(validateApiKey('sk-validkey123', 'sk-')).toBe(true);
      expect(validateApiKey('pk-validkey123', 'sk-')).toBe(false);
      expect(validateApiKey('validkey123', 'sk-')).toBe(false);
    });

    it('validates minimum length requirement', () => {
      expect(validateApiKey('sk-12345678', undefined, 10)).toBe(false);
      expect(validateApiKey('sk-1234567890', undefined, 10)).toBe(true);
    });
  });
});