/**
 * Tool Registry - Centralized tool parameter definitions and metadata
 *
 * This module manages:
 * - Tool parameter schemas
 * - Tool complexity classifications
 * - Tool metadata and configurations
 */

export interface ToolParameterSchema {
  type: 'object';
  properties: Record<string, any>;
  required: string[];
}

export class ToolRegistry {
  /**
   * Tool complexity mapping for model selection
   */
  static readonly TOOL_COMPLEXITY = {
    // Simple tools - can use cheaper models
    simple: [
      'getClaims',
      'getFigureElements',
      'getDocument',
      'deleteClaims',
      'updatePatentClaims',
    ],
    // Medium complexity - need good reasoning
    medium: [
      'editClaim',
      'addClaims',
      'reorderClaims',
      'addFigureElement',
      'setPatentClaimsDirectly',
    ],
    // Complex tools - need best model
    complex: [
      'proposeClaimRevision',
      'batchProposeRevisions',
      'mirrorClaims',
      'enhancePatentSection',
      'batchEnhancePatentSections',
      'updateInventionDetails',
      'analyzeAndSuggestFigures',
      'checkClaimEligibility101',
      'batchCheckClaimEligibility101',
    ],
  };

  /**
   * Get parameter schema for a specific tool
   */
  static getToolParameters(toolName: string): ToolParameterSchema {
    const parameterDefinitions: Record<string, ToolParameterSchema> = {
      // Consistency & Diagnostics Tools
      validateInventionConsistency: {
        type: 'object',
        properties: {},
        required: [],
      },
      runProjectDiagnostics: {
        type: 'object',
        properties: {},
        required: [],
      },
      analyzePatentApplication: {
        type: 'object',
        properties: {},
        required: [],
      },
      checkPatentConsistency: {
        type: 'object',
        properties: {},
        required: [],
      },

      // Patent Enhancement Tools
      enhancePatentSection: {
        type: 'object',
        properties: {
          sectionName: {
            type: 'string',
            description: 'Name of the patent section to enhance',
            enum: [
              'title',
              'field',
              'abstract',
              'background',
              'summary',
              'detailed_description',
              'brief_description_of_drawings',
            ],
          },
          instruction: {
            type: 'string',
            description: 'Specific instruction for how to enhance the section',
          },
        },
        required: ['sectionName', 'instruction'],
      },
      batchEnhancePatentSections: {
        type: 'object',
        properties: {
          sectionNames: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'title',
                'abstract',
                'background',
                'summary',
                'detailed_description',
                'brief_description_of_drawings',
                'field',
              ],
            },
            description: 'Array of patent section names to enhance',
          },
          instruction: {
            type: 'string',
            description: 'Instruction to apply to all sections',
          },
        },
        required: ['sectionNames', 'instruction'],
      },

      // Claim Read Operations
      getClaims: {
        type: 'object',
        properties: {},
        required: [],
      },
      visualizeClaimDependencies: {
        type: 'object',
        properties: {},
        required: [],
      },

      // Claim Modification Operations
      editClaim: {
        type: 'object',
        properties: {
          claimId: {
            type: 'string',
            description: 'ID of the claim to edit (not the claim number)',
          },
          newText: {
            type: 'string',
            description: 'The new text for the claim',
          },
        },
        required: ['claimId', 'newText'],
      },
      addClaims: {
        type: 'object',
        properties: {
          claims: {
            type: 'array',
            description: 'Array of claims to add',
            items: {
              type: 'object',
              properties: {
                number: {
                  type: 'number',
                  description: 'Claim number (e.g., 1, 2, 3)',
                },
                text: {
                  type: 'string',
                  description: 'Full text of the claim',
                },
              },
              required: ['number', 'text'],
            },
          },
        },
        required: ['claims'],
      },
      deleteClaims: {
        type: 'object',
        properties: {
          claimIds: {
            type: 'array',
            description: 'Array of claim IDs to delete',
            items: { type: 'string' },
          },
        },
        required: ['claimIds'],
      },
      reorderClaims: {
        type: 'object',
        properties: {
          claim1Id: {
            type: 'string',
            description: 'ID of the first claim to swap',
          },
          claim2Id: {
            type: 'string',
            description: 'ID of the second claim to swap',
          },
        },
        required: ['claim1Id', 'claim2Id'],
      },
      mirrorClaims: {
        type: 'object',
        properties: {
          claimIds: {
            type: 'array',
            description: 'Array of claim IDs to mirror',
            items: { type: 'string' },
          },
          targetType: {
            type: 'string',
            description: 'Target claim type to convert to',
            enum: [
              'method',
              'system',
              'apparatus',
              'process',
              'computer-readable medium',
              'crm',
            ],
          },
        },
        required: ['claimIds', 'targetType'],
      },

      // Claim AI Revision Tools
      proposeClaimRevision: {
        type: 'object',
        properties: {
          claimNumber: {
            type: 'number',
            description: 'Number of the claim to revise (e.g., 1, 2, 3)',
          },
          instruction: {
            type: 'string',
            description:
              'Specific revision instruction (e.g., "make broader", "add more detail")',
          },
        },
        required: ['claimNumber', 'instruction'],
      },
      batchProposeRevisions: {
        type: 'object',
        properties: {
          claimIds: {
            type: 'array',
            description: 'Array of claim IDs to revise',
            items: { type: 'string' },
          },
          instruction: {
            type: 'string',
            description: 'Revision instruction to apply to all claims',
          },
        },
        required: ['claimIds', 'instruction'],
      },

      // Figure Operations
      getFigureElements: {
        type: 'object',
        properties: {
          figureKey: {
            type: 'string',
            description:
              'Optional: specific figure key (e.g., "figure_1"). If not provided, returns all figures.',
          },
        },
        required: [],
      },
      addFigureElement: {
        type: 'object',
        properties: {
          figureKey: {
            type: 'string',
            description: 'Figure key (e.g., "figure_1")',
          },
          elementNumber: {
            type: 'string',
            description: 'Reference numeral (e.g., "100", "102")',
          },
          description: {
            type: 'string',
            description: 'Description of what the numeral represents',
          },
        },
        required: ['figureKey', 'elementNumber', 'description'],
      },
      updateFigureElement: {
        type: 'object',
        properties: {
          figureKey: {
            type: 'string',
            description: 'Figure key (e.g., "figure_1")',
          },
          elementNumber: {
            type: 'string',
            description: 'Reference numeral to update',
          },
          newDescription: {
            type: 'string',
            description: 'New description for the numeral',
          },
        },
        required: ['figureKey', 'elementNumber', 'newDescription'],
      },
      removeFigureElement: {
        type: 'object',
        properties: {
          figureKey: {
            type: 'string',
            description: 'Figure key (e.g., "figure_1")',
          },
          elementNumber: {
            type: 'string',
            description: 'Reference numeral to remove',
          },
        },
        required: ['figureKey', 'elementNumber'],
      },
      createFigureSlot: {
        type: 'object',
        properties: {
          figureKey: {
            type: 'string',
            description: 'Figure key (e.g., "FIG. 1", "FIG. 2A")',
          },
          title: {
            type: 'string',
            description: 'Title for the figure',
          },
          description: {
            type: 'string',
            description: 'Description of what the figure will show',
          },
        },
        required: ['figureKey'],
      },
      analyzeAndSuggestFigures: {
        type: 'object',
        properties: {},
        required: [],
      },

      // Invention Operations
      updateInventionDetails: {
        type: 'object',
        properties: {
          additionalDetails: {
            type: 'string',
            description:
              'Additional invention details to intelligently merge into existing sections',
          },
        },
        required: ['additionalDetails'],
      },

      // Citation Analysis Operations
      getDeepAnalysis: {
        type: 'object',
        properties: {
          referenceNumber: {
            type: 'string',
            description:
              'Optional: specific patent reference number (e.g., "US11234567B2"). If not provided, returns recent analyses.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of analyses to return (default: 10)',
          },
        },
        required: [],
      },
      getCombinedExaminerAnalysis: {
        type: 'object',
        properties: {
          analysisId: {
            type: 'string',
            description:
              'Optional: specific analysis ID. If not provided, returns recent analyses.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of analyses to return (default: 5)',
          },
        },
        required: [],
      },
      updatePatentClaims: {
        type: 'object',
        properties: {},
        required: [],
      },
      setPatentClaimsDirectly: {
        type: 'object',
        properties: {
          claimsText: {
            type: 'string',
            description:
              'The complete claims text to set in the patent document CLAIMS section',
          },
        },
        required: ['claimsText'],
      },
      checkClaimEligibility101: {
        type: 'object',
        properties: {
          claimText: {
            type: 'string',
            description: 'The claim text to analyze for §101 eligibility',
            minLength: 10,
          },
        },
        required: ['claimText'],
      },
      batchCheckClaimEligibility101: {
        type: 'object',
        properties: {
          claimIds: {
            type: 'array',
            description: 'Array of claim IDs to check (optional, checks all claims if not provided)',
            items: { type: 'string' },
          },
        },
        required: [],
      },
    };

    return (
      parameterDefinitions[toolName] || {
        type: 'object',
        properties: {},
        required: [],
      }
    );
  }

  /**
   * Get complexity level for a tool
   */
  static getToolComplexity(toolName: string): 'simple' | 'medium' | 'complex' {
    if (this.TOOL_COMPLEXITY.simple.includes(toolName)) return 'simple';
    if (this.TOOL_COMPLEXITY.medium.includes(toolName)) return 'medium';
    if (this.TOOL_COMPLEXITY.complex.includes(toolName)) return 'complex';
    return 'medium'; // default
  }

  /**
   * Check if a tool requires claim ID mapping
   */
  static requiresClaimMapping(args: any): boolean {
    return (
      args &&
      ('claimNumber' in args ||
        'claimNumbers' in args ||
        'claim1Number' in args ||
        'claim2Number' in args)
    );
  }
}
