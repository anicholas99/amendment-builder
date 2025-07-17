import React from 'react';
import { cn } from '@/lib/utils';

interface VerificationResultsProps {
  verificationResults: {
    elementDiscrepancies: string[];
    claimDiscrepancies: string[];
    figureDiscrepancies: string[];
  };
}

const VerificationResults: React.FC<VerificationResultsProps> = ({
  verificationResults,
}) => {
  const hasDiscrepancies =
    verificationResults.elementDiscrepancies.length > 0 ||
    verificationResults.claimDiscrepancies.length > 0 ||
    verificationResults.figureDiscrepancies.length > 0;

  if (!hasDiscrepancies) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-4 p-4 border border-orange-300 rounded-md bg-orange-50 dark:bg-orange-950/20 dark:border-orange-700'
      )}
    >
      <h3 className="text-lg font-semibold mb-2 text-orange-900 dark:text-orange-100">
        Verification Results
      </h3>

      {verificationResults.elementDiscrepancies.length > 0 && (
        <div className="mb-3">
          <p className="font-normal text-orange-800 dark:text-orange-200 mb-2">
            Element Discrepancies:
          </p>
          <ul className="my-2 pl-5 space-y-1">
            {verificationResults.elementDiscrepancies.map(
              (discrepancy, index) => (
                <li
                  key={index}
                  className="text-orange-800 dark:text-orange-200 list-disc"
                >
                  {discrepancy}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {verificationResults.figureDiscrepancies.length > 0 && (
        <div className="mb-3">
          <p className="font-normal text-orange-800 dark:text-orange-200 mb-2">
            Figure Discrepancies:
          </p>
          <ul className="my-2 pl-5 space-y-1">
            {verificationResults.figureDiscrepancies.map(
              (discrepancy, index) => (
                <li
                  key={index}
                  className="text-orange-800 dark:text-orange-200 list-disc"
                >
                  {discrepancy}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {verificationResults.claimDiscrepancies.length > 0 && (
        <div>
          <p className="font-normal text-orange-800 dark:text-orange-200 mb-2">
            Claim Discrepancies:
          </p>
          <ul className="my-2 pl-5 space-y-1">
            {verificationResults.claimDiscrepancies.map(
              (discrepancy, index) => (
                <li
                  key={index}
                  className="text-orange-800 dark:text-orange-200 list-disc"
                >
                  {discrepancy}
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VerificationResults;
