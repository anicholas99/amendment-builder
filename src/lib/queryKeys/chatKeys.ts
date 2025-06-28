/**
 * @fileoverview Query key factory for chat-related queries
 */

import { getCurrentTenant } from './tenant';

export const chatKeys = {
  all: ['chat'] as const,
  history: (projectId: string, contextType: string) =>
    [
      getCurrentTenant(),
      ...chatKeys.all,
      'history',
      projectId,
      contextType,
    ] as const,
  thread: (threadId: string) =>
    [getCurrentTenant(), ...chatKeys.all, 'thread', threadId] as const,
  context: (projectId: string) =>
    [getCurrentTenant(), ...chatKeys.all, 'context', projectId] as const,
};
