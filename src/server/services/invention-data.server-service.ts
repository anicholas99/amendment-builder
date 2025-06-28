import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types/invention';
import {
  UpdateInventionRequest,
  isValidInventionUpdateRequest,
} from '@/types/api/invention';
import { inventionRepository } from '@/repositories/inventionRepository';
import { Invention } from '@prisma/client';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { flexibleJsonParse } from '@/utils/json-utils';
import { ClaimRepository } from '@/repositories/claimRepository';

/**
 * Service for managing invention data - THE ONLY PLACE that handles JSON stringification
 *
 * CRITICAL ARCHITECTURE RULES:
 * 1. This service ONLY accepts objects from the frontend
 * 2. This service handles ALL JSON stringification for the database
 * 3. No other layer should stringify JSON
 *
 * This pattern ensures consistency, type safety, and maintainability across the codebase.
 */
export class InventionDataService {
  /**
   * Update invention data - ONLY accepts objects, handles stringification internally
   *
   * @param projectId - The project to update
   * @param updates - Object data from frontend (NEVER pre-stringified JSON)
   */
  async DEPRECATED_updateInventionData(
    projectId: string,
    updates: UpdateInventionRequest
  ): Promise<void> {
    try {
      // CRITICAL: Validate that no pre-stringified JSON was sent
      isValidInventionUpdateRequest(updates);

      logger.debug('[updateInventionData] Received updates', {
        projectId,
        updateKeys: Object.keys(updates),
      });

      // Transform the clean object data into database format
      // This is THE ONLY PLACE where JSON stringification happens
      const inventionUpdateData: any = {
        // Basic fields map directly
        ...(updates.title && { title: updates.title }),
        ...(updates.summary && { summary: updates.summary }),
        ...(updates.abstract && { abstract: updates.abstract }),
        ...(updates.novelty && { noveltyStatement: updates.novelty }),
        ...(updates.noveltyStatement && {
          noveltyStatement: updates.noveltyStatement,
        }),
        ...(updates.patentCategory && {
          patentCategory: updates.patentCategory,
        }),
        ...(updates.technicalField && {
          technicalField: updates.technicalField,
        }),

        // CRITICAL: Convert arrays to JSON strings HERE AND ONLY HERE
        ...(updates.features && {
          featuresJson: JSON.stringify(updates.features),
        }),
        ...(updates.advantages && {
          advantagesJson: JSON.stringify(updates.advantages),
        }),
        ...(updates.useCases && {
          useCasesJson: JSON.stringify(updates.useCases),
        }),
        ...(updates.processSteps && {
          processStepsJson: JSON.stringify(updates.processSteps),
        }),
        ...(updates.futureDirections && {
          futureDirectionsJson: JSON.stringify(updates.futureDirections),
        }),

        // NOTE: figures and elements are now handled through normalized tables
        // Do not update figuresJson or elementsJson fields
        ...(updates.priorArt && {
          priorArtJson: JSON.stringify(updates.priorArt),
        }),
        ...(updates.definitions && {
          definitionsJson: JSON.stringify(updates.definitions),
        }),
        ...(updates.technicalImplementation && {
          technicalImplementationJson: JSON.stringify(
            updates.technicalImplementation
          ),
        }),
        ...(updates.background && {
          backgroundJson:
            typeof updates.background === 'object'
              ? JSON.stringify(updates.background)
              : JSON.stringify({ technicalField: updates.background }),
        }),
      };

      // Log what we're about to save for debugging

      // Use repository for database operations
      await inventionRepository.upsert({
        projectId,
        inventionData: inventionUpdateData,
      });

      logger.info('[updateInventionData] Successfully updated invention data', {
        projectId,
        updatedFields: Object.keys(inventionUpdateData),
      });
    } catch (error) {
      logger.error('Failed to update invention data', { projectId, error });
      throw error;
    }
  }

  /**
   * Updates the title of an invention.
   * @param projectId - The ID of the project.
   * @param title - The new title.
   */
  async updateTitle(projectId: string, title: string): Promise<void> {
    try {
      logger.debug('[InventionService] Updating title', { projectId });

      if (typeof title !== 'string') {
        throw new Error('Invalid title format');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { title },
      });

      logger.debug('[InventionService] Successfully updated title', {
        projectId,
      });
    } catch (error) {
      logger.error('Failed to update invention title', { projectId, error });
      throw error;
    }
  }

  /**
   * Updates the summary of an invention.
   * @param projectId - The ID of the project.
   * @param summary - The new summary.
   */
  async updateSummary(projectId: string, summary: string): Promise<void> {
    try {
      logger.debug('[InventionService] Updating summary', { projectId });

      if (typeof summary !== 'string') {
        throw new Error('Invalid summary format');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { summary },
      });

      logger.debug('[InventionService] Successfully updated summary', {
        projectId,
      });
    } catch (error) {
      logger.error('Failed to update invention summary', { projectId, error });
      throw error;
    }
  }

  /**
   * Updates the technical field of an invention.
   * @param projectId - The ID of the project.
   * @param technicalField - The new technical field.
   */
  async updateTechnicalField(
    projectId: string,
    technicalField: string
  ): Promise<void> {
    try {
      logger.debug('[InventionService] Updating technical field', {
        projectId,
      });

      if (typeof technicalField !== 'string') {
        throw new Error('Invalid technical field format');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { technicalField },
      });

      logger.debug('[InventionService] Successfully updated technical field', {
        projectId,
      });
    } catch (error) {
      logger.error('Failed to update invention technical field', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates the features of an invention.
   * @param projectId - The ID of the project.
   * @param features - The new features array.
   */
  async updateFeatures(projectId: string, features: string[]): Promise<void> {
    try {
      logger.debug('[InventionService] Updating features', { projectId });

      if (!Array.isArray(features)) {
        throw new Error('Invalid features format - must be an array');
      }

      // Validate each feature is a string
      if (!features.every(f => typeof f === 'string')) {
        throw new Error('All features must be strings');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { featuresJson: JSON.stringify(features) },
      });

      logger.debug('[InventionService] Successfully updated features', {
        projectId,
        featureCount: features.length,
      });
    } catch (error) {
      logger.error('Failed to update invention features', { projectId, error });
      throw error;
    }
  }

  /**
   * Updates the advantages of an invention.
   * @param projectId - The ID of the project.
   * @param advantages - The new advantages array.
   */
  async updateAdvantages(
    projectId: string,
    advantages: string[]
  ): Promise<void> {
    try {
      logger.debug('[InventionService] Updating advantages', { projectId });

      if (!Array.isArray(advantages)) {
        throw new Error('Invalid advantages format - must be an array');
      }

      // Validate each advantage is a string
      if (!advantages.every(a => typeof a === 'string')) {
        throw new Error('All advantages must be strings');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { advantagesJson: JSON.stringify(advantages) },
      });

      logger.debug('[InventionService] Successfully updated advantages', {
        projectId,
        advantageCount: advantages.length,
      });
    } catch (error) {
      logger.error('Failed to update invention advantages', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates the abstract of an invention.
   * @param projectId - The ID of the project.
   * @param abstract - The new abstract.
   */
  async updateAbstract(projectId: string, abstract: string): Promise<void> {
    try {
      logger.debug('[InventionService] Updating abstract', { projectId });

      if (typeof abstract !== 'string') {
        throw new Error('Invalid abstract format');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { abstract },
      });

      logger.debug('[InventionService] Successfully updated abstract', {
        projectId,
      });
    } catch (error) {
      logger.error('Failed to update invention abstract', { projectId, error });
      throw error;
    }
  }

  /**
   * Updates the novelty statement of an invention.
   * @param projectId - The ID of the project.
   * @param noveltyStatement - The new novelty statement.
   */
  async updateNoveltyStatement(
    projectId: string,
    noveltyStatement: string
  ): Promise<void> {
    try {
      logger.debug('[InventionService] Updating novelty statement', {
        projectId,
      });

      if (typeof noveltyStatement !== 'string') {
        throw new Error('Invalid novelty statement format');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { noveltyStatement },
      });

      logger.debug(
        '[InventionService] Successfully updated novelty statement',
        {
          projectId,
        }
      );
    } catch (error) {
      logger.error('Failed to update invention novelty statement', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates the background of an invention.
   * @param projectId - The ID of the project.
   * @param background - The new background (can be string or object).
   */
  async updateBackground(
    projectId: string,
    background: string | Record<string, any>
  ): Promise<void> {
    try {
      logger.debug('[InventionService] Updating background', { projectId });

      // Validate input type
      if (typeof background !== 'string' && typeof background !== 'object') {
        throw new Error('Invalid background format - must be string or object');
      }

      // Store as JSON string
      const backgroundJson =
        typeof background === 'object'
          ? JSON.stringify(background)
          : JSON.stringify({ technicalField: background });

      await inventionRepository.upsert({
        projectId,
        inventionData: { backgroundJson },
      });

      logger.debug('[InventionService] Successfully updated background', {
        projectId,
      });
    } catch (error) {
      logger.error('Failed to update invention background', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates the use cases of an invention.
   * @param projectId - The ID of the project.
   * @param useCases - The new use cases array.
   */
  async updateUseCases(projectId: string, useCases: string[]): Promise<void> {
    try {
      logger.debug('[InventionService] Updating use cases', { projectId });

      if (!Array.isArray(useCases)) {
        throw new Error('Invalid use cases format - must be an array');
      }

      // Validate each use case is a string
      if (!useCases.every(uc => typeof uc === 'string')) {
        throw new Error('All use cases must be strings');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { useCasesJson: JSON.stringify(useCases) },
      });

      logger.debug('[InventionService] Successfully updated use cases', {
        projectId,
        useCaseCount: useCases.length,
      });
    } catch (error) {
      logger.error('Failed to update invention use cases', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates the process steps of an invention.
   * @param projectId - The ID of the project.
   * @param processSteps - The new process steps array.
   */
  async updateProcessSteps(
    projectId: string,
    processSteps: string[]
  ): Promise<void> {
    try {
      logger.debug('[InventionService] Updating process steps', { projectId });

      if (!Array.isArray(processSteps)) {
        throw new Error('Invalid process steps format - must be an array');
      }

      // Validate each process step is a string
      if (!processSteps.every(ps => typeof ps === 'string')) {
        throw new Error('All process steps must be strings');
      }

      await inventionRepository.upsert({
        projectId,
        inventionData: { processStepsJson: JSON.stringify(processSteps) },
      });

      logger.debug('[InventionService] Successfully updated process steps', {
        projectId,
        processStepCount: processSteps.length,
      });
    } catch (error) {
      logger.error('Failed to update invention process steps', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates the claims of an invention in the normalized Claim table.
   * WARNING: This method DELETES all existing claims and creates new ones with new IDs.
   * This should ONLY be called during initial invention processing, NOT for regular updates.
   * For updating individual claims, use the dedicated claim API endpoints.
   * @param projectId - The ID of the project.
   * @param claims - The new claims object or array.
   */
  async updateClaims(
    projectId: string,
    claims: Record<string, string> | string[]
  ): Promise<void> {
    try {
      // Log a warning as this method should rarely be called
      logger.warn(
        '[InventionService] RECREATING ALL CLAIMS - This will change all claim IDs!',
        {
          projectId,
          claimCount: Array.isArray(claims)
            ? claims.length
            : Object.keys(claims).length,
          stack: new Error().stack, // Log stack trace to find caller
        }
      );

      // Get the invention for this project
      const project =
        await inventionRepository.getProjectWithInvention(projectId);
      if (!project?.invention) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Invention not found for project'
        );
      }

      const inventionId = project.invention.id;

      // Prepare claims data
      const claimsToCreate: { number: number; text: string }[] = [];

      if (Array.isArray(claims)) {
        // Handle array format
        claims.forEach((claimText, index) => {
          if (typeof claimText === 'string' && claimText.trim()) {
            claimsToCreate.push({
              number: index + 1,
              text: claimText.trim(),
            });
          }
        });
      } else if (typeof claims === 'object') {
        // Handle object format (e.g., { "1": "claim text", "2": "claim text" })
        Object.entries(claims).forEach(([key, claimText]) => {
          const claimNumber = parseInt(key, 10);
          if (
            !isNaN(claimNumber) &&
            typeof claimText === 'string' &&
            claimText.trim()
          ) {
            claimsToCreate.push({
              number: claimNumber,
              text: claimText.trim(),
            });
          }
        });
      }

      // Use repository to update claims
      await ClaimRepository.updateClaimsForInvention(
        inventionId,
        claimsToCreate
      );

      logger.debug(
        '[InventionService] Successfully updated claims in Claim table',
        {
          projectId,
          inventionId,
          claimCount: claimsToCreate.length,
        }
      );
    } catch (error) {
      logger.error('Failed to update claims in Claim table', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates multiple fields at once using individual update methods
   * This replaces the deprecated DEPRECATED_updateInventionData method
   * @param projectId - The ID of the project
   * @param updates - Object containing field updates
   */
  async updateMultipleFields(
    projectId: string,
    updates: UpdateInventionRequest
  ): Promise<void> {
    try {
      logger.info('[InventionService] Updating multiple fields', {
        projectId,
        fields: Object.keys(updates),
      });

      // Process each field update using the appropriate method
      const updatePromises: Promise<void>[] = [];

      if (updates.title !== undefined) {
        updatePromises.push(this.updateTitle(projectId, updates.title));
      }
      if (updates.summary !== undefined) {
        updatePromises.push(this.updateSummary(projectId, updates.summary));
      }
      if (updates.abstract !== undefined) {
        updatePromises.push(this.updateAbstract(projectId, updates.abstract));
      }
      if (
        updates.novelty !== undefined ||
        updates.noveltyStatement !== undefined
      ) {
        const novelty = updates.novelty || updates.noveltyStatement || '';
        updatePromises.push(this.updateNoveltyStatement(projectId, novelty));
      }
      if (updates.technicalField !== undefined) {
        updatePromises.push(
          this.updateTechnicalField(projectId, updates.technicalField)
        );
      }
      if (updates.features !== undefined) {
        updatePromises.push(this.updateFeatures(projectId, updates.features));
      }
      if (updates.advantages !== undefined) {
        updatePromises.push(
          this.updateAdvantages(projectId, updates.advantages)
        );
      }
      if (updates.useCases !== undefined) {
        updatePromises.push(this.updateUseCases(projectId, updates.useCases));
      }
      if (updates.processSteps !== undefined) {
        updatePromises.push(
          this.updateProcessSteps(projectId, updates.processSteps)
        );
      }
      if (updates.background !== undefined) {
        updatePromises.push(
          this.updateBackground(projectId, updates.background)
        );
      }

      // For fields without dedicated methods, we need to handle them directly
      const directUpdateData: any = {};

      if (updates.patentCategory !== undefined) {
        directUpdateData.patentCategory = updates.patentCategory;
      }
      if (updates.claims !== undefined) {
        // IMPORTANT: Claims should NOT be updated through the invention endpoint
        // Claims have their own dedicated endpoints and should maintain stable IDs
        // Updating claims here causes all claim IDs to be regenerated, breaking references
        logger.warn(
          '[InventionService] Ignoring claims field in invention update - claims should be updated through dedicated endpoints',
          { projectId }
        );
        // Skip claims update - do not add to updatePromises
      }
      if (updates.priorArt !== undefined) {
        directUpdateData.priorArtJson = JSON.stringify(updates.priorArt);
      }
      if (updates.definitions !== undefined) {
        directUpdateData.definitionsJson = JSON.stringify(updates.definitions);
      }
      if (updates.technicalImplementation !== undefined) {
        directUpdateData.technicalImplementationJson = JSON.stringify(
          updates.technicalImplementation
        );
      }
      if (updates.futureDirections !== undefined) {
        directUpdateData.futureDirectionsJson = JSON.stringify(
          updates.futureDirections
        );
      }

      // If there are direct updates, handle them
      if (Object.keys(directUpdateData).length > 0) {
        updatePromises.push(
          (async () => {
            try {
              await inventionRepository.upsert({
                projectId,
                inventionData: directUpdateData,
              });
            } catch (error) {
              logger.error('Failed to update direct fields', {
                projectId,
                fields: Object.keys(directUpdateData),
                error,
              });
              throw error;
            }
          })()
        );
      }

      // Execute all updates in parallel
      await Promise.all(updatePromises);

      logger.info('[InventionService] Successfully updated multiple fields', {
        projectId,
        fieldsUpdated: Object.keys(updates).length,
      });
    } catch (error) {
      logger.error('Failed to update multiple invention fields', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Transforms a raw Invention model from Prisma into the InventionData DTO,
   * which is used throughout the application. It ensures type compatibility
   * by converting `null` values to `undefined`.
   * @param invention The raw invention object from the database.
   * @returns An InventionData object.
   */
  toInventionDataDTO(invention: Invention & { claims?: any }): InventionData {
    const transformed: InventionData = {
      // Spread all properties and handle null-to-undefined conversion
      ...invention,
      title: invention.title ?? undefined,
      summary: invention.summary ?? undefined,
      abstract: invention.abstract ?? undefined,
      patentCategory: invention.patentCategory ?? undefined,
      technicalField: invention.technicalField ?? undefined,
      noveltyStatement: invention.noveltyStatement ?? undefined,
      lastSyncedClaim: invention.lastSyncedClaim ?? undefined,
      claimSyncedAt: invention.claimSyncedAt ?? undefined,

      // NOTE: figures and elements are now handled through normalized tables
      // Do not include figuresJson or elementsJson in DTO

      // Parse complex fields for direct use
      figures: {}, // Figures should be fetched from normalized tables
      elements: {}, // Elements should be fetched from normalized tables
      advantages: flexibleJsonParse(invention.advantagesJson, []),
      features: flexibleJsonParse(invention.featuresJson, []),
      useCases: flexibleJsonParse(invention.useCasesJson, []),
      processSteps: flexibleJsonParse(invention.processStepsJson, []),
      technicalImplementation: flexibleJsonParse(
        invention.technicalImplementationJson,
        {}
      ),
      background: flexibleJsonParse(invention.backgroundJson, {}),

      // Claims will be populated from the Claim table
      claims: {},
    };

    // Clean up fields that are only on the Prisma model but not the DTO
    delete (transformed as any).backgroundJson;
    delete (transformed as any).advantagesJson;
    delete (transformed as any).featuresJson;
    delete (transformed as any).useCasesJson;
    delete (transformed as any).processStepsJson;
    delete (transformed as any).technicalImplementationJson;

    return transformed;
  }

  /**
   * Get invention data - reads from repository and transforms into a DTO.
   */
  async getInventionData(projectId: string): Promise<InventionData | null> {
    try {
      const project =
        await inventionRepository.getProjectWithInvention(projectId);

      if (!project?.invention) {
        logger.info(`No invention data found for project ${projectId}`);
        return null;
      }

      const inventionData = this.toInventionDataDTO(project.invention);

      // Fetch claims from the normalized Claim table
      try {
        const claimRecords = await ClaimRepository.findByInventionId(
          project.invention.id
        );
        if (claimRecords && claimRecords.length > 0) {
          // Transform claims array into the expected format (Record<number, string>)
          inventionData.claims = claimRecords.reduce<Record<number, string>>(
            (acc, claim) => {
              acc[claim.number] = claim.text;
              return acc;
            },
            {}
          );

          logger.debug('Fetched claims from Claim table', {
            projectId,
            inventionId: project.invention.id,
            claimCount: claimRecords.length,
          });
        } else {
          // No claims found, set empty object
          inventionData.claims = {};
        }
      } catch (error) {
        logger.error('Failed to fetch claims from Claim table', {
          projectId,
          inventionId: project.invention.id,
          error,
        });
        // Set empty claims instead of using fallback
        inventionData.claims = {};
      }

      logger.debug('[INVENTION SERVICE] Transformed DTO:', {
        projectId,
        hasFigures: !!inventionData.figures,
        figuresKeys: inventionData.figures
          ? Object.keys(inventionData.figures)
          : [],
      });

      return inventionData;
    } catch (error) {
      logger.error('Failed to get invention data', { projectId, error });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to retrieve invention data.'
      );
    }
  }

  /**
   * Generates a single, comprehensive string containing all invention data,
   * intended for use in AI prompts.
   * @param invention An InventionData object.
   * @param figuresText Optional pre-formatted figures text from normalized tables
   * @returns A formatted string of all invention details.
   */
  getFullInventionDataString(
    invention: InventionData,
    figuresText?: string
  ): string {
    const claims = flexibleJsonParse(invention.claims, {});
    const technicalImpl =
      flexibleJsonParse(invention.technicalImplementation, {}) || {};

    const claimText =
      typeof claims === 'object' && !Array.isArray(claims)
        ? Object.entries(claims)
            .map(([num, text]) => `Claim ${num}: ${text}`)
            .join('\n')
        : Array.isArray(claims)
          ? claims.map((text, i) => `Claim ${i + 1}: ${text}`).join('\n')
          : 'No claims provided';

    // Use provided figuresText or default to no figures
    const figureText = figuresText || 'No figures provided';

    return `
      Full Invention Data:
      Title: ${invention.title || 'Untitled Invention'}
      Summary: ${invention.summary || 'No summary provided'}
      Technical Field: ${invention.technicalField || 'No technical field provided'}
      Problem Statement: ${invention.problemStatement || 'No problem statement provided'}
      Solution Summary: ${invention.solutionSummary || 'No solution summary provided'}
      Background: ${invention.background || 'No background provided'}
      Features: ${(invention.features || []).join(', ') || 'No features provided'}
      Advantages: ${(invention.advantages || []).join(', ') || 'No advantages provided'}
      Use Cases: ${(invention.useCases || []).join(', ') || 'No use cases provided'}
      Novelty: ${invention.noveltyStatement || 'No novelty provided'}
      System Architecture: ${invention.systemArchitecture || 'No system architecture provided'}
      Implementation Notes: ${invention.implementationNotes || 'No implementation notes provided'}
      Claims: ${claimText}
      Figures: ${figureText}
      Technical Implementation - Preferred Embodiment: ${(technicalImpl as any)?.preferred_embodiment || invention.systemArchitecture || 'No preferred embodiment provided'}
      Technical Implementation - Alternative Embodiments: ${((technicalImpl as any)?.alternative_embodiments || []).join('; ') || 'No alternative embodiments provided'}
      Process Steps: ${(invention.processSteps || []).join(' → ') || (invention as any).dataFlow || 'No process steps provided'}
    `;
  }
}

// Export singleton instance
export const inventionDataService = new InventionDataService();
