import { ClaimRepository } from '../claimRepository';
import { prisma } from '@/lib/prisma';
import { ApplicationError } from '@/lib/error';
import * as claimDependencyUpdater from '@/utils/claimDependencyUpdater';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

// Mock the dependency updater
jest.mock('@/utils/claimDependencyUpdater', () => ({
  createClaimNumberMapping: jest.fn(),
  batchUpdateClaimDependencies: jest.fn(),
  validateClaimDependencies: jest.fn(),
}));

describe('ClaimRepository.deleteWithRenumbering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a claim and renumber subsequent claims with dependency updates', async () => {
    const mockTx = {
      claim: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const claimToDelete = {
      id: 'claim-2',
      number: 2,
      text: 'The system of claim 1, wherein...',
      inventionId: 'inv-123',
      invention: { id: 'inv-123' },
    };

    const remainingClaims = [
      {
        id: 'claim-1',
        number: 1,
        text: 'A system comprising...',
        inventionId: 'inv-123',
      },
      {
        id: 'claim-3',
        number: 3,
        text: 'The system of claim 2, wherein...',
        inventionId: 'inv-123',
      },
      {
        id: 'claim-4',
        number: 4,
        text: 'The system of claim 3, wherein...',
        inventionId: 'inv-123',
      },
    ];

    const renumberedClaims = [
      {
        id: 'claim-1',
        number: 1,
        text: 'A system comprising...',
        inventionId: 'inv-123',
      },
      {
        id: 'claim-3',
        number: 2,
        text: 'The system of claim 2, wherein...',
        inventionId: 'inv-123',
      },
      {
        id: 'claim-4',
        number: 3,
        text: 'The system of claim 3, wherein...',
        inventionId: 'inv-123',
      },
    ];

    const claimsWithUpdatedDeps = [
      {
        id: 'claim-1',
        number: 1,
        text: 'A system comprising...',
        textUpdated: false,
      },
      {
        id: 'claim-3',
        number: 2,
        text: 'The system of claim 1, wherein...',
        textUpdated: true,
      },
      {
        id: 'claim-4',
        number: 3,
        text: 'The system of claim 2, wherein...',
        textUpdated: true,
      },
    ];

    mockTx.claim.findUnique.mockResolvedValueOnce(claimToDelete);
    mockTx.claim.delete.mockResolvedValueOnce(claimToDelete);
    mockTx.claim.findMany
      .mockResolvedValueOnce(remainingClaims) // After deletion
      .mockResolvedValueOnce(renumberedClaims) // After renumbering
      .mockResolvedValueOnce([
        // Final state
        { id: 'claim-1', number: 1, text: 'A system comprising...' },
        { id: 'claim-3', number: 2, text: 'The system of claim 1, wherein...' },
        { id: 'claim-4', number: 3, text: 'The system of claim 2, wherein...' },
      ]);

    mockTx.claim.update.mockImplementation(async ({ where, data }) => {
      const claim = [...remainingClaims, ...renumberedClaims].find(
        c => c.id === where.id
      );
      return { ...claim, ...data };
    });

    (
      claimDependencyUpdater.createClaimNumberMapping as jest.Mock
    ).mockReturnValue({
      '3': 2,
      '4': 3,
    });

    (
      claimDependencyUpdater.batchUpdateClaimDependencies as jest.Mock
    ).mockReturnValue(claimsWithUpdatedDeps);

    (
      claimDependencyUpdater.validateClaimDependencies as jest.Mock
    ).mockReturnValue([]);

    (prisma!.$transaction as jest.Mock).mockImplementation(async callback => {
      return callback(mockTx);
    });

    const result = await ClaimRepository.deleteWithRenumbering(
      'claim-2',
      'user-123'
    );

    expect(result).toEqual({
      deletedClaim: claimToDelete,
      renumberedCount: 2,
      updatedClaims: expect.arrayContaining([
        expect.objectContaining({ number: 1 }),
        expect.objectContaining({ number: 2 }),
        expect.objectContaining({ number: 3 }),
      ]),
    });

    // Verify the claim was deleted
    expect(mockTx.claim.delete).toHaveBeenCalledWith({
      where: { id: 'claim-2' },
    });

    // Verify renumbering happened
    expect(mockTx.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'claim-3' },
        data: expect.objectContaining({ number: expect.any(Number) }),
      })
    );

    // Verify dependencies were updated
    expect(
      claimDependencyUpdater.batchUpdateClaimDependencies
    ).toHaveBeenCalled();

    // Verify validation was performed
    expect(claimDependencyUpdater.validateClaimDependencies).toHaveBeenCalled();
  });

  it('should handle deletion of the last claim without renumbering', async () => {
    const mockTx = {
      claim: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const claimToDelete = {
      id: 'claim-3',
      number: 3,
      text: 'The system of claim 2, wherein...',
      inventionId: 'inv-123',
      invention: { id: 'inv-123' },
    };

    const remainingClaims = [
      { id: 'claim-1', number: 1, text: 'A system comprising...' },
      { id: 'claim-2', number: 2, text: 'The system of claim 1, wherein...' },
    ];

    mockTx.claim.findUnique.mockResolvedValueOnce(claimToDelete);
    mockTx.claim.delete.mockResolvedValueOnce(claimToDelete);
    mockTx.claim.findMany.mockResolvedValueOnce(remainingClaims);

    (prisma!.$transaction as jest.Mock).mockImplementation(async callback => {
      return callback(mockTx);
    });

    const result = await ClaimRepository.deleteWithRenumbering('claim-3');

    expect(result).toEqual({
      deletedClaim: claimToDelete,
      renumberedCount: 0,
      updatedClaims: [],
    });

    // Verify no renumbering operations occurred
    expect(mockTx.claim.update).not.toHaveBeenCalled();
    expect(
      claimDependencyUpdater.batchUpdateClaimDependencies
    ).not.toHaveBeenCalled();
  });

  it('should throw error if claim not found', async () => {
    const mockTx = {
      claim: {
        findUnique: jest.fn().mockResolvedValueOnce(null),
      },
    };

    (prisma!.$transaction as jest.Mock).mockImplementation(async callback => {
      return callback(mockTx);
    });

    await expect(
      ClaimRepository.deleteWithRenumbering('non-existent-claim')
    ).rejects.toThrow(ApplicationError);
  });

  it('should handle dependency validation errors', async () => {
    const mockTx = {
      claim: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const claimToDelete = {
      id: 'claim-2',
      number: 2,
      text: 'A method comprising...',
      inventionId: 'inv-123',
      invention: { id: 'inv-123' },
    };

    mockTx.claim.findUnique.mockResolvedValueOnce(claimToDelete);
    mockTx.claim.findMany.mockResolvedValue([
      { id: 'claim-1', number: 1, text: 'A system of claim 3...' }, // Invalid forward reference
    ]);

    (
      claimDependencyUpdater.validateClaimDependencies as jest.Mock
    ).mockReturnValue(['Claim 1 has forward reference to claim 3']);

    (prisma!.$transaction as jest.Mock).mockImplementation(async callback => {
      return callback(mockTx);
    });

    await expect(
      ClaimRepository.deleteWithRenumbering('claim-2')
    ).rejects.toThrow('Claim dependency validation failed');
  });
});
