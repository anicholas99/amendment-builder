import {
  findProjectById,
  findProjectPriorArt,
  addProjectPriorArt,
  removeProjectPriorArt,
  removeProjectPriorArtById,
} from '@/repositories/project';
import { PriorArtDataToSave } from '@/types/domain/priorArt';
import { ApplicationError, ErrorCode } from '@/lib/error';

export class PriorArtServerService {
  static async getPriorArtForProject(
    projectId: string,
    userId: string,
    tenantId: string
  ) {
    const project = await findProjectById(projectId, tenantId);
    if (!project || project.userId !== userId) {
      throw new ApplicationError(ErrorCode.PROJECT_ACCESS_DENIED);
    }

    const priorArt = await findProjectPriorArt(projectId);
    // Return raw SavedPriorArt objects to maintain data consistency
    // Processing should happen on the client side
    return priorArt;
  }

  static async addPriorArtToProject(
    projectId: string,
    userId: string,
    tenantId: string,
    priorArtData: PriorArtDataToSave
  ) {
    const project = await findProjectById(projectId, tenantId);
    if (!project || project.userId !== userId) {
      throw new ApplicationError(ErrorCode.PROJECT_ACCESS_DENIED);
    }
    if (!priorArtData.patentNumber) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Patent number is required'
      );
    }

    const savedPriorArt = await addProjectPriorArt(projectId, priorArtData);
    // Return raw SavedPriorArt object to maintain data consistency
    return savedPriorArt;
  }

  static async removePriorArtFromProject(
    projectId: string,
    userId: string,
    tenantId: string,
    patentToRemove: string
  ) {
    const project = await findProjectById(projectId, tenantId);
    if (!project || project.userId !== userId) {
      throw new ApplicationError(ErrorCode.PROJECT_ACCESS_DENIED);
    }

    return await removeProjectPriorArt(projectId, patentToRemove);
  }

  static async removePriorArtById(
    projectId: string,
    priorArtId: string,
    userId: string,
    tenantId: string
  ): Promise<boolean> {
    const project = await findProjectById(projectId, tenantId);
    if (!project || project.userId !== userId) {
      throw new ApplicationError(ErrorCode.PROJECT_ACCESS_DENIED);
    }

    return await removeProjectPriorArtById(projectId, priorArtId);
  }
}
