import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type { ToolExecutionResult } from '@/types/tools';
import { validateInventionConsistency } from './consistencyCheck.tool';
import { runProjectDiagnostics } from './projectDiagnostics.tool';
import { analyzePatentApplication } from './patentApplication.tool';
import { enhancePatentSection } from './enhancePatentSection.tool';
import { checkPatentConsistency } from './checkPatentConsistency.tool';
import { 
  addClaims, 
  editClaim, 
  deleteClaims, 
  reorderClaims, 
  mirrorClaims,
  getClaims 
} from './claimOperations.tool';
import { proposeClaimRevision } from './proposeClaimRevision.tool';
import { batchProposeRevisions } from './batchProposeRevisions.tool';
import { visualizeClaimDependencies } from './visualizeClaimDependencies.tool';

/**
 * Tool Registry
 * Maps tool names to their implementation functions
 * Each tool must accept projectId and tenantId for security
 */
const toolRegistry = {
  validateInventionConsistency,
  runProjectDiagnostics,
  analyzePatentApplication,
  enhancePatentSection,
  checkPatentConsistency,
  // Claim operations
  addClaims,
  editClaim,
  deleteClaims,
  reorderClaims,
  mirrorClaims,
  getClaims,
  proposeClaimRevision,
  batchProposeRevisions,
  visualizeClaimDependencies,
  // Future tools can be added here:
  // analyzePriorArt,
  // suggestClaimImprovements,
  // detectRedundancy,
} as const;

/**
 * Tool descriptions for the AI assistant
 */
const toolDescriptions: Record<string, string> = {
  validateInventionConsistency: "Check for consistency issues between claims and parsed elements",
  runProjectDiagnostics: "Diagnose why claims or invention data might be missing", 
  analyzePatentApplication: "Load and analyze the full patent application document",
  enhancePatentSection: "Enhance a specific section of the patent document with AI suggestions",
  checkPatentConsistency: "Check patent document for consistency issues and missing sections",
  // Claim operations
  getClaims: "Fetch all claims for the current project - use when user references specific claims",
  addClaims: "Add new claims to the project",
  editClaim: "Edit the text of an existing claim",
  deleteClaims: "Delete one or more claims",
  reorderClaims: "Swap the position of two claims",
  mirrorClaims: "Create mirrored claims in a different format (system, method, apparatus, etc.)",
  proposeClaimRevision: "Generate an AI-powered revision for a specific claim",
  batchProposeRevisions: "Generate AI-powered revisions for multiple claims at once",
  visualizeClaimDependencies: "Create a visual diagram showing claim dependencies",
};

export type ToolName = keyof typeof toolRegistry;

/**
 * Executes a registered tool with proper error handling
 * SECURITY: Always requires tenantId for tenant isolation
 */
export async function executeTool<T = any>(
  toolName: string,
  args: Record<string, any>
): Promise<ToolExecutionResult<T>> {
  logger.debug('[ToolExecutor] Executing tool', { toolName, args });

  try {
    // Validate tool exists
    if (!(toolName in toolRegistry)) {
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
    }

    // Validate required args
    if (!args.projectId || !args.tenantId) {
      return {
        success: false,
        error: 'Missing required parameters: projectId and tenantId',
      };
    }

    // Execute tool based on its signature
    const tool = toolRegistry[toolName as ToolName];
    let result: any;
    
    // Handle tools that need additional parameters
    if (toolName === 'enhancePatentSection') {
      if (!args.sectionName || !args.instruction) {
        logger.error('[ToolExecutor] Missing required args for enhancePatentSection', {
          received: args,
          sectionName: args.sectionName,
          instruction: args.instruction,
        });
        return {
          success: false,
          error: `enhancePatentSection requires sectionName and instruction parameters. Received: ${JSON.stringify({ sectionName: args.sectionName, instruction: args.instruction })}`,
        };
      }
      // Cast to any to handle dynamic parameters
      result = await (tool as any)(
        args.projectId,
        args.tenantId,
        args.sectionName,
        args.instruction
      );
    } else if (toolName === 'addClaims') {
      if (!args.claims || !Array.isArray(args.claims)) {
        return {
          success: false,
          error: 'addClaims requires an array of claims with number and text properties',
        };
      }
      result = await (tool as any)(args.projectId, args.tenantId, args.claims);
    } else if (toolName === 'editClaim') {
      if (!args.claimId || !args.newText) {
        return {
          success: false,
          error: 'editClaim requires claimId and newText parameters',
        };
      }
      result = await (tool as any)(args.projectId, args.tenantId, args.claimId, args.newText);
    } else if (toolName === 'deleteClaims') {
      if (!args.claimIds || !Array.isArray(args.claimIds)) {
        return {
          success: false,
          error: 'deleteClaims requires an array of claimIds',
        };
      }
      result = await (tool as any)(args.projectId, args.tenantId, args.claimIds);
    } else if (toolName === 'reorderClaims') {
      if (!args.claim1Id || !args.claim2Id) {
        return {
          success: false,
          error: 'reorderClaims requires claim1Id and claim2Id parameters',
        };
      }
      result = await (tool as any)(args.projectId, args.tenantId, args.claim1Id, args.claim2Id);
    } else if (toolName === 'mirrorClaims') {
      if (!args.claimIds || !Array.isArray(args.claimIds) || !args.targetType) {
        return {
          success: false,
          error: 'mirrorClaims requires an array of claimIds and a targetType',
        };
      }
      result = await (tool as any)(args.projectId, args.tenantId, args.claimIds, args.targetType);
    } else if (toolName === 'proposeClaimRevision') {
      if (!args.claimId || !args.instruction) {
        return {
          success: false,
          error: 'proposeClaimRevision requires claimId and instruction parameters',
        };
      }
      result = await (tool as any)(args.projectId, args.tenantId, args.claimId, args.instruction);
    } else if (toolName === 'batchProposeRevisions') {
      if (!args.claimIds || !Array.isArray(args.claimIds) || !args.instruction) {
        return {
          success: false,
          error: 'batchProposeRevisions requires an array of claimIds and instruction parameter',
        };
      }
      result = await (tool as any)(args.projectId, args.tenantId, args.claimIds, args.instruction);
    } else {
      // Standard tools that only need projectId and tenantId
      result = await (tool as any)(args.projectId, args.tenantId);
    }

    logger.info('[ToolExecutor] Tool executed successfully', {
      toolName,
      projectId: args.projectId,
    });

    return {
      success: true,
      data: result as T,
    };
  } catch (error) {
    logger.error('[ToolExecutor] Tool execution failed', {
      toolName,
      error,
    });

    if (error instanceof ApplicationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Tool execution failed',
    };
  }
}

/**
 * Get list of available tools
 */
export function getAvailableTools(): Array<{ name: string; description: string }> {
  return Object.keys(toolRegistry).map(name => ({
    name,
    description: toolDescriptions[name] || 'No description available'
  }));
}
