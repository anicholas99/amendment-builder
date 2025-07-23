/**
 * Claims Document Preview - CLM Document for USPTO Filing
 * 
 * Shows amended claims in USPTO-compliant format suitable for official filing
 * Follows existing component patterns and design system
 */

import React from 'react';
import { cn } from '@/lib/utils';
import LegitimateClaimViewer from './LegitimateClaimViewer';

interface ClaimAmendment {
  id: string;
  claimNumber: string;
  status: 'CURRENTLY_AMENDED' | 'PREVIOUSLY_PRESENTED' | 'NEW' | 'CANCELLED';
  originalText: string;
  amendedText: string;
  reasoning: string;
}

interface ClaimsDocumentPreviewProps {
  claimAmendments: ClaimAmendment[];
  applicationNumber?: string;
  mailingDate?: string;
  examinerName?: string;
  artUnit?: string;
  className?: string;
}

export const ClaimsDocumentPreview: React.FC<ClaimsDocumentPreviewProps> = ({
  claimAmendments,
  applicationNumber,
  mailingDate,
  examinerName,
  artUnit,
  className,
}) => {
  return (
    <div className={cn('bg-gray-50', className)}>
      <div className="p-6">
        {/* Document container with proper page styling */}
        <div className="max-w-[8.5in] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Document content with proper margins */}
            <div className="p-12 text-black" style={{ 
              fontFamily: 'Times, serif',
              fontSize: '12pt',
              lineHeight: '1.6'
            }}>
              {/* Document Header */}
              <div className="mb-8">
                {/* Application Number - Top Right */}
                <div className="text-right mb-6">
                  <p className="text-sm">
                    <span className="font-bold">Application No.:</span> {applicationNumber || '[APPLICATION NUMBER]'}
                  </p>
                </div>
                
                {/* Main Title - Centered */}
                <div className="text-center mb-8">
                  <p className="text-xl font-bold underline">CLAIM AMENDMENTS</p>
                </div>

                {/* Introductory Text */}
                <div className="text-left mb-6">
                  <p className="text-justify">
                    This listing of the claims will replace all prior versions of the claims in the application:
                  </p>
                </div>
              </div>

              {/* Claims Content */}
              {claimAmendments.length > 0 && (
                <div className="mb-10">
                  {claimAmendments.map(claim => (
                    <div key={claim.id} className="mb-8">
                      <LegitimateClaimViewer
                        claimNumber={claim.claimNumber}
                        amendedText={claim.amendedText}
                        originalText={claim.originalText}
                        status={claim.status}
                      />
                      
                      {claim.reasoning && claim.status === 'CURRENTLY_AMENDED' && (
                        <div className="pl-8 mb-6">
                          <p className="text-sm font-bold mb-2">Amendment Basis:</p>
                          <p className="text-sm text-justify leading-relaxed">{claim.reasoning}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No claims message */}
              {claimAmendments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No Claim Amendments</p>
                  <p className="text-sm">Claims will appear here once amendments are generated</p>
                </div>
              )}

              {/* Document Footer */}
              <div className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-600">
                <div className="text-center">
                  <p>
                    Claims Document Generated: {new Date().toLocaleDateString()} | 
                    Page 1 of 1 | 
                    Claim Count: {claimAmendments.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ClaimsDocumentPreview; 