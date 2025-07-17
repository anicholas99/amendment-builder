import { logger } from '@/server/logger';
import { executeTool } from '@/server/tools/toolExecutor';
import { ToolResultProcessor } from './tool-result-processor';
import type {
  ChatToolCall,
  ChatToolChain,
  ToolExecutionResult,
  ClaimRevision,
} from '@/types/tools';
import type { ClaimData } from '@/types/claimTypes';

interface GetClaimsResult {
  message: string;
  claims: ClaimData[];
}

/**
 * Handles execution of tool chains with claim ID mapping
 * Extracted from ChatAgentService for better modularity
 */
export class ToolChainProcessor {
  /**
   * Process a tool chain (multiple tools in sequence)
   */
  static async processToolChain(
    toolChain: ChatToolChain,
    projectId: string,
    tenantId: string
  ): Promise<string> {
    logger.info('[ToolChainProcessor] Processing tool chain', {
      toolCount: toolChain.tools.length,
      tools: toolChain.tools.map(t => t.tool),
    });

    let finalResult: ToolExecutionResult | null = null;
    const allResults: ToolExecutionResult[] = [];

    // Execute tools in sequence
    for (const tool of toolChain.tools) {
      const secureArgs = {
        ...tool.args,
        projectId,
        tenantId,
      };

      logger.info('[ToolChainProcessor] Executing tool in chain', {
        tool: tool.tool,
        isInternal: tool.tool === 'getClaims',
        args: tool.args,
      });

      const toolResult = await executeTool(tool.tool, secureArgs);

      if (!toolResult.success) {
        return `I encountered an error while ${tool.tool === 'getClaims' ? 'retrieving claims' : 'processing your request'}: ${toolResult.error}`;
      }

      allResults.push(toolResult);

      // For getClaims, extract claim IDs for next tool
      if (tool.tool === 'getClaims' && toolResult.data) {
        const getClaimsData = toolResult.data as GetClaimsResult;
        const claims = getClaimsData.claims || [];

        // Make claims available for next tool in chain
        if (toolChain.tools.length > 1) {
          const nextTool = toolChain.tools[toolChain.tools.indexOf(tool) + 1];
          if (nextTool && nextTool.args) {
            // Map claim numbers to IDs
            const mappingResult = this.mapClaimNumbersToIds(nextTool, claims);
            if (typeof mappingResult === 'string') {
              return mappingResult; // Error message
            }
          }
        }
      } else {
        // Last tool or non-getClaims tool
        finalResult = toolResult;
      }
    }

    // Return result from the last meaningful tool (not getClaims)
    if (finalResult && finalResult.data) {
      const lastTool = toolChain.tools[toolChain.tools.length - 1];
      return ToolResultProcessor.processResult(
        lastTool.tool,
        finalResult,
        lastTool.args
      );
    }

    // Special case: If only getClaims was called, show the claims
    if (
      toolChain.tools.length === 1 &&
      toolChain.tools[0].tool === 'getClaims' &&
      allResults[0]?.data
    ) {
      return ToolResultProcessor.processResult('getClaims', allResults[0]);
    }

    return "I've completed the operation but couldn't format the response properly. Please check your claims to verify the changes.";
  }

  /**
   * Process a single tool call
   */
  static async processSingleTool(
    toolCall: ChatToolCall,
    projectId: string,
    tenantId: string
  ): Promise<string> {
    logger.info('[ToolChainProcessor] Processing single tool', {
      tool: toolCall.tool,
      projectId,
      tenantId,
      args: toolCall.args,
    });

    // Map claim numbers to claim IDs if needed
    if (toolCall.args && this.requiresClaimMapping(toolCall)) {
      logger.debug(
        '[ToolChainProcessor] Tool requires claim ID mapping, fetching claims first'
      );

      // Fetch claims to build mapping
      const getClaimsResult = await executeTool('getClaims', {
        projectId,
        tenantId,
      });

      if (!getClaimsResult.success || !getClaimsResult.data) {
        return 'Failed to fetch claims for ID mapping. Please try again.';
      }

      const claimsData = getClaimsResult.data as GetClaimsResult;
      const claims = claimsData.claims;

      // Map claim numbers to IDs
      const mappingResult = this.mapClaimNumbersToIds(toolCall, claims);
      if (typeof mappingResult === 'string') {
        return mappingResult; // Error message
      }
    }

    const secureArgs = {
      ...toolCall.args,
      projectId,
      tenantId,
    };

    logger.debug('[ToolChainProcessor] Executing tool with secure args', {
      tool: toolCall.tool,
      hasProjectId: !!secureArgs.projectId,
      hasTenantId: !!secureArgs.tenantId,
    });

    const toolResult = await executeTool(toolCall.tool, secureArgs);

    logger.info('[ToolChainProcessor] Tool execution completed', {
      tool: toolCall.tool,
      success: toolResult.success,
      hasData: !!toolResult.data,
      error: toolResult.error,
    });

    return ToolResultProcessor.processResult(
      toolCall.tool,
      toolResult,
      toolCall.args
    );
  }

  /**
   * Check if a tool requires claim ID mapping
   */
  private static requiresClaimMapping(toolCall: ChatToolCall): boolean {
    return !!(
      toolCall.args &&
      ('claimNumber' in toolCall.args ||
        'claimNumbers' in toolCall.args ||
        'claim1Number' in toolCall.args ||
        'claim2Number' in toolCall.args)
    );
  }

  /**
   * Map claim numbers to claim IDs in tool arguments
   */
  private static mapClaimNumbersToIds(
    tool: ChatToolCall,
    claims: ClaimData[]
  ): string | void {
    if (!tool.args) return;

    const claimMap = new Map(claims.map(c => [c.number, c.id]));

    // Handle single claim number
    if (
      'claimNumber' in tool.args &&
      typeof tool.args.claimNumber === 'number'
    ) {
      const claimId = claimMap.get(tool.args.claimNumber);
      if (!claimId) {
        return `I couldn't find claim ${tool.args.claimNumber}. Please check the claim number and try again.`;
      }
      tool.args.claimId = claimId;
      delete tool.args.claimNumber;
    }

    // Handle array of claim numbers
    if ('claimNumbers' in tool.args && Array.isArray(tool.args.claimNumbers)) {
      const mappedIds = tool.args.claimNumbers.map((num: number) => ({
        num,
        id: claimMap.get(num),
      }));
      const missingClaims = mappedIds.filter(m => !m.id).map(m => m.num);

      if (missingClaims.length > 0) {
        return `I couldn't find claim${missingClaims.length > 1 ? 's' : ''} ${missingClaims.join(', ')}. Please check the claim numbers and try again.`;
      }

      tool.args.claimIds = mappedIds.map(m => m.id).filter(Boolean);
      delete tool.args.claimNumbers;
    }

    // Handle claim reordering (two claim numbers)
    if ('claim1Number' in tool.args && 'claim2Number' in tool.args) {
      const id1 = claimMap.get(tool.args.claim1Number);
      const id2 = claimMap.get(tool.args.claim2Number);

      if (!id1 || !id2) {
        const missing = [];
        if (!id1) missing.push(tool.args.claim1Number);
        if (!id2) missing.push(tool.args.claim2Number);
        return `I couldn't find claim${missing.length > 1 ? 's' : ''} ${missing.join(' and ')}. Please check the claim numbers and try again.`;
      }

      tool.args.claim1Id = id1;
      tool.args.claim2Id = id2;
      delete tool.args.claim1Number;
      delete tool.args.claim2Number;
    }

    // Handle "all claims" flag
    if ('allClaims' in tool.args && tool.args.allClaims) {
      const allClaimIds = claims.map(c => c.id);
      tool.args.claimIds = allClaimIds;
      delete tool.args.allClaims;
    }
  }
}
