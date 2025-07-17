import { logger } from '@/utils/clientLogger';
// import { ChatApiService } from '@/services/api/chatApiService';
import { ChatCommand } from '../types';
import { isDevelopment } from '@/config/environment.client';

interface CommandExecutorOptions {
  projectId: string;
  onContentUpdate?: (content: string) => void;
  pendingRefresh: { current: boolean };
}

export const executeCommand = async (
  cmd: ChatCommand,
  options: CommandExecutorOptions
): Promise<void> => {
  const { projectId, onContentUpdate, pendingRefresh } = options;

  try {
    logger.debug('[CommandExecutor] Executing command:', cmd);

    // DEBUG: Log every command received for debugging
    logger.debug('[TITLE UPDATE DEBUG] Command received:', {
      type: cmd.type || 'unknown',
      field: cmd.field || 'none',
      value:
        typeof cmd.value === 'string'
          ? cmd.value.substring(0, 50) + '...'
          : cmd.value,
      operation: cmd.operation || 'none',
      fullCommand: cmd,
    });

    if (isDevelopment) {
      logger.info('Executing command', { type: cmd.type || 'unknown' });
    }

    // Handle patent document refresh commands differently
    if (cmd.type === 'patent_document_updated') {
      logger.debug('[TITLE UPDATE DEBUG] Patent document refresh triggered');
      if (isDevelopment) {
        logger.info('Handling patent document refresh');
      }
      // For patent documents, just trigger a refresh since the backend already updated the data
      if (onContentUpdate) {
        onContentUpdate('refresh');
      }
      return; // Don't call the update-field API for patent documents
    }

    // Handle project data refresh commands
    if (cmd.type === 'project_data_updated') {
      logger.debug('[TITLE UPDATE DEBUG] Project data refresh triggered', {
        field: cmd.field,
      });
      if (isDevelopment) {
        logger.info('Handling project data refresh');
      }
      // For project data updates (like claims), just trigger a refresh since the backend already updated the data
      if (onContentUpdate) {
        onContentUpdate('refresh');
      }
      return; // Don't call the update-field API since it's already updated
    }

    // DEBUG: Enhanced field/type detection for title updates
    if (cmd.field && cmd.field === 'title') {
      logger.debug(
        '[TITLE UPDATE DEBUG] Title field detected in command, marking for refresh'
      );
    }

    // Enhanced command detection - catch title updates specifically
    if (cmd.field === 'title' || (cmd.field && cmd.field.includes('title'))) {
      logger.debug(
        '[TITLE UPDATE DEBUG] Title-related command detected, forcing refresh'
      );
      pendingRefresh.current = true;
      if (onContentUpdate) {
        onContentUpdate('refresh');
      }
      return;
    }

    // DEBUG: Log any command that might be a title update but didn't match above
    if (
      cmd.value &&
      typeof cmd.value === 'string' &&
      cmd.value.length > 10 &&
      cmd.value.length < 200
    ) {
      logger.debug(
        '[TITLE UPDATE DEBUG] Possible title update detected based on value length:',
        {
          field: cmd.field,
          valuePreview: cmd.value.substring(0, 50),
          commandType: cmd.type,
        }
      );
    }

    // Use apiFetch which handles auth and tenant headers for regular project data updates
    // const response = await ChatApiService.updateProjectField(projectId, cmd);

    // const result = response; // No need for .json() as the service handles it
    // logger.log('Successfully executed command:', { cmd, result });
  } catch (error) {
    logger.error('[CommandExecutor] Command execution failed:', error);
    logger.error('Error executing command', { error, command: cmd });
  }
};
