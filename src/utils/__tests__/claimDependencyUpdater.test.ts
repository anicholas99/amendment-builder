import {
  updateClaimDependencies,
  createClaimNumberMapping,
  validateClaimDependencies,
  batchUpdateClaimDependencies,
  detectSelfReference,
  fixSelfReference,
} from '../claimDependencyUpdater';

describe('claimDependencyUpdater', () => {
  describe('updateClaimDependencies', () => {
    it('should update simple claim references', () => {
      const claimText = 'The system of claim 2, wherein...';
      const mapping = { '2': 3 };

      const result = updateClaimDependencies(claimText, mapping);

      expect(result).toBe('The system of claim 3, wherein...');
    });

    it('should handle multiple claim references', () => {
      const claimText =
        'The method of claim 2, combining features of claims 3 and 4';
      const mapping = { '2': 3, '3': 4, '4': 5 };

      const result = updateClaimDependencies(claimText, mapping);

      expect(result).toBe(
        'The method of claim 3, combining features of claims 4 and 5'
      );
    });

    it('should handle range references', () => {
      const claimText = 'The system of any of claims 2-4, wherein...';
      const mapping = { '2': 3, '3': 4, '4': 5 };

      const result = updateClaimDependencies(claimText, mapping);

      expect(result).toBe('The system of any of claims 3-5, wherein...');
    });

    it('should preserve case variations', () => {
      const claimText = 'The system of Claim 2, wherein...';
      const mapping = { '2': 3 };

      const result = updateClaimDependencies(claimText, mapping);

      expect(result).toBe('The system of Claim 3, wherein...');
    });

    it('should not update unmapped claim numbers', () => {
      const claimText = 'The system of claim 2, wherein...';
      const mapping = { '3': 4 }; // 2 is not in mapping

      const result = updateClaimDependencies(claimText, mapping);

      expect(result).toBe('The system of claim 2, wherein...');
    });

    it('should handle complex patterns', () => {
      const claimText =
        'The method of claim 1, wherein the system of claims 2, 3, and 4 operates...';
      const mapping = { '1': 2, '2': 3, '3': 4, '4': 5 };

      const result = updateClaimDependencies(claimText, mapping);

      expect(result).toBe(
        'The method of claim 2, wherein the system of claims 3, 4, and 5 operates...'
      );
    });
  });

  describe('createClaimNumberMapping', () => {
    it('should create correct mapping from updates', () => {
      const updates = [
        { claimId: 'id1', oldNumber: 2, newNumber: 3 },
        { claimId: 'id2', oldNumber: 3, newNumber: 4 },
      ];

      const mapping = createClaimNumberMapping(updates);

      expect(mapping).toEqual({
        '2': 3,
        '3': 4,
      });
    });
  });

  describe('validateClaimDependencies', () => {
    it('should detect non-existent claim references', () => {
      const claims = [
        { number: 1, text: 'A system comprising...' },
        { number: 2, text: 'The system of claim 3, wherein...' }, // claim 3 doesn't exist
      ];

      const errors = validateClaimDependencies(claims);

      expect(errors).toContain('Claim 2 references non-existent claim 3');
    });

    it('should detect forward references', () => {
      const claims = [
        { number: 1, text: 'The system of claim 2, wherein...' }, // forward reference
        { number: 2, text: 'A system comprising...' },
      ];

      const errors = validateClaimDependencies(claims);

      expect(errors).toContain('Claim 1 has forward reference to claim 2');
    });

    it('should pass valid claim set', () => {
      const claims = [
        { number: 1, text: 'A system comprising...' },
        { number: 2, text: 'The system of claim 1, wherein...' },
        { number: 3, text: 'The system of claim 2, wherein...' },
      ];

      const errors = validateClaimDependencies(claims);

      expect(errors).toHaveLength(0);
    });
  });

  describe('batchUpdateClaimDependencies', () => {
    it('should update multiple claims', () => {
      const claims = [
        { id: 'id1', number: 1, text: 'A system comprising...' },
        { id: 'id2', number: 3, text: 'The system of claim 2, wherein...' },
        { id: 'id3', number: 4, text: 'The system of claim 3, wherein...' },
      ];
      const mapping = { '2': 3, '3': 4 };

      const result = batchUpdateClaimDependencies(claims, mapping);

      expect(result[0].textUpdated).toBe(false);
      expect(result[1].text).toBe('The system of claim 3, wherein...');
      expect(result[1].textUpdated).toBe(true);
      expect(result[2].text).toBe('The system of claim 4, wherein...');
      expect(result[2].textUpdated).toBe(true);
    });

    it('should handle real-world claim insertion scenario', () => {
      // Initial state: claims 1, 2, 3 where 3 depends on 2
      const claims = [
        { id: 'id1', number: 1, text: 'A system comprising a processor...' },
        {
          id: 'id2',
          number: 2,
          text: 'The system of claim 1, wherein the processor...',
        },
        {
          id: 'id3',
          number: 3,
          text: 'The system of claim 2, wherein the memory...',
        },
      ];

      // Inserting a new claim after claim 1 causes renumbering:
      // Old claim 2 -> new claim 3
      // Old claim 3 -> new claim 4
      const mapping = { '2': 3, '3': 4 };

      const result = batchUpdateClaimDependencies(claims, mapping);

      // Claim 1 should remain unchanged
      expect(result[0].textUpdated).toBe(false);
      expect(result[0].text).toBe('A system comprising a processor...');

      // Old claim 2 (now 3) should remain unchanged (no dependencies)
      expect(result[1].textUpdated).toBe(false);
      expect(result[1].text).toBe(
        'The system of claim 1, wherein the processor...'
      );

      // Old claim 3 (now 4) should have its dependency updated from 2 to 3
      expect(result[2].textUpdated).toBe(true);
      expect(result[2].text).toBe(
        'The system of claim 3, wherein the memory...'
      );
    });
  });

  describe('detectSelfReference', () => {
    it('should detect self-references', () => {
      const result = detectSelfReference(
        2,
        'The system of claim 2, wherein...'
      );

      expect(result.hasSelfReference).toBe(true);
      expect(result.matches).toContain('claim 2');
    });

    it('should detect multiple self-references', () => {
      const result = detectSelfReference(
        3,
        'The method of claim 3, as described in Claim 3'
      );

      expect(result.hasSelfReference).toBe(true);
      expect(result.matches).toHaveLength(2);
      expect(result.matches).toContain('claim 3');
      expect(result.matches).toContain('Claim 3');
    });

    it('should not detect references to other claims', () => {
      const result = detectSelfReference(
        3,
        'The system of claim 2, wherein...'
      );

      expect(result.hasSelfReference).toBe(false);
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('fixSelfReference', () => {
    it('should replace self-reference with "this claim"', () => {
      const result = fixSelfReference(2, 'The system of claim 2, wherein...');

      expect(result).toBe('The system of this claim, wherein...');
    });

    it('should preserve case when replacing', () => {
      const result = fixSelfReference(3, 'The method of Claim 3, wherein...');

      expect(result).toBe('The method of This claim, wherein...');
    });

    it('should not change references to other claims', () => {
      const text = 'The system of claim 2, wherein...';
      const result = fixSelfReference(3, text);

      expect(result).toBe(text);
    });

    it('should handle multiple self-references', () => {
      const result = fixSelfReference(
        2,
        'The device of claim 2, as shown in claim 2'
      );

      expect(result).toBe('The device of this claim, as shown in this claim');
    });
  });
});
