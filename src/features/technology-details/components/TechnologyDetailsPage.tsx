import React from 'react';
import ViewLayout from '@/components/layouts/ViewLayout';
import { TechInput } from './TechInput';
import { logger } from '@/utils/clientLogger';

/**
 * TechnologyDetails page - Complete page for technology management
 * Demonstrates how to compose templates with domain components
 */
export interface TechnologyDetailsProps {
  /** Technology data */
  technology?: unknown;
  /** Loading state */
  loading?: boolean;
}

export const TechnologyDetails: React.FC<TechnologyDetailsProps> = ({
  technology,
  loading = false,
}) => {
  const handleTechSubmit = (value: string) => {
    logger.info('Technology submitted', { valueLength: value.length });
    // Handle technology submission
  };

  return (
    <ViewLayout
      header={
        <h1 className="text-xl font-bold text-foreground">
          Technology Details
        </h1>
      }
      mainContent={
        <TechInput
          initialValue={(technology as { description?: string })?.description}
          onSubmit={handleTechSubmit}
          loading={loading}
        />
      }
      sidebarContent={null}
      isResizable={false}
    />
  );
};

TechnologyDetails.displayName = 'TechnologyDetails';
