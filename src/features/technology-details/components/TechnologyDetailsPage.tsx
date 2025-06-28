import React from 'react';
import { DashboardLayout } from '@/ui/templates/DashboardLayout';
import { Text } from '@chakra-ui/react';
import { TechInput } from './TechInput';
import { logger } from '@/lib/monitoring/logger';

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
    <DashboardLayout
      header={
        <Text variant="label" fontSize="xl" fontWeight="bold">
          Technology Details
        </Text>
      }
      main={
        <TechInput
          initialValue={(technology as { description?: string })?.description}
          onSubmit={handleTechSubmit}
          loading={loading}
        />
      }
    />
  );
};

TechnologyDetails.displayName = 'TechnologyDetails';
