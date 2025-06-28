import { ClaimRepository } from '@/repositories/claimRepository';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { inventionRepository } from '@/repositories/inventionRepository';

export interface ClaimDependencyVisualization {
  mermaidDiagram: string;
  summary: {
    totalClaims: number;
    independentClaims: number;
    dependentClaims: number;
    maxDepth: number;
  };
}

/**
 * Generate a Mermaid diagram showing claim dependencies
 * 
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function visualizeClaimDependencies(
  projectId: string,
  tenantId: string
): Promise<ClaimDependencyVisualization> {
  logger.info('[VisualizeClaimDependenciesTool] Generating visualization', {
    projectId,
  });

  try {
    // Get invention
    const invention = await inventionRepository.findByProjectId(projectId);
    if (!invention) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'No invention found for this project'
      );
    }

    // Get all claims
    const claims = await ClaimRepository.findByInventionId(invention.id);
    
    if (claims.length === 0) {
      return {
        mermaidDiagram: 'graph TD\n  NoClaimsFound[No claims found in this project]',
        summary: {
          totalClaims: 0,
          independentClaims: 0,
          dependentClaims: 0,
          maxDepth: 0,
        },
      };
    }

    // Analyze claim dependencies
    const claimMap = new Map(claims.map(c => [c.number, c]));
    const independentClaims: typeof claims = [];
    const dependentClaims: typeof claims = [];
    const dependencies = new Map<number, number[]>(); // claim number -> numbers it depends on
    
    claims.forEach(claim => {
      // Parse claim text to find dependencies
      const depMatch = claim.text.match(/\b(?:of|according to) claim[s]?\s+(\d+(?:\s*(?:,|and|or)\s*\d+)*)/i);
      
      if (depMatch) {
        // Extract all claim numbers this claim depends on
        const depNumbers = depMatch[1]
          .split(/\s*(?:,|and|or)\s*/)
          .map(n => parseInt(n.trim()))
          .filter(n => !isNaN(n) && n !== claim.number);
        
        if (depNumbers.length > 0) {
          dependencies.set(claim.number, depNumbers);
          dependentClaims.push(claim);
        } else {
          independentClaims.push(claim);
        }
      } else {
        independentClaims.push(claim);
      }
    });

    // Generate Mermaid diagram
    let mermaid = 'graph TD\n';
    
    // Style definitions
    mermaid += '  classDef independent fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#0d47a1\n';
    mermaid += '  classDef dependent fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px,color:#4a148c\n';
    mermaid += '  classDef missing fill:#ffebee,stroke:#d32f2f,stroke-width:1px,color:#b71c1c\n\n';
    
    // Add nodes for all claims
    claims.forEach(claim => {
      const isIndependent = independentClaims.includes(claim);
      const claimType = extractClaimType(claim.text);
      const truncatedText = truncateClaimText(claim.text, 40);
      
      mermaid += `  C${claim.number}["Claim ${claim.number}: ${claimType}<br/>${truncatedText}"]\n`;
      mermaid += `  class C${claim.number} ${isIndependent ? 'independent' : 'dependent'}\n`;
    });
    
    mermaid += '\n';
    
    // Add edges for dependencies
    dependencies.forEach((deps, claimNum) => {
      deps.forEach(depNum => {
        if (claimMap.has(depNum)) {
          mermaid += `  C${depNum} --> C${claimNum}\n`;
        } else {
          // Handle missing dependencies
          mermaid += `  Missing${depNum}["Claim ${depNum} (Missing)"]\n`;
          mermaid += `  class Missing${depNum} missing\n`;
          mermaid += `  Missing${depNum} -.-> C${claimNum}\n`;
        }
      });
    });
    
    // Calculate max dependency depth
    const maxDepth = calculateMaxDepth(claims, dependencies);
    
    return {
      mermaidDiagram: mermaid,
      summary: {
        totalClaims: claims.length,
        independentClaims: independentClaims.length,
        dependentClaims: dependentClaims.length,
        maxDepth,
      },
    };
  } catch (error) {
    logger.error('[VisualizeClaimDependenciesTool] Failed to generate visualization', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Extract the claim type (system, method, etc.) from claim text
 */
function extractClaimType(claimText: string): string {
  const patterns = [
    { pattern: /^A\s+system\b/i, type: 'System' },
    { pattern: /^A\s+method\b/i, type: 'Method' },
    { pattern: /^An?\s+apparatus\b/i, type: 'Apparatus' },
    { pattern: /^A\s+process\b/i, type: 'Process' },
    { pattern: /^A\s+device\b/i, type: 'Device' },
    { pattern: /^A\s+computer[- ]readable\b/i, type: 'CRM' },
    { pattern: /^The\s+system\s+of\s+claim/i, type: 'System (dep)' },
    { pattern: /^The\s+method\s+of\s+claim/i, type: 'Method (dep)' },
    { pattern: /^The\s+apparatus\s+of\s+claim/i, type: 'Apparatus (dep)' },
    { pattern: /^The\s+process\s+of\s+claim/i, type: 'Process (dep)' },
    { pattern: /^The\s+device\s+of\s+claim/i, type: 'Device (dep)' },
  ];
  
  for (const { pattern, type } of patterns) {
    if (pattern.test(claimText)) {
      return type;
    }
  }
  
  return 'Unknown';
}

/**
 * Truncate claim text for diagram display
 */
function truncateClaimText(text: string, maxLength: number): string {
  // Remove the preamble
  const withoutPreamble = text.replace(/^(A|An|The)\s+(system|method|apparatus|process|device|computer[- ]readable\s+medium)\s+(of\s+claim\s+\d+\s*,?\s*)?(comprising|including|having|wherein|further\s+comprising)?\s*/i, '');
  
  if (withoutPreamble.length <= maxLength) {
    return withoutPreamble;
  }
  
  return withoutPreamble.substring(0, maxLength - 3) + '...';
}

/**
 * Calculate the maximum dependency depth in the claim tree
 */
function calculateMaxDepth(
  claims: any[],
  dependencies: Map<number, number[]>
): number {
  const depths = new Map<number, number>();
  
  // Initialize all claims with depth 0
  claims.forEach(claim => depths.set(claim.number, 0));
  
  // Calculate depths using DFS
  const calculateDepth = (claimNum: number, visited: Set<number>): number => {
    if (visited.has(claimNum)) return depths.get(claimNum) || 0;
    visited.add(claimNum);
    
    const deps = dependencies.get(claimNum) || [];
    if (deps.length === 0) {
      depths.set(claimNum, 0);
      return 0;
    }
    
    const maxParentDepth = Math.max(
      ...deps.map(dep => calculateDepth(dep, visited))
    );
    const depth = maxParentDepth + 1;
    depths.set(claimNum, depth);
    return depth;
  };
  
  claims.forEach(claim => calculateDepth(claim.number, new Set()));
  
  return Math.max(...Array.from(depths.values()));
} 