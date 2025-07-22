import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { Prisma } from '@prisma/client';
import { RequestContext } from '@/types/request';

export interface ClaimAmendmentData {
  projectId: string;
  officeActionId: string;
  tenantId: string;
  claimNumber: number;
  originalText: string;
  amendedText: string;
  changes: any[];
  changeReason: string;
  aiGenerated: boolean;
  version: number;
  status: string;
}

export class AmendmentRepository {
  /**
   * Find all amendments for a project
   */
  static async findByProject(projectId: string, tenantId: string) {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    return prisma.claimAmendment.findMany({
      where: {
        projectId,
        tenantId,
        deletedAt: null,
      },
      orderBy: [
        { version: 'desc' },
        { claimNumber: 'asc' },
      ],
    });
  }

  /**
   * Find a specific amendment by claim number
   */
  static async findByClaimNumber(
    projectId: string,
    claimNumber: number,
    tenantId: string
  ) {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    return prisma.claimAmendment.findFirst({
      where: {
        projectId,
        claimNumber,
        tenantId,
        deletedAt: null,
      },
      orderBy: { version: 'desc' },
    });
  }

  /**
   * Create multiple amendments in a transaction
   */
  static async createMany(amendments: ClaimAmendmentData[]) {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    return prisma.$transaction(
      amendments.map(amendment =>
        prisma.claimAmendment.create({
          data: {
            ...amendment,
            changes: amendment.changes as Prisma.JsonArray,
          },
        })
      )
    );
  }

  /**
   * Create a new version of an amendment
   */
  static async createNewVersion(
    existingAmendment: any,
    amendedText: string
  ) {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database connection not available'
      );
    }

    const { id, ...amendmentData } = existingAmendment;
    
    return prisma.claimAmendment.create({
      data: {
        ...amendmentData,
        amendedText,
        version: existingAmendment.version + 1,
        aiGenerated: false, // User edited
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
  }
}