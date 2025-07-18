/**
 * Claim Snapshot Service
 * 
 * Creates and manages claim version snapshots at key prosecution points
 * Follows existing service patterns for consistency
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ============ TYPES ============

export type SnapshotSource = 
  | 'INITIAL_FILING'
  | 'OFFICE_ACTION_SNAPSHOT'
  | 'AMENDMENT_DRAFT'
  | 'FILED_AMENDMENT'
  | 'PRELIMINARY_AMENDMENT';

interface ClaimData {
  number: number;
  text: string;
}

// ============ SERVICE CLASS ============

export class ClaimSnapshotService {
  /**
   * Create a claim version snapshot
   */
  static async createSnapshot(
    applicationId: string,
    source: SnapshotSource,
    projectId: string,
    officeActionId?: string
  ): Promise<any> {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }

    try {
      logger.info('[ClaimSnapshotService] Creating claim snapshot', {
        applicationId,
        source,
        projectId,
        officeActionId,
      });

      // Get current claims from invention
      const invention = await prisma.invention.findUnique({
        where: { projectId },
        include: { claims: true },
      });

      if (!invention || invention.claims.length === 0) {
        logger.warn('[ClaimSnapshotService] No claims found for snapshot', {
          projectId,
          applicationId,
        });
        return null;
      }

      // Get latest version number
      const latestVersion = await prisma.patentClaimVersion.findFirst({
        where: { applicationId },
        orderBy: { versionNumber: 'desc' },
      });

      const versionNumber = (latestVersion?.versionNumber || 0) + 1;

      // Prepare claims data
      const claimsData: ClaimData[] = invention.claims.map(c => ({
        number: c.number,
        text: c.text,
      }));

      // Calculate claim 1 hash for quick comparison
      const claim1 = claimsData.find(c => c.number === 1);
      const claim1Hash = claim1 
        ? crypto.createHash('sha256').update(claim1.text).digest('hex')
        : null;

      // Check if content actually changed from last version
      if (latestVersion && latestVersion.claim1Hash === claim1Hash) {
        logger.info('[ClaimSnapshotService] Claims unchanged, skipping snapshot', {
          applicationId,
          source,
          lastVersionNumber: latestVersion.versionNumber,
        });
        return latestVersion;
      }

      // Create new version
      const claimVersion = await prisma.patentClaimVersion.create({
        data: {
          applicationId,
          officeActionId,
          versionNumber,
          effectiveDate: new Date(),
          source,
          claimsJson: JSON.stringify(claimsData),
          claim1Hash,
          elementAnalysisJson: invention.parsedClaimElementsJson,
        },
      });

      logger.info('[ClaimSnapshotService] Claim snapshot created', {
        applicationId,
        versionId: claimVersion.id,
        versionNumber,
        source,
        claimsCount: claimsData.length,
      });

      return claimVersion;

    } catch (error) {
      logger.error('[ClaimSnapshotService] Failed to create snapshot', {
        error: error instanceof Error ? error.message : String(error),
        applicationId,
        source,
      });
      
      if (error instanceof ApplicationError) {
        throw error;
      }
      
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        `Failed to create claim snapshot: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get claim diff between two versions
   */
  static async getClaimDiff(
    versionId1: string,
    versionId2: string
  ): Promise<{
    added: ClaimData[];
    removed: ClaimData[];
    modified: Array<{
      number: number;
      oldText: string;
      newText: string;
    }>;
  }> {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }

    try {
      const [version1, version2] = await Promise.all([
        prisma.patentClaimVersion.findUnique({ where: { id: versionId1 } }),
        prisma.patentClaimVersion.findUnique({ where: { id: versionId2 } }),
      ]);

      if (!version1 || !version2) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Claim version not found'
        );
      }

      const claims1 = JSON.parse(version1.claimsJson) as ClaimData[];
      const claims2 = JSON.parse(version2.claimsJson) as ClaimData[];

      const claims1Map = new Map(claims1.map(c => [c.number, c.text]));
      const claims2Map = new Map(claims2.map(c => [c.number, c.text]));

      const added = claims2.filter(c => !claims1Map.has(c.number));
      const removed = claims1.filter(c => !claims2Map.has(c.number));
      const modified = claims1
        .filter(c => claims2Map.has(c.number) && claims2Map.get(c.number) !== c.text)
        .map(c => ({
          number: c.number,
          oldText: c.text,
          newText: claims2Map.get(c.number)!,
        }));

      return { added, removed, modified };

    } catch (error) {
      logger.error('[ClaimSnapshotService] Failed to get claim diff', {
        error: error instanceof Error ? error.message : String(error),
        versionId1,
        versionId2,
      });
      
      if (error instanceof ApplicationError) {
        throw error;
      }
      
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        `Failed to get claim diff: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get claim evolution timeline for a patent application
   */
  static async getClaimEvolution(
    applicationId: string
  ): Promise<Array<{
    version: any;
    changes: {
      added: number;
      removed: number;
      modified: number;
    };
  }>> {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }

    try {
      const versions = await prisma.patentClaimVersion.findMany({
        where: { applicationId },
        orderBy: { versionNumber: 'asc' },
        include: {
          officeAction: {
            select: {
              oaNumber: true,
              dateIssued: true,
            },
          },
        },
      });

      const evolution = [];
      
      for (let i = 0; i < versions.length; i++) {
        let changes = { added: 0, removed: 0, modified: 0 };
        
        if (i > 0) {
          const diff = await this.getClaimDiff(versions[i - 1].id, versions[i].id);
          changes = {
            added: diff.added.length,
            removed: diff.removed.length,
            modified: diff.modified.length,
          };
        }
        
        evolution.push({
          version: versions[i],
          changes,
        });
      }

      return evolution;

    } catch (error) {
      logger.error('[ClaimSnapshotService] Failed to get claim evolution', {
        error: error instanceof Error ? error.message : String(error),
        applicationId,
      });
      
      if (error instanceof ApplicationError) {
        throw error;
      }
      
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        `Failed to get claim evolution: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
} 