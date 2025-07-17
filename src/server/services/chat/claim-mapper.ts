/**
 * Claim Mapper - Handles claim number to ID mapping
 *
 * This module manages the translation between claim numbers
 * (used by the AI) and claim IDs (used by the database)
 */

import { executeTool } from '@/server/tools/toolExecutor';
import { logger } from '@/server/logger';
import { ToolRegistry } from './tool-registry';

export interface ClaimMapResult {
  success: boolean;
  mappedArgs?: any;
  error?: string;
}

export class ClaimMapper {
  /**
   * Map claim numbers to IDs in tool arguments
   */
  static async mapClaimArguments(
    toolName: string,
    args: any,
    projectId: string,
    tenantId: string
  ): Promise<ClaimMapResult> {
    // Check if this tool requires claim ID mapping
    if (!ToolRegistry.requiresClaimMapping(args)) {
      return { success: true, mappedArgs: args };
    }

    logger.info(
      '[ClaimMapper] Tool requires claim ID mapping, fetching claims',
      {
        toolName,
        args,
      }
    );

    // Fetch claims to build mapping
    const getClaimsResult = await executeTool('getClaims', {
      projectId,
      tenantId,
    });

    if (!getClaimsResult.success || !getClaimsResult.data) {
      return {
        success: false,
        error: 'Failed to fetch claims for ID mapping. Please try again.',
      };
    }

    const claimsData = getClaimsResult.data as {
      claims: Array<{ id: string; number: number }>;
    };
    const claims = claimsData.claims || [];
    const claimMap = new Map(claims.map(c => [c.number, c.id]));

    // Create a copy of args for mapping
    const mappedArgs = { ...args };

    // Map single claim number
    if ('claimNumber' in args && typeof args.claimNumber === 'number') {
      const claimId = claimMap.get(args.claimNumber);
      if (!claimId) {
        return {
          success: false,
          error: `I couldn't find claim ${args.claimNumber}. Please check the claim number and try again.`,
        };
      }
      mappedArgs.claimId = claimId;
      delete mappedArgs.claimNumber;
    }

    // Handle array of claim numbers
    if ('claimNumbers' in args && Array.isArray(args.claimNumbers)) {
      const mappedIds = args.claimNumbers.map((num: number) => ({
        num,
        id: claimMap.get(num),
      }));
      const missingClaims = mappedIds
        .filter((m: { num: number; id: string | undefined }) => !m.id)
        .map((m: { num: number }) => m.num);

      if (missingClaims.length > 0) {
        return {
          success: false,
          error: `I couldn't find claim${missingClaims.length > 1 ? 's' : ''} ${missingClaims.join(', ')}. Please check the claim numbers and try again.`,
        };
      }

      mappedArgs.claimIds = mappedIds
        .map((m: { id: string | undefined }) => m.id)
        .filter(Boolean);
      delete mappedArgs.claimNumbers;
    }

    // Handle claim reordering (two claim numbers)
    if ('claim1Number' in args && 'claim2Number' in args) {
      const id1 = claimMap.get(args.claim1Number);
      const id2 = claimMap.get(args.claim2Number);

      if (!id1 || !id2) {
        const missing = [];
        if (!id1) missing.push(args.claim1Number);
        if (!id2) missing.push(args.claim2Number);
        return {
          success: false,
          error: `I couldn't find claim${missing.length > 1 ? 's' : ''} ${missing.join(' and ')}. Please check the claim numbers and try again.`,
        };
      }

      mappedArgs.claim1Id = id1;
      mappedArgs.claim2Id = id2;
      delete mappedArgs.claim1Number;
      delete mappedArgs.claim2Number;
    }

    logger.info('[ClaimMapper] Successfully mapped claim arguments', {
      originalArgs: args,
      mappedArgs,
    });

    return { success: true, mappedArgs };
  }

  /**
   * Get a human-readable error message for missing claims
   */
  static getMissingClaimsError(claimNumbers: number[]): string {
    if (claimNumbers.length === 0) {
      return 'No claims found.';
    }
    if (claimNumbers.length === 1) {
      return `I couldn't find claim ${claimNumbers[0]}.`;
    }
    return `I couldn't find claims ${claimNumbers.join(', ')}.`;
  }
}
