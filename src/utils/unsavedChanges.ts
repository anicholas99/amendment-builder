/**
 * Unsaved Changes Detection System
 *
 * Provides functionality to detect unsaved changes and warn users
 * before navigating away or refreshing the page.
 */

import { logger } from '@/utils/clientLogger';

// Flag to track if there are unsaved changes
let hasUnsavedChanges = false;

// Check for browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Set up the beforeunload event handler to warn when navigating away with unsaved changes
 */
export function setupUnsavedChangesWarning(): void {
  if (!isBrowser) return;

  // Remove any existing listener to prevent duplicates
  cleanupUnsavedChangesWarning();

  // Add the beforeunload event listener
  window.addEventListener('beforeunload', handleBeforeUnload);

  logger.debug('Unsaved changes warning system initialized');
}

/**
 * Clean up the beforeunload event handler
 */
export function cleanupUnsavedChangesWarning(): void {
  if (!isBrowser) return;

  // Remove event listener
  window.removeEventListener('beforeunload', handleBeforeUnload);

  logger.debug('Unsaved changes warning system cleaned up');
}

/**
 * Handle the beforeunload event
 * @param event The beforeunload event
 */
const handleBeforeUnload = (event: BeforeUnloadEvent): string | undefined => {
  if (hasUnsavedChanges) {
    // Standard way to show a confirmation dialog when navigating away
    const message = 'You have unsaved changes. Are you sure you want to leave?';
    event.preventDefault();
    event.returnValue = message; // Required for Chrome
    return message; // Required for other browsers
  }
  return undefined;
};

/**
 * Set whether there are unsaved changes
 * @param value Whether there are unsaved changes
 */
export const setUnsavedChanges = (value: boolean): void => {
  hasUnsavedChanges = value;
  logger.debug(`Unsaved changes status set to: ${value}`);
};

/**
 * Check if there are unsaved changes
 * @returns Whether there are unsaved changes
 */
export const getUnsavedChanges = (): boolean => {
  return hasUnsavedChanges;
};

/**
 * Clear the unsaved changes flag
 */
export const clearUnsavedChanges = (): void => {
  hasUnsavedChanges = false;
  logger.debug('Unsaved changes cleared');
};

/**
 * Confirm navigation when there are unsaved changes
 * @param message Custom message to display
 * @returns Whether navigation was confirmed
 */
export const confirmNavigationWithUnsavedChanges = (
  message: string = 'You have unsaved changes. Are you sure you want to leave this page?'
): boolean => {
  if (!hasUnsavedChanges) return true;

  return window.confirm(message);
};

/**
 * Higher-order function to wrap event handlers to check for unsaved changes
 * @param handler The handler function to wrap
 * @param confirmMessage The message to display in the confirmation dialog
 * @returns The wrapped handler
 */
export const withUnsavedChangesCheck = <
  T extends (...args: never[]) => unknown,
>(
  handler: T,
  confirmMessage: string = 'You have unsaved changes. Are you sure you want to proceed?'
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    if (hasUnsavedChanges) {
      if (window.confirm(confirmMessage)) {
        // Proceed with the action
        return handler(...args) as ReturnType<T>;
      }
      // User cancelled
      return undefined;
    }
    // No unsaved changes, proceed normally
    return handler(...args) as ReturnType<T>;
  };
};
