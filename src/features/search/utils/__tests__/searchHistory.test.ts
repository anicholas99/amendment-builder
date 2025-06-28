/**
 * Tests for Search History Data Transformation
 */
import {
  normalizeSearchResult,
  normalizeSearchResults,
} from '../searchHistory';

describe('Search History Normalization', () => {
  describe('normalizeSearchResult', () => {
    it('should add number field when only patentNumber exists', () => {
      const input = {
        patentNumber: 'US12345678',
        title: 'Test Patent',
        relevance: 0.85,
        source: 'GooglePatents' as const,
      };

      const result = normalizeSearchResult(input);

      expect(result.number).toBe('US12345678');
      expect(result.patentNumber).toBe('US12345678');
      expect(result.title).toBe('Test Patent');
      expect(result.relevance).toBe(0.85);
    });

    it('should add patentNumber field when only number exists', () => {
      const input = {
        number: 'US87654321',
        title: 'Another Patent',
        relevance: 0.72,
        source: 'GooglePatents' as const,
      };

      const result = normalizeSearchResult(input);

      expect(result.number).toBe('US87654321');
      expect(result.patentNumber).toBe('US87654321');
      expect(result.title).toBe('Another Patent');
      expect(result.relevance).toBe(0.72);
    });

    it('should preserve both fields when both exist', () => {
      const input = {
        number: 'US11111111',
        patentNumber: 'US11111111',
        title: 'Dual Field Patent',
        relevance: 0.95,
        source: 'GooglePatents' as const,
      };

      const result = normalizeSearchResult(input);

      expect(result.number).toBe('US11111111');
      expect(result.patentNumber).toBe('US11111111');
    });

    it('should handle missing fields gracefully', () => {
      const input = {
        abstract: 'Some abstract text',
      };

      const result = normalizeSearchResult(input);

      expect(result.number).toBe('');
      expect(result.patentNumber).toBe('');
      expect(result.title).toBe('');
      expect(result.source).toBe('GooglePatents');
      expect(result.relevance).toBe(0);
    });
  });

  describe('normalizeSearchResults', () => {
    it('should normalize an array of results', () => {
      const input = [
        { patentNumber: 'US111', title: 'Patent 1' },
        { number: 'US222', title: 'Patent 2' },
        { number: 'US333', patentNumber: 'US333', title: 'Patent 3' },
      ];

      const results = normalizeSearchResults(input);

      expect(results).toHaveLength(3);
      expect(results[0].number).toBe('US111');
      expect(results[0].patentNumber).toBe('US111');
      expect(results[1].number).toBe('US222');
      expect(results[1].patentNumber).toBe('US222');
      expect(results[2].number).toBe('US333');
      expect(results[2].patentNumber).toBe('US333');
    });

    it('should return empty array for non-array input', () => {
      expect(normalizeSearchResults(null as any)).toEqual([]);
      expect(normalizeSearchResults(undefined as any)).toEqual([]);
      expect(normalizeSearchResults('string' as any)).toEqual([]);
      expect(normalizeSearchResults({} as any)).toEqual([]);
    });
  });
});
