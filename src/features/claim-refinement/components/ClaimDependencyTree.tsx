import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface ClaimDependencyTreeProps {
  claims: Record<string, string>;
}

const ClaimDependencyTree: React.FC<ClaimDependencyTreeProps> = ({
  claims,
}) => {
  // Parse claim dependencies
  const dependencies: Record<string, string[]> = {};
  const independentClaims: string[] = [];

  // Identify independent and dependent claims
  Object.entries(claims).forEach(([number, text]) => {
    if (text.toLowerCase().includes('claim')) {
      // Extract dependency
      const match = text.match(/claim\s+(\d+)/i);
      if (match && match[1]) {
        const parentClaim = match[1];
        if (!dependencies[parentClaim]) {
          dependencies[parentClaim] = [];
        }
        dependencies[parentClaim].push(number);
      } else {
        independentClaims.push(number);
      }
    } else {
      independentClaims.push(number);
    }
  });

  // Render the tree
  const renderClaimBranch = (claimNumber: string, level: number = 0) => {
    const dependents = dependencies[claimNumber] || [];

    return (
      <div
        key={claimNumber}
        className={`mb-4`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-start space-x-2">
          {level > 0 && <FiArrowRight className="w-4 h-4 text-blue-500 mt-4" />}
          <div
            className={`p-4 border rounded-md w-full ${
              level === 0
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-muted bg-background'
            }`}
          >
            <p className={level === 0 ? 'font-bold' : 'font-normal'}>
              Claim {claimNumber}: {claims[claimNumber].substring(0, 100)}
              {claims[claimNumber].length > 100 ? '...' : ''}
            </p>
          </div>
        </div>

        {dependents.length > 0 && (
          <div className="flex flex-col space-y-2 mt-2">
            {dependents.map(dep => renderClaimBranch(dep, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Claim Dependency Structure</h2>
      <div className="flex flex-col space-y-4">
        {independentClaims.map(claim => renderClaimBranch(claim))}
      </div>
    </div>
  );
};

export default ClaimDependencyTree;
