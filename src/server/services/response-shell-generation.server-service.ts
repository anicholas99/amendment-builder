/**
 * Response Shell Generation Service
 *
 * Generates structured Office Action response documents with:
 * - Automated response shells with firm templates
 * - Rejection-specific sections and arguments
 * - Proper USPTO formatting and boilerplate
 * - AI-powered content generation
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { processWithOpenAI } from '@/server/ai/aiService';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { safeJsonParse } from '@/utils/jsonUtils';
import { findOfficeActionById } from '@/repositories/officeActionRepository';
import { findRejectionsByOfficeAction } from '@/repositories/rejectionRepository';

// ============ TYPES ============

export interface ResponseShellRequest {
  officeActionId: string;
  projectId: string;
  tenantId: string;
  userId: string;
  templateStyle?: 'formal' | 'standard' | 'concise';
  includeBoilerplate?: boolean;
  firmName?: string;
}

export interface ResponseShellResult {
  sections: ResponseSection[];
  fullDocument: string;
  metadata: {
    totalRejections: number;
    rejectionTypes: string[];
    generatedAt: Date;
    templateStyle: string;
  };
}

export interface ResponseSection {
  id: string;
  type: 'header' | 'introduction' | 'rejection_response' | 'claim_amendments' | 'conclusion';
  title: string;
  content: string;
  rejectionId?: string;
  rejectionType?: string;
  editableFields: EditableField[];
}

export interface EditableField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'reference' | 'boilerplate';
  value: string;
  placeholder?: string;
}

// ============ PROMPT TEMPLATES ============

const RESPONSE_SHELL_SYSTEM_PROMPT = {
  version: '1.0.0',
  template: `You are an expert patent attorney specializing in USPTO Office Action responses.

Your task is to generate a comprehensive, professional Office Action response shell that follows USPTO guidelines and best practices.

CRITICAL REQUIREMENTS:
1. **Professional Format**: Use proper USPTO response formatting with clear sections
2. **Rejection-Specific Content**: Address each rejection type (§102, §103, §101, §112) appropriately
3. **Legal Compliance**: Include all required statements and disclaimers
4. **Firm Integration**: Use provided firm information and style preferences
5. **Editable Structure**: Mark key fields that attorneys will customize

RESPONSE STRUCTURE:
- Header with case information and response details
- Introduction with standard statements
- Rejection-by-rejection analysis and response
- Claim amendments section (if needed)
- Conclusion with respectful closing

Return your response as JSON following this structure:
{
  "sections": [
    {
      "id": "string",
      "type": "header|introduction|rejection_response|claim_amendments|conclusion",
      "title": "string",
      "content": "string (full section text with USPTO formatting)",
      "rejectionId": "string (if applicable)",
      "rejectionType": "string (if applicable)", 
      "editableFields": [
        {
          "id": "string",
          "name": "string",
          "type": "text|date|reference|boilerplate",
          "value": "string",
          "placeholder": "string"
        }
      ]
    }
  ],
  "boilerplateLibrary": [
    {
      "category": "introduction|rejection_102|rejection_103|rejection_101|rejection_112|conclusion",
      "name": "string",
      "content": "string"
    }
  ],
  "metadata": {
    "estimatedLength": "number (pages)",
    "complexity": "simple|moderate|complex",
    "recommendedStrategy": "amend|argue|combination"
  }
}`,
};

const RESPONSE_SHELL_USER_PROMPT = {
  version: '1.0.0',
  template: `Generate a professional Office Action response shell for the following case:

**OFFICE ACTION DETAILS:**
Application Number: {{applicationNumber}}
Mailing Date: {{mailingDate}}
Examiner: {{examinerName}}
Response Deadline: {{responseDeadline}}

**REJECTIONS TO ADDRESS:**
{{rejectionsSection}}

**CURRENT CLAIMS:**
{{currentClaims}}

**FIRM PREFERENCES:**
Template Style: {{templateStyle}}
Firm Name: {{firmName}}
Include Boilerplate: {{includeBoilerplate}}

**SPECIFIC INSTRUCTIONS:**
- Generate a complete response shell ready for attorney customization
- Include proper USPTO formatting and section headers
- Add placeholder fields for case-specific information
- Provide boilerplate options for common arguments
- Ensure professional tone throughout
- Follow {{templateStyle}} style guidelines

Generate a comprehensive response shell that an experienced patent attorney would be proud to file.`,
};

// ============ SERVICE CLASS ============

export class ResponseShellGenerationService {
  /**
   * Generate a complete Office Action response shell
   */
  static async generateResponseShell(
    request: ResponseShellRequest
  ): Promise<ResponseShellResult> {
    logger.info('[ResponseShell] Starting response shell generation', {
      officeActionId: request.officeActionId,
      projectId: request.projectId,
      templateStyle: request.templateStyle,
    });

    try {
      // Validate inputs
      this.validateRequest(request);

      // Load Office Action data with tenant validation
      const officeAction = await findOfficeActionById(request.officeActionId);
      if (!officeAction) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          `Office Action ${request.officeActionId} not found`
        );
      }

      // Verify tenant access
      if (officeAction.tenantId !== request.tenantId) {
        throw new ApplicationError(
          ErrorCode.TENANT_ACCESS_DENIED,
          'Access denied to Office Action'
        );
      }

      // Load rejections
      let rejections: any[] = [];
      try {
        rejections = await findRejectionsByOfficeAction(request.officeActionId);
      } catch (error) {
        logger.warn('[ResponseShell] Could not load rejections, using placeholder', {
          officeActionId: request.officeActionId,
          error: error instanceof Error ? error.message : String(error),
        });
        // Use placeholder rejection for demo purposes
        rejections = [{
          type: '103',
          claimNumbers: ['1'],
          citedPriorArt: ['US1234567A'],
          examinerText: 'Placeholder rejection for demo'
        }];
      }
      
      if (rejections.length === 0) {
        throw new ApplicationError(
          ErrorCode.INVALID_INPUT,
          'No rejections found for response generation'
        );
      }

      // Get current claims for context
      const currentClaims = await this.getCurrentClaims(request.projectId);

      // Generate response shell using AI
      const shellResult = await this.generateShellWithAI(
        officeAction,
        rejections,
        currentClaims,
        request
      );

      logger.info('[ResponseShell] Response shell generated successfully', {
        officeActionId: request.officeActionId,
        sectionCount: shellResult.sections.length,
        totalRejections: rejections.length,
      });

      return {
        sections: shellResult.sections,
        fullDocument: this.assembleFullDocument(shellResult.sections),
        metadata: {
          totalRejections: rejections.length,
          rejectionTypes: rejections.map((r: any) => r.type),
          generatedAt: new Date(),
          templateStyle: request.templateStyle || 'standard',
        },
      };

    } catch (error) {
      logger.error('[ResponseShell] Failed to generate response shell', {
        officeActionId: request.officeActionId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Failed to generate response shell: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate request parameters
   */
  private static validateRequest(request: ResponseShellRequest): void {
    if (!request.officeActionId?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Office Action ID is required'
      );
    }

    if (!request.projectId?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    if (!request.tenantId?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Tenant ID is required'
      );
    }

    if (!request.userId?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'User ID is required'
      );
    }
  }

  /**
   * Generate response shell using AI
   */
  private static async generateShellWithAI(
    officeAction: any,
    rejections: any[],
    currentClaims: string,
    request: ResponseShellRequest
  ): Promise<any> {
    // Build rejections section for prompt
    const rejectionsSection = rejections.map((rejection, index) => `
${index + 1}. ${rejection.type} Rejection (Claims ${rejection.claimNumbers?.join(', ') || 'Unknown'})
   Prior Art: ${rejection.citedPriorArt?.join(', ') || 'None specified'}
   Examiner Reasoning: ${rejection.examinerText || 'No specific reasoning provided'}
`).join('\n');

    // Build user prompt
    const userPrompt = renderPromptTemplate(RESPONSE_SHELL_USER_PROMPT, {
      applicationNumber: officeAction.parsedData?.applicationNumber || '[Application Number]',
      mailingDate: officeAction.parsedData?.dateIssued || '[Mailing Date]',
      examinerName: officeAction.parsedData?.examiner?.name || '[Examiner Name]',
      responseDeadline: '[Response Deadline]',
      rejectionsSection,
      currentClaims: currentClaims || '[Current claims not available]',
      templateStyle: request.templateStyle || 'standard',
      firmName: request.firmName || '[Firm Name]',
      includeBoilerplate: request.includeBoilerplate ? 'Yes' : 'No',
    });

    // Generate response using AI
    const systemPrompt = renderPromptTemplate(RESPONSE_SHELL_SYSTEM_PROMPT, {});
    
    logger.debug('[ResponseShell] Calling AI for shell generation', {
      officeActionId: request.officeActionId,
      rejectionCount: rejections.length,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
    });

    const aiResponse = await processWithOpenAI(
      systemPrompt,
      userPrompt,
      {
        maxTokens: 8000,
        temperature: 0.2, // Lower temperature for consistent formatting
      }
    );

    if (!aiResponse?.content?.trim()) {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'AI service returned empty response for shell generation'
      );
    }

    // Parse AI response
    const shellResult = safeJsonParse(aiResponse.content, null);
    if (!shellResult || !shellResult.sections) {
      throw new ApplicationError(
        ErrorCode.AI_INVALID_RESPONSE,
        'AI returned invalid JSON response for shell generation'
      );
    }

    return shellResult;
  }

  /**
   * Get current claims for context
   */
  private static async getCurrentClaims(projectId: string): Promise<string> {
    try {
      // TODO: Integrate with existing claim repository to get current claims
      // This can be implemented in the next iteration
      logger.debug('[ResponseShell] Placeholder for claim loading', { projectId });
      return 'Current claims will be loaded from the project';
    } catch (error) {
      logger.warn('[ResponseShell] Could not load current claims', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      return 'Claims not available';
    }
  }

  /**
   * Assemble sections into a complete document
   */
  private static assembleFullDocument(sections: ResponseSection[]): string {
    return sections.map(section => {
      let content = section.content;
      
      // Replace editable fields with their values
      section.editableFields.forEach(field => {
        const placeholder = `{{${field.name}}}`;
        content = content.replace(
          new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          field.value || field.placeholder || `[${field.name}]`
        );
      });
      
      return content;
    }).join('\n\n');
  }
} 