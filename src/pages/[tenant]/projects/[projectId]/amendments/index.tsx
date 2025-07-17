/**
 * Amendments Page - Main entry point for amendment workflow (Tenant Route)
 * 
 * Route: /[tenant]/projects/[projectId]/amendments
 * 
 * Integrates with existing project navigation and provides access to:
 * - Office Action upload and management
 * - Amendment generation and editing
 * - Export functionality
 */

import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AppLayout from '@/components/layouts/AppLayout';
import { AmendmentStudio } from '@/features/amendment/components/AmendmentStudio';
import { logger } from '@/server/logger';

// ============ INTERFACES ============

interface AmendmentsPageProps {
  projectId: string;
  tenantSlug: string;
  projectName?: string;
}

// ============ MAIN COMPONENT ============

const AmendmentsPage: React.FC<AmendmentsPageProps> = ({
  projectId,
  tenantSlug,
  projectName,
}) => {
  const router = useRouter();

  // ============ COMPUTED VALUES ============
  
  const pageTitle = projectName 
    ? `Amendments - ${projectName}` 
    : 'Amendments';

  const breadcrumbs = [
    { label: 'Projects', href: `/${tenantSlug}/projects` },
    { 
      label: projectName || 'Project', 
      href: `/${tenantSlug}/projects/${projectId}` 
    },
    { label: 'Amendments', href: `/${tenantSlug}/projects/${projectId}/amendments` },
  ];

  // ============ RENDER ============
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta 
          name="description" 
          content="Generate amendment responses to Office Actions with AI assistance" 
        />
      </Head>

      <AppLayout>
        <AmendmentStudio 
          projectId={projectId}
        />
      </AppLayout>
    </>
  );
};

// ============ SERVER-SIDE PROPS ============

export const getServerSideProps: GetServerSideProps<AmendmentsPageProps> = async (context) => {
  const { projectId, tenant } = context.params as { projectId: string; tenant: string };

  if (!projectId || !tenant) {
    logger.warn('[AmendmentsPage] Missing required params', { projectId, tenant });
    return {
      notFound: true,
    };
  }

  try {
    // TODO: Fetch project details for title/breadcrumbs
    // const project = await getProjectById(projectId, user.tenantId);
    // if (!project) {
    //   return { notFound: true };
    // }

    return {
      props: {
        projectId,
        tenantSlug: tenant,
        // projectName: project.name,
      },
    };
  } catch (error) {
    logger.error('[AmendmentsPage] Error loading project data', {
      error: error instanceof Error ? error.message : String(error),
      projectId,
      tenant,
    });

    return {
      props: {
        projectId,
        tenantSlug: tenant,
      },
    };
  }
};

export default AmendmentsPage; 