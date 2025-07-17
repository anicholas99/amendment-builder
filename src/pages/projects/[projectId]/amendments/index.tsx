/**
 * Amendments Page - Main entry point for amendment workflow
 * 
 * Route: /projects/[projectId]/amendments
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
import { AuthGuard } from '@/components/AuthGuard';
import ViewLayout from '@/components/layouts/ViewLayout';
import { AmendmentStudio } from '@/features/amendment/components/AmendmentStudio';
import { logger } from '@/server/logger';

// ============ INTERFACES ============

interface AmendmentsPageProps {
  projectId: string;
  projectName?: string;
}

// ============ MAIN COMPONENT ============

const AmendmentsPage: React.FC<AmendmentsPageProps> = ({
  projectId,
  projectName,
}) => {
  const router = useRouter();

  // ============ COMPUTED VALUES ============
  
  const pageTitle = projectName 
    ? `Amendments - ${projectName}` 
    : 'Amendments';

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { 
      label: projectName || 'Project', 
      href: `/projects/${projectId}` 
    },
    { label: 'Amendments', href: `/projects/${projectId}/amendments` },
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

      <AuthGuard>
        <AmendmentStudio 
          projectId={projectId}
        />
      </AuthGuard>
    </>
  );
};

// ============ SERVER-SIDE PROPS ============

export const getServerSideProps: GetServerSideProps<AmendmentsPageProps> = async (context) => {
  const { projectId } = context.params as { projectId: string };

  if (!projectId) {
    logger.warn('[AmendmentsPage] No project ID provided in params');
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
        // projectName: project.name,
      },
    };
  } catch (error) {
    logger.error('[AmendmentsPage] Error loading project data', {
      error: error instanceof Error ? error.message : String(error),
      projectId,
    });

    return {
      props: {
        projectId,
      },
    };
  }
};

export default AmendmentsPage; 