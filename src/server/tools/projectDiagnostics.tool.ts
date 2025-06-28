import { getProjectDiagnostics } from '@/repositories/project/diagnostics.repository';

/**
 * Diagnostic tool to help identify data structure issues
 * Useful when claims or invention data appears to be missing
 */
export async function runProjectDiagnostics(
  projectId: string,
  tenantId: string
) {
  const diagnostics = await getProjectDiagnostics(projectId, tenantId);

  // Transform into user-friendly format
  const result = {
    summary: '',
    details: diagnostics,
    recommendations: [] as string[],
  };

  if (!diagnostics.projectExists) {
    result.summary = 'Project not found or access denied.';
    return result;
  }

  // Type guard - if we're here, diagnostics has full shape
  if (!('hasInvention' in diagnostics)) {
    result.summary = 'Unexpected diagnostic format.';
    return result;
  }

  if (!diagnostics.hasInvention) {
    result.summary = 'No invention record exists for this project yet.';
    result.recommendations.push(
      'An invention record needs to be created for this project before claims can be added.',
      'This usually happens when you first upload or process an invention disclosure.'
    );
  } else if (diagnostics.claimsDirectQuery === 0) {
    result.summary = `Invention exists (ID: ${diagnostics.inventionId}) but has no claims linked to it.`;
    result.recommendations.push(
      'Claims need to be created and linked to the invention.',
      'This typically happens through the claim generation or editing process.'
    );
  } else {
    result.summary = `Found ${diagnostics.claimsDirectQuery} claims linked to the invention.`;
    if (diagnostics.issues.length > 0) {
      result.summary += ' However, there are some data consistency issues.';
      result.recommendations.push(...diagnostics.issues);
    }
  }

  return result;
}
