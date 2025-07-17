// Polyfill for setImmediate
if (typeof setImmediate === 'undefined') {
  (global as any).setImmediate = (
    callback: (...args: any[]) => void,
    ...args: any[]
  ) => {
    return setTimeout(callback, 0, ...args);
  };
}

import { ContextManager } from '../context-manager';
import { getInventionContextForChat } from '@/repositories/chatRepository';

// Mock the dependencies
jest.mock('@/repositories/chatRepository');
jest.mock('@/server/tools/toolExecutor', () => ({
  getAvailableTools: () => [
    { name: 'getClaims', description: 'Get all claims for a project' },
    { name: 'editClaim', description: 'Edit an existing claim' },
    { name: 'addClaims', description: 'Add new claims' },
    { name: 'deleteClaims', description: 'Delete claims' },
  ],
}));

describe('ContextManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSystemPrompt', () => {
    it('should include autonomy instructions', () => {
      const prompt = ContextManager.generateSystemPrompt({
        pageContext: 'claim-refinement',
        inventionContext: null,
      });

      expect(prompt).toContain('You have FULL AUTONOMY');
      expect(prompt).toContain('Edit multiple claims in sequence when needed');
      expect(prompt).toContain(
        'understand the intent and take appropriate action'
      );
    });

    it('should include claim conversion examples', () => {
      const prompt = ContextManager.generateSystemPrompt({
        pageContext: 'claim-refinement',
        inventionContext: null,
      });

      expect(prompt).toContain(
        'make claims 1-7 method claims instead of system'
      );
      expect(prompt).toContain('Get claims, then edit EACH claim');
      expect(prompt).toContain('System to Method:');
      expect(prompt).toContain('A system comprising...');
      expect(prompt).toContain('A method comprising...');
    });

    it('should include fix claim example with getClaims first', () => {
      const prompt = ContextManager.generateSystemPrompt({
        pageContext: 'claim-refinement',
        inventionContext: null,
      });

      expect(prompt).toContain('fix claim 2');
      expect(prompt).toContain('getClaims to find claim 2');
      expect(prompt).toContain('editClaim to fix');
      expect(prompt).toContain('multi-step operations');
    });

    it('should include tool definitions with correct args', () => {
      const prompt = ContextManager.generateSystemPrompt({
        pageContext: 'claim-refinement',
        inventionContext: null,
      });

      expect(prompt).toContain('editClaim');
      expect(prompt).toContain('claimId (string), newText (string)');
      expect(prompt).toContain('deleteClaims');
      expect(prompt).toContain('claimIds (array of claim IDs)');
    });

    it('should include page-specific context', () => {
      const technologyPrompt = ContextManager.generateSystemPrompt({
        pageContext: 'technology',
        inventionContext: null,
      });

      expect(technologyPrompt).toContain('Technology Details');
      expect(technologyPrompt).toContain('invention details');

      const claimPrompt = ContextManager.generateSystemPrompt({
        pageContext: 'claim-refinement',
        inventionContext: null,
      });

      expect(claimPrompt).toContain('Claim Refinement');
      expect(claimPrompt).toContain('claim analysis');
    });

    it('should include invention context when provided', () => {
      const mockContext = {
        project: { name: 'Test Project', status: 'DRAFT' },
        invention: {
          title: 'Smart Refrigerator',
          summary: 'A refrigerator with AI',
          advantages: ['Energy efficient', 'Smart inventory'],
          features: ['AI-powered', 'IoT enabled'],
        },
        claims: [
          { number: 1, text: 'A system comprising...' },
          { number: 2, text: 'The system of claim 1...' },
        ],
        savedPriorArt: [],
      };

      const prompt = ContextManager.generateSystemPrompt({
        pageContext: 'claim-refinement',
        inventionContext: mockContext as any,
      });

      expect(prompt).toContain('Smart Refrigerator');
      expect(prompt).toContain('Energy efficient');
      expect(prompt).toContain('Claim 1:');
      expect(prompt).toContain('A system comprising');
    });

    it('should handle last action context', () => {
      const prompt = ContextManager.generateSystemPrompt({
        pageContext: 'claim-refinement',
        inventionContext: null,
        lastAction: {
          type: 'claim-revised',
          claimNumber: 3,
        },
      });

      expect(prompt).toContain('Recent Action Context');
      expect(prompt).toContain('just revised claim 3');
    });
  });

  describe('loadProjectContext', () => {
    it('should return null when projectId or tenantId missing', async () => {
      const result = await ContextManager.loadProjectContext(
        undefined,
        'tenant-123'
      );
      expect(result).toBeNull();

      const result2 = await ContextManager.loadProjectContext(
        'project-123',
        undefined
      );
      expect(result2).toBeNull();
    });

    it('should call repository and return context', async () => {
      const mockContext = { project: { name: 'Test' } };
      (getInventionContextForChat as jest.Mock).mockResolvedValue(mockContext);

      const result = await ContextManager.loadProjectContext(
        'project-123',
        'tenant-123'
      );

      expect(getInventionContextForChat).toHaveBeenCalledWith(
        'project-123',
        'tenant-123'
      );
      expect(result).toEqual(mockContext);
    });

    it('should handle errors gracefully', async () => {
      (getInventionContextForChat as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const result = await ContextManager.loadProjectContext(
        'project-123',
        'tenant-123'
      );

      expect(result).toBeNull();
    });
  });
});
