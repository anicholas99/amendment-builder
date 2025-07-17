import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { inventionRepository } from '@/repositories/inventionRepository';
import { InventionDataService } from '@/server/services/invention-data.server-service';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import {
  INVENTION_MERGER_SYSTEM_PROMPT_V1,
  INVENTION_MERGER_USER_PROMPT_V1,
} from '@/server/prompts/prompts/templates/inventionMerger';
import { safeJsonParse } from '@/utils/jsonUtils';

/**
 * Tool for updating invention details with new information from user
 * This intelligently merges new details into appropriate structured categories
 */
export async function updateInventionDetails(
  projectId: string,
  tenantId: string,
  additionalDetails: string
): Promise<{ message: string; updatedFields: string[] }> {
  logger.info('[UpdateInventionDetails] Starting invention update', {
    projectId,
    tenantId,
    detailsLength: additionalDetails.length,
  });

  // Create service instance for server-side usage
  const inventionDataService = new InventionDataService();

  try {
    // 1. Verify tenant access
    const project = await inventionRepository.getProjectWithInventionAndTenant(
      projectId,
      tenantId
    );

    if (!project) {
      throw new ApplicationError(
        ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
        'Project not found or access denied'
      );
    }

    // 2. Get current invention data
    const currentInvention =
      await inventionDataService.getInventionData(projectId);

    if (!currentInvention) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'No invention data found for this project'
      );
    }

    // 3. Prepare the current invention for AI processing
    const currentInventionStr = JSON.stringify(currentInvention, null, 2);

    // 4. Call AI to merge the details
    const systemPrompt = INVENTION_MERGER_SYSTEM_PROMPT_V1.template;
    const userPrompt = INVENTION_MERGER_USER_PROMPT_V1.template
      .replace('{{currentInventionStr}}', currentInventionStr)
      .replace('{{additionalDetails}}', additionalDetails);

    const aiResponse = await OpenaiServerService.getChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent merging
      max_tokens: 4000,
    });

    // 5. Parse the AI response
    const mergedInvention = safeJsonParse(aiResponse.content, null);

    if (!mergedInvention) {
      logger.error('[UpdateInventionDetails] Failed to parse AI response', {
        projectId,
        response: aiResponse.content.substring(0, 200),
      });
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to process the invention updates'
      );
    }

    // 6. Determine which fields were updated
    const updatedFields: string[] = [];
    const updates: any = {};

    // Compare and extract changes
    const fieldsToCheck = [
      'title',
      'summary',
      'abstract',
      'technicalField',
      'patentCategory',
      'noveltyStatement',
      'problemStatement',
      'solutionSummary',
      'background',
      'features',
      'advantages',
      'useCases',
      'processSteps',
      'technicalImplementation',
      'definitions',
      'futureDirections',
    ];

    for (const field of fieldsToCheck) {
      const currentValue = JSON.stringify(
        currentInvention[field as keyof typeof currentInvention]
      );
      const newValue = JSON.stringify(mergedInvention[field]);

      if (currentValue !== newValue && mergedInvention[field] !== undefined) {
        updates[field] = mergedInvention[field];
        updatedFields.push(field);
      }
    }

    // 7. Apply the updates if any changes were made
    if (updatedFields.length === 0) {
      return {
        message:
          'No changes were detected in the invention data based on the provided details.',
        updatedFields: [],
      };
    }

    logger.info('[UpdateInventionDetails] Applying updates', {
      projectId,
      updatedFields,
    });

    // Use the service to update multiple fields
    await inventionDataService.updateMultipleFields(projectId, updates);

    // 8. Return success message
    const fieldsList = updatedFields
      .map(f => {
        // Make field names more user-friendly
        const friendlyNames: Record<string, string> = {
          technicalField: 'technical field',
          patentCategory: 'patent category',
          noveltyStatement: 'novelty statement',
          problemStatement: 'problem statement',
          solutionSummary: 'solution summary',
          technicalImplementation: 'technical implementation',
          futureDirections: 'future directions',
          useCases: 'use cases',
          processSteps: 'process steps',
        };
        return friendlyNames[f] || f;
      })
      .join(', ');

    const message = `✅ Successfully updated your invention details! I've intelligently merged the new information into the following sections: ${fieldsList}. The updates have been saved and will be reflected throughout your patent application.\n\n<!-- INVENTION_UPDATED -->`;

    return {
      message,
      updatedFields,
    };
  } catch (error) {
    logger.error('[UpdateInventionDetails] Failed to update invention', {
      projectId,
      error,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to update invention details'
    );
  }
}
