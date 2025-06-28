import { NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { queryAuditLogs } from '@/lib/monitoring/audit-logger';
import { logger } from '@/lib/monitoring/logger';
import { getAllUsers } from '@/repositories/userRepository';
import { readFileSync, existsSync } from 'fs';
import * as path from 'path';
import { SecurePresets } from '@/lib/api/securePresets';

/**
 * SOC 2 Compliance Dashboard
 * Provides an overview of security, privacy, and compliance metrics
 * Admin-only endpoint
 */
async function handler(req: CustomApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const tenantId = req.user?.tenantId;

  try {
    // Get date ranges
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Security Metrics
    const failedLogins = await queryAuditLogs({
      action: 'auth.failed_login',
      startDate: last24Hours,
      tenantId,
    });

    const successfulLogins = await queryAuditLogs({
      action: 'auth.login',
      startDate: last24Hours,
      tenantId,
    });

    const tenantSwitches = await queryAuditLogs({
      action: 'auth.tenant_switch',
      startDate: last7Days,
      tenantId,
    });

    // Privacy Metrics
    const privacyEvents = {
      dataExports: await queryAuditLogs({
        action: 'privacy.data_exported',
        startDate: last30Days,
        tenantId,
      }),
      dataDeletions: await queryAuditLogs({
        action: 'privacy.data_deleted',
        startDate: last30Days,
        tenantId,
      }),
      consentChanges: await queryAuditLogs({
        action: 'privacy.consent_given',
        startDate: last30Days,
        tenantId,
      }),
    };

    // User Privacy Status
    const privacyCompliance = {
      totalUsers: 0,
      usersWithConsent: 0,
      usersWithoutConsent: 0,
      averageRetentionDays: 365,
    };

    try {
      // Use repository to get all users
      if (tenantId) {
        const users = await getAllUsers();

        privacyCompliance.totalUsers = users.length;
        // TODO: Update this after running prisma generate
        privacyCompliance.usersWithConsent = 0;
        privacyCompliance.usersWithoutConsent = users.length;
      }
    } catch (error) {
      logger.info('Privacy compliance metrics not available', { error });
    }

    // Data Access Patterns
    const dataAccessEvents = {
      reads: await queryAuditLogs({
        action: 'project.read',
        startDate: last24Hours,
        tenantId,
      }),
      creates: await queryAuditLogs({
        action: 'project.create',
        startDate: last24Hours,
        tenantId,
      }),
      updates: await queryAuditLogs({
        action: 'project.update',
        startDate: last24Hours,
        tenantId,
      }),
      deletes: await queryAuditLogs({
        action: 'project.delete',
        startDate: last24Hours,
        tenantId,
      }),
    };

    // API Security Coverage - Dynamic from analysis
    let securityCoverage = {
      endpointsWithAuth: 97,
      totalEndpoints: 98,
      endpointsWithValidation: 64,
      endpointsWithTenantGuard: 87,
      endpointsWithRoleCheck: 91,
      endpointsWithRateLimit: 6,
      endpointsWithCsrf: 35,
    };

    // Try to load real-time metrics from the security analysis
    try {
      const metricsPath = path.join(
        process.cwd(),
        'scripts/api-security-metrics.json'
      );
      if (existsSync(metricsPath)) {
        const metricsData = JSON.parse(readFileSync(metricsPath, 'utf-8'));
        const { metrics } = metricsData;

        securityCoverage = {
          endpointsWithAuth: metrics.endpointsWithAuth,
          totalEndpoints: metrics.totalEndpoints,
          endpointsWithValidation: metrics.endpointsWithValidation,
          endpointsWithTenantGuard: metrics.endpointsWithTenantGuard,
          endpointsWithRoleCheck: metrics.endpointsWithRoleCheck,
          endpointsWithRateLimit: metrics.endpointsWithRateLimit,
          endpointsWithCsrf: metrics.endpointsWithCsrf,
        };
      }
    } catch (error) {
      logger.warn('Could not load real-time API security metrics', { error });
    }

    // Compile compliance report
    const complianceReport = {
      reportGeneratedAt: now.toISOString(),
      tenantId,
      security: {
        authenticationEvents: {
          last24Hours: {
            successfulLogins: successfulLogins.length,
            failedLogins: failedLogins.length,
            loginSuccessRate:
              successfulLogins.length > 0
                ? (
                    (successfulLogins.length /
                      (successfulLogins.length + failedLogins.length)) *
                    100
                  ).toFixed(2) + '%'
                : '0%',
          },
          last7Days: {
            tenantSwitches: tenantSwitches.length,
          },
        },
        apiCoverage: {
          authenticationCoverage: `${(
            (securityCoverage.endpointsWithAuth /
              securityCoverage.totalEndpoints) *
            100
          ).toFixed(1)}%`,
          validationCoverage: `${(
            (securityCoverage.endpointsWithValidation /
              securityCoverage.totalEndpoints) *
            100
          ).toFixed(1)}%`,
          tenantIsolationCoverage: `${(
            (securityCoverage.endpointsWithTenantGuard /
              securityCoverage.totalEndpoints) *
            100
          ).toFixed(1)}%`,
          roleBasedAccessCoverage: `${(
            (securityCoverage.endpointsWithRoleCheck /
              securityCoverage.totalEndpoints) *
            100
          ).toFixed(1)}%`,
          rateLimitingCoverage: `${(
            (securityCoverage.endpointsWithRateLimit /
              securityCoverage.totalEndpoints) *
            100
          ).toFixed(1)}%`,
          csrfProtectionCoverage: `${(
            (securityCoverage.endpointsWithCsrf /
              securityCoverage.totalEndpoints) *
            100
          ).toFixed(1)}%`,
        },
      },
      privacy: {
        compliance: privacyCompliance,
        recentActivity: {
          dataExports: privacyEvents.dataExports.length,
          dataDeletions: privacyEvents.dataDeletions.length,
          consentChanges: privacyEvents.consentChanges.length,
        },
      },
      dataAccess: {
        last24Hours: {
          reads: dataAccessEvents.reads.length,
          creates: dataAccessEvents.creates.length,
          updates: dataAccessEvents.updates.length,
          deletes: dataAccessEvents.deletes.length,
        },
      },
      auditTrail: {
        status: 'Active',
        retentionPolicy: 'Indefinite',
        encryptionAtRest: 'Yes (Azure TDE)',
        tamperProof: 'Yes (Database-backed)',
      },
      recommendations: [
        securityCoverage.endpointsWithRateLimit <
          securityCoverage.totalEndpoints * 0.8 &&
          'Increase rate limiting coverage to prevent abuse',
        securityCoverage.endpointsWithCsrf <
          securityCoverage.totalEndpoints * 0.5 &&
          'Improve CSRF protection coverage on state-changing endpoints',
        privacyCompliance.usersWithoutConsent > 0 &&
          'Obtain consent from all users for data processing',
        failedLogins.length > 10 &&
          'Investigate high number of failed login attempts',
      ].filter(Boolean),
    };

    return res.status(200).json(complianceReport);
  } catch (error) {
    logger.error('SOC2 compliance report error:', { error });
    return res
      .status(500)
      .json({ error: 'Failed to generate compliance report' });
  }
}

// Use the adminGlobal preset for admin-only, non-tenant-specific endpoints
export default SecurePresets.adminGlobal(handler);
