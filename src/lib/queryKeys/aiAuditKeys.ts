/**
 * @fileoverview Centralized query key factories for AI audit data.
 */

import { getCurrentTenant } from './tenant';

export const aiAuditKeys = {
  all: ['aiAudit'] as const,
  logs: () => [getCurrentTenant(), ...aiAuditKeys.all, 'logs'] as const,
  list: (filters?: any) => [...aiAuditKeys.logs(), { filters }] as const,
  detail: (auditLogId: string) => [...aiAuditKeys.logs(), auditLogId] as const,
  stats: (projectId: string) =>
    [getCurrentTenant(), ...aiAuditKeys.all, 'stats', projectId] as const,
  export: (projectId: string) =>
    [getCurrentTenant(), ...aiAuditKeys.all, 'export', projectId] as const,
};
