import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type { ToolExecutionResult } from '@/types/tools';
import { ToolAnalyticsService } from '@/server/services/tool-analytics.server-service';
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
  getClaims,
} from './claimOperations.tool';
import {
  updatePatentClaims,
  setPatentClaimsDirectly,
} from './updatePatentClaims.tool';
import { proposeClaimRevision } from './proposeClaimRevision.tool';
import { batchProposeRevisions } from './batchProposeRevisions.tool';
import { visualizeClaimDependencies } from './visualizeClaimDependencies.tool';
import {
  getFigureElements,
  addFigureElement,
  updateFigureElement,
  removeFigureElement,
  createFigureSlot,
} from './figureOperations.tool';
import { updateInventionDetails } from './updateInventionDetails.tool';
import { analyzeAndSuggestFigures } from './analyzeAndSuggestFigures.tool';
import { getDocument } from './getDocument.tool';
import { getDeepAnalysis } from './getDeepAnalysis.tool';
import { getCombinedExaminerAnalysis } from './getCombinedExaminerAnalysis.tool';
import { searchPriorArt } from './searchPriorArt.tool';
import { suggestClaimDependencies } from './suggestClaimDependencies.tool';
import { batchEnhancePatentSections } from './batchEnhancePatentSections.tool';
import { 
  checkClaimEligibility101,
  batchCheckClaimEligibility101 
} from './checkClaimEligibility101.tool';
import { calculateFilingFees } from './calculateFilingFees.tool';
import { autoRenumberClaims } from './autoRenumberClaims.tool';
import { check112Support } from './check112Support.tool';

/**
 * Type definitions for tool signatures
 */
type BaseToolArgs = {
  projectId: string;
  tenantId: string;
};

type ToolFunction<
  TArgs extends BaseToolArgs = BaseToolArgs,
  TResult = unknown,
> = (projectId: string, tenantId: string, ...args: any[]) => Promise<TResult>;

interface ToolSignatures {
  validateInventionConsistency: ToolFunction;
  runProjectDiagnostics: ToolFunction;
  analyzePatentApplication: ToolFunction;
  enhancePatentSection: ToolFunction<
    BaseToolArgs & { sectionName: string; instruction: string }
  >;
  checkPatentConsistency: ToolFunction;
  batchEnhancePatentSections: ToolFunction<
    BaseToolArgs & { sectionNames: string[]; instruction: string }
  >;
  // Claim operations
  addClaims: ToolFunction<
    BaseToolArgs & { claims: Array<{ number: number; text: string }> }
  >;
  editClaim: ToolFunction<BaseToolArgs & { claimId: string; newText: string }>;
  deleteClaims: ToolFunction<BaseToolArgs & { claimIds: string[] }>;
  reorderClaims: ToolFunction<
    BaseToolArgs & { claim1Id: string; claim2Id: string }
  >;
  mirrorClaims: ToolFunction<
    BaseToolArgs & { claimIds: string[]; targetType: string }
  >;
  getClaims: ToolFunction;
  updatePatentClaims: ToolFunction<
    BaseToolArgs,
    {
      success: boolean;
      claimCount: number;
      message: string;
      documentSection: string;
      syncTrigger?: {
        projectId: string;
        sectionType: string;
        timestamp: number;
      };
    }
  >;
  setPatentClaimsDirectly: ToolFunction<
    BaseToolArgs & { claimsText: string },
    { 
      success: boolean; 
      message: string; 
      documentSection: string;
      syncTrigger?: {
        projectId: string;
        sectionType: string;
        timestamp: number;
      };
    }
  >;
  proposeClaimRevision: ToolFunction<
    BaseToolArgs & { claimId: string; instruction: string }
  >;
  batchProposeRevisions: ToolFunction<
    BaseToolArgs & { claimIds: string[]; instruction: string }
  >;
  visualizeClaimDependencies: ToolFunction;
  // Figure operations
  getFigureElements: ToolFunction<BaseToolArgs & { figureKey?: string }>;
  addFigureElement: ToolFunction<
    BaseToolArgs & {
      figureKey: string;
      elementNumber: string;
      description: string;
    }
  >;
  updateFigureElement: ToolFunction<
    BaseToolArgs & {
      figureKey: string;
      elementNumber: string;
      newDescription: string;
    }
  >;
  removeFigureElement: ToolFunction<
    BaseToolArgs & { figureKey: string; elementNumber: string }
  >;
  createFigureSlot: ToolFunction<
    BaseToolArgs & { figureKey: string; title?: string; description?: string }
  >;
  analyzeAndSuggestFigures: ToolFunction;
  // Invention operations
  updateInventionDetails: ToolFunction<
    BaseToolArgs & { additionalDetails: string }
  >;
  // Document operations
  getDocument: ToolFunction<
    BaseToolArgs & { documentId?: string; fileName?: string }
  >;
  // Citation analysis operations
  getDeepAnalysis: ToolFunction<
    BaseToolArgs & { referenceNumber?: string; limit?: number }
  >;
  getCombinedExaminerAnalysis: ToolFunction<
    BaseToolArgs & { analysisId?: string; limit?: number }
  >;
  // Prior art operations
  searchPriorArt: ToolFunction<
    BaseToolArgs & { query: string; limit?: number }
  >;
  // Claim analysis operations
  suggestClaimDependencies: ToolFunction;
  checkClaimEligibility101: ToolFunction<
    BaseToolArgs & { claimText: string }
  >;
  batchCheckClaimEligibility101: ToolFunction<
    BaseToolArgs & { claimIds?: string[] }
  >;
  calculateFilingFees: ToolFunction<
    BaseToolArgs & { entityType?: 'large' | 'small' | 'micro' }
  >;
  autoRenumberClaims: ToolFunction;
  check112Support: ToolFunction<BaseToolArgs & { claimIds?: string[] }>;
}

/**
 * Tool Registry
 * Maps tool names to their implementation functions
 * Each tool must accept projectId and tenantId for security
 */
const toolRegistry: ToolSignatures = {
  validateInventionConsistency,
  runProjectDiagnostics,
  analyzePatentApplication,
  enhancePatentSection,
  checkPatentConsistency,
  batchEnhancePatentSections,
  // Claim operations
  addClaims,
  editClaim,
  deleteClaims,
  reorderClaims,
  mirrorClaims,
  getClaims,
  updatePatentClaims,
  setPatentClaimsDirectly,
  proposeClaimRevision,
  batchProposeRevisions,
  visualizeClaimDependencies,
  // Figure operations
  getFigureElements,
  addFigureElement,
  updateFigureElement,
  removeFigureElement,
  createFigureSlot,
  analyzeAndSuggestFigures,
  // Invention operations
  updateInventionDetails,
  // Document operations
  getDocument,
  // Citation analysis operations
  getDeepAnalysis,
  getCombinedExaminerAnalysis,
  // Prior art operations
  searchPriorArt,
  // Claim analysis operations
  suggestClaimDependencies,
  checkClaimEligibility101,
  batchCheckClaimEligibility101,
  calculateFilingFees,
  autoRenumberClaims,
  check112Support,
  // Future tools can be added here:
  // detectRedundancy,
} as const;

/**
 * Tool descriptions for the AI assistant
 */
const toolDescriptions: Record<string, string> = {
  validateInventionConsistency:
    'Check for consistency issues between claims and invention data',
  runProjectDiagnostics:
    'Diagnose why claims or invention data might be missing',
  analyzePatentApplication:
    'Load and analyze the full patent application document',
  enhancePatentSection:
    'Enhance a specific section of the patent document with AI suggestions',
  checkPatentConsistency:
    'Check patent document for consistency issues and missing sections',
  batchEnhancePatentSections:
    'Enhance multiple patent sections at once - use this when user mentions 2+ sections (e.g. "make field shorter and background longer")',
  // Claim operations
  getClaims:
    'Fetch all claims for the current project - use when user references specific claims',
  addClaims: 'Add new claims to the project',
  editClaim: 'Edit the text of an existing claim',
  deleteClaims: 'Delete one or more claims',
  reorderClaims: 'Swap the position of two claims',
  mirrorClaims:
    'Create mirrored claims in a different format (system, method, apparatus, etc.)',
  updatePatentClaims:
    'Update the CLAIMS section in the patent document from the refinement system',
  setPatentClaimsDirectly:
    'Set the CLAIMS section in the patent document directly',
  proposeClaimRevision: 'Generate an AI-powered revision for a specific claim',
  batchProposeRevisions:
    'Generate AI-powered revisions for multiple claims at once',
  visualizeClaimDependencies:
    'Create a visual diagram showing claim dependencies',
  // Figure operations
  getFigureElements:
    'List reference numerals for all figures or a specific figure',
  addFigureElement: 'Add a reference numeral to a specific figure',
  updateFigureElement:
    'Update the description of a reference numeral in a figure',
  removeFigureElement: 'Remove a reference numeral from a figure',
  createFigureSlot: 'Create a new figure slot with a title and description',
  analyzeAndSuggestFigures:
    'Analyze the invention and suggest appropriate figures with reference numerals',
  // Invention operations
  updateInventionDetails:
    'Update invention details by intelligently merging new information into the appropriate sections',
  // Document operations
  getDocument:
    'Retrieve the full content of a specific document by ID or file name',
  // Citation analysis operations
  getDeepAnalysis:
    'Fetch deep analysis data for citations including element-by-element analysis, rejection rationales, and strategic recommendations',
  getCombinedExaminerAnalysis:
    'Fetch combined examiner analysis showing how multiple references work together to reject claims',
  // Prior art operations
  searchPriorArt:
    'Search for prior art references directly - use when user wants to find patents related to a query',
  // Claim analysis operations
  suggestClaimDependencies:
    'Analyze claims and suggest proper dependency structure - use when user wants help organizing claim dependencies',
  checkClaimEligibility101:
    'Check if a claim is eligible under 35 U.S.C. §101 (patent-eligible subject matter)',
  batchCheckClaimEligibility101:
    'Check multiple claims for eligibility under 35 U.S.C. §101',
  calculateFilingFees:
    'Calculate USPTO filing fees based on claims and specification - shows breakdown and cost-saving recommendations',
  autoRenumberClaims:
    'Automatically renumber claims sequentially and update all dependency references - fixes gaps in claim numbering',
  check112Support:
    'Check if claim terms have proper written description support under 35 U.S.C. §112(b) - identifies unsupported terms',
};

export type ToolName = keyof typeof toolRegistry;

/**
 * Executes a registered tool with proper error handling
 * SECURITY: Always requires tenantId for tenant isolation
 */
export async function executeTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult<T>> {
  logger.debug('[ToolExecutor] Executing tool', { toolName, args });

  const startTime = Date.now();
  let success = false;
  let error: Error | undefined;

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
    let result: unknown;

    // Handle tools that need additional parameters
    if (toolName === 'enhancePatentSection') {
      if (!args.sectionName || !args.instruction) {
        logger.error(
          '[ToolExecutor] Missing required args for enhancePatentSection',
          {
            received: args,
            sectionName: args.sectionName,
            instruction: args.instruction,
          }
        );
        return {
          success: false,
          error: `enhancePatentSection requires sectionName and instruction parameters. Received: ${JSON.stringify({ sectionName: args.sectionName, instruction: args.instruction })}`,
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.sectionName as string,
        args.instruction as string
      );
    } else if (toolName === 'addClaims') {
      if (!args.claims || !Array.isArray(args.claims)) {
        return {
          success: false,
          error:
            'addClaims requires an array of claims with number and text properties',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claims
      );
    } else if (toolName === 'updatePatentClaims') {
      // No additional parameters needed - syncs from database
      result = await tool(args.projectId as string, args.tenantId as string);
    } else if (toolName === 'setPatentClaimsDirectly') {
      if (!args.claimsText || typeof args.claimsText !== 'string') {
        return {
          success: false,
          error: 'setPatentClaimsDirectly requires claimsText as a string',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claimsText as string
      );
    } else if (toolName === 'editClaim') {
      if (!args.claimId || !args.newText) {
        return {
          success: false,
          error: 'editClaim requires claimId and newText parameters',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claimId as string,
        args.newText as string
      );
    } else if (toolName === 'deleteClaims') {
      if (!args.claimIds || !Array.isArray(args.claimIds)) {
        return {
          success: false,
          error: 'deleteClaims requires an array of claimIds',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claimIds
      );
    } else if (toolName === 'reorderClaims') {
      if (!args.claim1Id || !args.claim2Id) {
        return {
          success: false,
          error: 'reorderClaims requires claim1Id and claim2Id parameters',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claim1Id as string,
        args.claim2Id as string
      );
    } else if (toolName === 'mirrorClaims') {
      if (!args.claimIds || !Array.isArray(args.claimIds) || !args.targetType) {
        return {
          success: false,
          error: 'mirrorClaims requires an array of claimIds and a targetType',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claimIds,
        args.targetType as string
      );
    } else if (toolName === 'proposeClaimRevision') {
      // Handle both claimId (direct) and claimNumber (needs mapping) for backward compatibility
      if (args.claimNumber && !args.claimId) {
        return {
          success: false,
          error:
            'proposeClaimRevision with claimNumber requires automatic ID mapping - use ToolChainProcessor instead of direct execution',
        };
      }

      if (!args.claimId || !args.instruction) {
        return {
          success: false,
          error:
            'proposeClaimRevision requires claimId and instruction parameters',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claimId as string,
        args.instruction as string
      );
    } else if (toolName === 'batchProposeRevisions') {
      if (
        !args.claimIds ||
        !Array.isArray(args.claimIds) ||
        !args.instruction
      ) {
        return {
          success: false,
          error:
            'batchProposeRevisions requires an array of claimIds and instruction parameter',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claimIds,
        args.instruction as string
      );
    } else if (toolName === 'getFigureElements') {
      // Optional figureKey parameter
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.figureKey as string | undefined
      );
    } else if (toolName === 'addFigureElement') {
      if (!args.figureKey || !args.elementNumber || !args.description) {
        return {
          success: false,
          error:
            'addFigureElement requires figureKey, elementNumber, and description parameters',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.figureKey as string,
        args.elementNumber as string,
        args.description as string
      );
    } else if (toolName === 'updateFigureElement') {
      if (!args.figureKey || !args.elementNumber || !args.newDescription) {
        return {
          success: false,
          error:
            'updateFigureElement requires figureKey, elementNumber, and newDescription parameters',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.figureKey as string,
        args.elementNumber as string,
        args.newDescription as string
      );
    } else if (toolName === 'removeFigureElement') {
      if (!args.figureKey || !args.elementNumber) {
        return {
          success: false,
          error:
            'removeFigureElement requires figureKey and elementNumber parameters',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.figureKey as string,
        args.elementNumber as string
      );
    } else if (toolName === 'updateInventionDetails') {
      if (!args.additionalDetails) {
        return {
          success: false,
          error: 'updateInventionDetails requires additionalDetails parameter',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.additionalDetails as string
      );
    } else if (toolName === 'createFigureSlot') {
      if (!args.figureKey) {
        return {
          success: false,
          error: 'createFigureSlot requires figureKey parameter',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.figureKey as string,
        args.title as string | undefined,
        args.description as string | undefined
      );
    } else if (toolName === 'analyzeAndSuggestFigures') {
      result = await tool(args.projectId as string, args.tenantId as string);
    } else if (toolName === 'getDocument') {
      // Requires either documentId or fileName
      if (!args.documentId && !args.fileName) {
        return {
          success: false,
          error: 'getDocument requires either documentId or fileName parameter',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.documentId as string | undefined,
        args.fileName as string | undefined
      );
    } else if (toolName === 'getDeepAnalysis') {
      // Both referenceNumber and limit are optional
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.referenceNumber as string | undefined,
        args.limit as number | undefined
      );
    } else if (toolName === 'getCombinedExaminerAnalysis') {
      // Both analysisId and limit are optional
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.analysisId as string | undefined,
        args.limit as number | undefined
      );
    } else if (toolName === 'searchPriorArt') {
      if (!args.query) {
        return {
          success: false,
          error: 'searchPriorArt requires a query parameter',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.query as string,
        args.limit as number | undefined
      );
    } else if (toolName === 'batchEnhancePatentSections') {
      if (
        !args.sectionNames ||
        !Array.isArray(args.sectionNames) ||
        !args.instruction
      ) {
        return {
          success: false,
          error:
            'batchEnhancePatentSections requires an array of sectionNames and instruction parameter',
        };
      }
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.sectionNames,
        args.instruction as string
      );
    } else if (toolName === 'batchCheckClaimEligibility101') {
      // claimIds is optional
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claimIds as string[] | undefined
      );
    } else if (toolName === 'calculateFilingFees') {
      // entityType is optional with default 'large'
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.entityType as 'large' | 'small' | 'micro' | undefined
      );
    } else if (toolName === 'autoRenumberClaims') {
      result = await tool(args.projectId as string, args.tenantId as string);
    } else if (toolName === 'check112Support') {
      // claimIds is optional
      result = await tool(
        args.projectId as string,
        args.tenantId as string,
        args.claimIds as string[] | undefined
      );
    } else {
      // Standard tools that only need projectId and tenantId
      result = await tool(args.projectId as string, args.tenantId as string);
    }

    logger.info('[ToolExecutor] Tool executed successfully', {
      toolName,
      projectId: args.projectId,
    });

    success = true;
    return {
      success: true,
      data: result as T,
    };
  } catch (err) {
    logger.error('[ToolExecutor] Tool execution failed', {
      toolName,
      error: err,
    });

    error = err instanceof Error ? err : new Error(String(err));

    if (err instanceof ApplicationError) {
      return {
        success: false,
        error: err.message,
      };
    }

    return {
      success: false,
      error: 'Tool execution failed',
    };
  } finally {
    // Track tool execution metrics
    void ToolAnalyticsService.trackToolExecution(toolName, startTime, success, {
      projectId: args.projectId as string,
      tenantId: args.tenantId as string,
      error,
      inputSize: JSON.stringify(args).length,
    });
  }
}

/**
 * Get list of available tools
 */
export function getAvailableTools(): Array<{
  name: string;
  description: string;
}> {
  return Object.keys(toolRegistry).map(name => ({
    name,
    description: toolDescriptions[name] || 'No description available',
  }));
}
