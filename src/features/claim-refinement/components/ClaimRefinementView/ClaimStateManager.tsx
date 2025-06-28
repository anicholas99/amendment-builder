import React from 'react';
import { ClaimStateManagerProps } from '../../types/claimRefinementView';

/**
 * ClaimStateManager - Refactored to be a stateless "prop driller"
 *
 * This component no longer manages any state. Its sole responsibility is to
 * receive handlers from its parent and pass them to its children via the
 * render props pattern. This enforces a single source of truth and simplifies
 * the data flow.
 */
export const ClaimStateManager: React.FC<ClaimStateManagerProps> = ({
  children,
  ...handlers
}) => {
  return <>{children(handlers)}</>;
};

ClaimStateManager.displayName = 'ClaimStateManager';
