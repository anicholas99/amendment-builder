/**
 * Amendment Studio Page - Individual Amendment Workspace (Tenant Route)
 * 
 * Route: /[tenant]/projects/[projectId]/amendments/studio?amendmentId=[amendmentId]
 * 
 * Provides focused workspace for individual amendment projects with:
 * - Office Action analysis
 * - AI-assisted response generation
 * - Draft editing and refinement
 * - Export capabilities
 */

import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AuthGuard } from '@/components/AuthGuard';
import { AmendmentStudio } from '@/features/amendment/components/AmendmentStudio';
import { logger } from '@/server/logger';

// ============ INTERFACES ============

interface AmendmentStudioPageProps {
  projectId: string;
  tenantSlug: string;
  projectName?: string;
}

// ============ MAIN COMPONENT ============

const AmendmentStudioPage: React.FC<AmendmentStudioPageProps> = ({
  projectId,
  tenantSlug,
  projectName,
}) => {
  const router = useRouter();
  const { amendmentId } = router.query;

  // ============ COMPUTED VALUES ============
  
  const pageTitle = projectName 
    ? `Amendment Studio - ${projectName}` 
    : 'Amendment Studio';

  // ============ RENDER ============
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta 
          name="description" 
          content="Amendment studio workspace for AI-assisted Office Action responses" 
        />
      </Head>

      <AuthGuard>
        <AmendmentStudio 
          projectId={projectId}
          officeActionId={amendmentId as string}
        />
      </AuthGuard>
    </>
  );
};

// ============ SERVER-SIDE PROPS ============

export const getServerSideProps: GetServerSideProps<AmendmentStudioPageProps> = async (context) => {
  const { projectId, tenant } = context.params as { projectId: string; tenant: string };
  const { amendmentId: queryAmendmentId } = context.query;

  if (!projectId || !tenant) {
    logger.warn('[AmendmentStudioPage] Missing required params', { projectId, tenant });
    return {
      notFound: true,
    };
  }

  if (!queryAmendmentId) {
    logger.warn('[AmendmentStudioPage] No amendment ID provided in query', { projectId, tenant });
    // Redirect to amendments list
    return {
      redirect: {
        destination: `/${tenant}/projects/${projectId}/amendments`,
        permanent: false,
      },
    };
  }

  try {
    // TODO: Fetch project details for title/breadcrumbs
    // const project = await getProjectById(projectId, user.tenantId);
    // if (!project) {
    //   return { notFound: true };
    // }

    // TODO: Validate amendment/office action exists
    // const amendmentId = queryAmendmentId as string;
    // const officeActionId = amendmentId.replace('amendment-', '');
    // const officeAction = await getOfficeActionById(officeActionId, user.tenantId);
    // if (!officeAction) {
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
    logger.error('[AmendmentStudioPage] Error loading project data', {
      error: error instanceof Error ? error.message : String(error),
      projectId,
      tenant,
      amendmentId: queryAmendmentId,
    });

    return {
      props: {
        projectId,
        tenantSlug: tenant,
      },
    };
  }
};

export default AmendmentStudioPage; 