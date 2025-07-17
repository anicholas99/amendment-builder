/**
 * Tool invocation types for AI chat interface
 * Provides type safety for tool/function calls made by the AI
 */

export type ToolStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ToolParameter {
  name: string;
  value?: unknown;
  type?: string;
}

export interface ToolInvocation {
  id: string;
  toolName: string;
  displayName?: string;
  description?: string;
  status: ToolStatus;
  parameters?: ToolParameter[];
  result?: unknown;
  error?: string;
  startTime: number;
  endTime?: number;
  icon?: string; // Lucide icon name
}

export interface ToolInvocationMessage {
  role: 'tool';
  content: string;
  toolInvocations: ToolInvocation[];
  timestamp: string | Date;
}

// Tool categories for different types of operations
export type ToolCategory =
  | 'search'
  | 'analysis'
  | 'generation'
  | 'data-processing'
  | 'external-api'
  | 'database'
  | 'file-operation';

// Tool definitions for common operations
export interface ToolDefinition {
  name: string;
  displayName: string;
  category: ToolCategory;
  icon: string;
  description: string;
  loadingMessages?: string[];
}

// Predefined tool definitions
export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  'search-prior-art': {
    name: 'search-prior-art',
    displayName: 'Prior Art Search',
    category: 'search',
    icon: 'Search',
    description: 'Searching for relevant prior art',
    loadingMessages: [
      'Searching patent databases...',
      'Analyzing prior art relevance...',
      'Comparing with existing claims...',
    ],
  },
  'analyze-claims': {
    name: 'analyze-claims',
    displayName: 'Claim Analysis',
    category: 'analysis',
    icon: 'FileSearch',
    description: 'Analyzing patent claims',
    loadingMessages: [
      'Parsing claim structure...',
      'Identifying claim elements...',
      'Evaluating claim dependencies...',
    ],
  },
  'generate-description': {
    name: 'generate-description',
    displayName: 'Description Generator',
    category: 'generation',
    icon: 'FileText',
    description: 'Generating detailed description',
    loadingMessages: [
      'Analyzing invention details...',
      'Structuring technical description...',
      'Formatting patent language...',
    ],
  },
  'update-invention': {
    name: 'update-invention',
    displayName: 'Update Invention',
    category: 'database',
    icon: 'Database',
    description: 'Updating invention data',
    loadingMessages: [
      'Validating data...',
      'Updating database...',
      'Confirming changes...',
    ],
  },
  'create-figure': {
    name: 'create-figure',
    displayName: 'Figure Generator',
    category: 'generation',
    icon: 'Image',
    description: 'Creating technical figures',
    loadingMessages: [
      'Analyzing requirements...',
      'Generating figure elements...',
      'Finalizing diagram...',
    ],
  },
  'checkClaimEligibility101': {
    name: 'checkClaimEligibility101',
    displayName: '§101 Eligibility Check',
    category: 'analysis',
    icon: 'Shield',
    description: 'Checking claim eligibility under 35 U.S.C. §101',
    loadingMessages: [
      'Analyzing abstract idea...',
      'Checking for technical improvement...',
      'Evaluating practical application...',
    ],
  },
  'batchCheckClaimEligibility101': {
    name: 'batchCheckClaimEligibility101',
    displayName: 'Batch §101 Eligibility Check',
    category: 'analysis',
    icon: 'ShieldCheck',
    description: 'Checking multiple claims for §101 eligibility',
    loadingMessages: [
      'Loading claims...',
      'Analyzing eligibility...',
      'Generating recommendations...',
    ],
  },
  'addFigureElement': {
    name: 'addFigureElement',
    displayName: 'Add Figure Element',
    category: 'database',
    icon: 'Plus',
    description: 'Adding figure element',
    loadingMessages: [
      'Adding element...',
      'Updating database...',
      'Saving changes...',
    ],
  },
  'calculateFilingFees': {
    name: 'calculateFilingFees',
    displayName: 'Filing Fee Calculator',
    category: 'analysis',
    icon: 'DollarSign',
    description: 'Calculating USPTO filing fees',
    loadingMessages: [
      'Analyzing claims and specification...',
      'Calculating base fees...',
      'Computing excess claim fees...',
      'Generating cost breakdown...',
    ],
  },
  'autoRenumberClaims': {
    name: 'autoRenumberClaims',
    displayName: 'Auto-Renumber Claims',
    category: 'database',
    icon: 'Hash',
    description: 'Renumbering claims sequentially',
    loadingMessages: [
      'Analyzing claim structure...',
      'Updating claim numbers...',
      'Fixing dependency references...',
      'Saving changes...',
    ],
  },
  'check112Support': {
    name: 'check112Support',
    displayName: '§112(b) Support Check',
    category: 'analysis',
    icon: 'CheckCircle',
    description: 'Checking claim support in specification',
    loadingMessages: [
      'Extracting claim terms...',
      'Searching specification...',
      'Analyzing written description...',
      'Identifying unsupported terms...',
    ],
  },
};

// Helper to check if a message contains tool invocations
export function hasToolInvocations(
  message: unknown
): message is ToolInvocationMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'role' in message &&
    (message as { role: unknown }).role === 'tool' &&
    'toolInvocations' in message &&
    Array.isArray((message as { toolInvocations: unknown }).toolInvocations)
  );
}

// Helper to get tool definition
export function getToolDefinition(
  toolName: string
): ToolDefinition | undefined {
  return (
    TOOL_DEFINITIONS[toolName] || {
      name: toolName,
      displayName: toolName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      category: 'external-api',
      icon: 'Tool',
      description: `Executing ${toolName}`,
    }
  );
}
