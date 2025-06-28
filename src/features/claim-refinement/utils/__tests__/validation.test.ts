import { validateClaimText, sortClaimNumbers } from '../validation';

describe('Claim Validation Utils', () => {
  describe('validateClaimText', () => {
    it('validates a valid independent claim', () => {
      const result = validateClaimText(
        'A device comprising: a processor; and a memory.'
      );
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('validates a valid dependent claim', () => {
      const result = validateClaimText(
        'The device of claim 1, further comprising a display.'
      );
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('rejects empty claim text', () => {
      const result = validateClaimText('');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Claim text cannot be empty');
    });

    // Skipped: Punctuation check was disabled per user request
    // The validation logic no longer enforces ending punctuation
    it.skip('rejects claim text without proper punctuation', () => {
      const result = validateClaimText('A device with a processor and memory');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Claim should end with a period');
    });

    it('validates claim with multiple elements', () => {
      const result = validateClaimText(
        'A system comprising: a first component; a second component; and a third component.'
      );
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('validates claim with nested elements', () => {
      const result = validateClaimText(
        'A device comprising: a processor configured to: execute instructions; and process data; and a memory connected to the processor.'
      );
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('sortClaimNumbers', () => {
    it('sorts claim numbers numerically', () => {
      const claims = ['2', '10', '1', '5'];
      const sorted = sortClaimNumbers(claims);
      expect(sorted).toEqual(['1', '2', '5', '10']);
    });

    it('handles empty array', () => {
      const claims: string[] = [];
      const sorted = sortClaimNumbers(claims);
      expect(sorted).toEqual([]);
    });

    it('handles single claim', () => {
      const claims = ['1'];
      const sorted = sortClaimNumbers(claims);
      expect(sorted).toEqual(['1']);
    });

    it('handles claims with same number', () => {
      const claims = ['1', '1', '2'];
      const sorted = sortClaimNumbers(claims);
      expect(sorted).toEqual(['1', '1', '2']);
    });
  });
});
