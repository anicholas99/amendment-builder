/**
 * ASMB Preview Component
 * 
 * Displays the Amendment Submission Boilerplate (ASMB) in USPTO-compliant format.
 * This is the first page/cover page of amendment submissions.
 */

import React, { useEffect, useState } from 'react';
import { Card } from '@chakra-ui/react';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { ASMBData, ASMBDataService } from '@/services/api/asmbDataService';
import { logger } from '@/utils/clientLogger';
import { MinimalSpinner } from '@/components/common/MinimalSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ASMBPreviewProps {
  projectId: string;
  officeActionId: string;
  submissionType?: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
  className?: string;
  showHeader?: boolean; // Control whether to show the header
}

export const ASMBPreview: React.FC<ASMBPreviewProps> = ({
  projectId,
  officeActionId,
  submissionType = 'AMENDMENT',
  className,
  showHeader = true,
}) => {
  const [asmbData, setAsmbData] = useState<ASMBData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsmbData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await ASMBDataService.getASMBData(
          projectId,
          officeActionId,
          submissionType
        );
        
        setAsmbData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load ASMB data';
        logger.error('[ASMBPreview] Failed to fetch ASMB data', { err, projectId, officeActionId });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId && officeActionId) {
      fetchAsmbData();
    }
  }, [projectId, officeActionId, submissionType]);

  if (isLoading) {
    if (!showHeader) {
      return (
        <div className={cn('bg-gray-50', className)}>
          <div className="p-6">
            <div className="max-w-[8.5in] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="flex justify-center items-center h-64">
                <MinimalSpinner size="lg" message="Loading ASMB data..." center />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <SimpleMainPanel
        header={
          <div className="p-4">
            <h2 className="text-xl font-bold">ASMB Preview</h2>
          </div>
        }
        contentPadding={true}
        className={className}
      >
        <div className="flex justify-center items-center h-64">
          <MinimalSpinner size="lg" message="Loading ASMB data..." center />
        </div>
      </SimpleMainPanel>
    );
  }

  if (error) {
    if (!showHeader) {
      return (
        <div className={cn('bg-gray-50', className)}>
          <div className="p-6">
            <div className="max-w-[8.5in] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-12">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <SimpleMainPanel
        header={
          <div className="p-4">
            <h2 className="text-xl font-bold">ASMB Preview</h2>
          </div>
        }
        contentPadding={true}
        className={className}
      >
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </SimpleMainPanel>
    );
  }

  if (!asmbData) {
    if (!showHeader) {
      return (
        <div className={cn('bg-gray-50', className)}>
          <div className="p-6">
            <div className="max-w-[8.5in] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg mb-2">No ASMB Data Available</p>
                <p className="text-sm">ASMB will appear here once office action data is loaded</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <SimpleMainPanel
        header={
          <div className="p-4">
            <h2 className="text-xl font-bold">ASMB Preview</h2>
          </div>
        }
        contentPadding={true}
        className={className}
      >
        <div className="text-center text-gray-500 py-8">
          No ASMB data available
        </div>
      </SimpleMainPanel>
    );
  }

  const formatDate = (date?: Date) => {
    if (!date) return '[DATE]';
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Document content component (styled like Claims/Remarks when no header)
  const documentContent = showHeader ? (
    <div className="p-8 bg-white min-h-full">
      {/* USPTO Header */}
      <div className="text-center mb-8">
        <div className="text-sm font-bold mb-2">
          Application No.: {asmbData.applicationNumber || '[APPLICATION NUMBER]'}
        </div>
        <div className="text-lg font-bold mb-4">
          IN THE UNITED STATES PATENT AND TRADEMARK OFFICE
        </div>
      </div>

      {/* Application Details Table */}
      <div className="mb-8">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="font-bold w-32 py-1">Inventor(s):</td>
              <td className="py-1">
                {ASMBDataService.formatInventors(asmbData.inventors)}
              </td>
            </tr>
            <tr>
              <td className="font-bold py-1">Title:</td>
              <td className="py-1 uppercase">
                {asmbData.title || '[INVENTION TITLE]'}
              </td>
            </tr>
            <tr>
              <td className="font-bold py-1">App. No.:</td>
              <td className="py-1">
                {asmbData.applicationNumber || '[APPLICATION NUMBER]'}
              </td>
              <td className="font-bold w-24 py-1">Filed:</td>
              <td className="py-1">
                {formatDate(asmbData.filingDate)}
              </td>
            </tr>
            <tr>
              <td className="font-bold py-1">Examiner:</td>
              <td className="py-1">
                {asmbData.examinerName || '[EXAMINER NAME]'}
              </td>
              <td className="font-bold py-1">Group Art Unit:</td>
              <td className="py-1">
                {asmbData.artUnit || '[ART UNIT]'}
              </td>
            </tr>
            <tr>
              <td className="font-bold py-1">Customer No.:</td>
              <td className="py-1">
                {asmbData.customerNumber || '[CUSTOMER NUMBER]'}
              </td>
              <td className="font-bold py-1">Confirmation No.:</td>
              <td className="py-1">
                [CONFIRMATION NUMBER]
              </td>
            </tr>
            <tr>
              <td className="font-bold py-1">Atty. Dkt. No.:</td>
              <td className="py-1 colspan-3">
                {asmbData.docketNumber || '[DOCKET NUMBER]'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Correspondence Address */}
      {asmbData.correspondenceAddress && (
        <div className="mb-8">
          <div className="text-sm">
            <div className="font-bold">Mail Stop: [MAIL STOP]</div>
            <div>Commissioner for</div>
            <div>Patents</div>
            <div>P.O. Box 1450</div>
            <div>Alexandria, VA 22313-1450</div>
          </div>
        </div>
      )}

      {/* Submission Statement */}
      <div className="text-center mb-8">
        <div className="font-bold text-sm uppercase">
          {asmbData.submissionStatement}
        </div>
      </div>

      {/* Letter Body */}
      <div className="mb-8">
        <div className="mb-4">Dear Commissioner:</div>
        
        <div className="mb-4 leading-relaxed">
          {submissionType === 'RCE' ? (
            <>
              In response to the Final Office Action dated{' '}
              <strong>{formatDate(asmbData.mailingDate)}</strong> ("Office Action"), 
              please reconsider the above-identified application in light of the 
              following amendments and remarks. Applicant is filing a Request for 
              Continued Examination (RCE) in order to have the present response 
              considered.
            </>
          ) : (
            <>
              In response to the {asmbData.officeActionNumber ? 'Non-Final ' : ''}Office Action dated{' '}
              <strong>{formatDate(asmbData.mailingDate)}</strong> ("Office Action"), 
              please reconsider the above-identified application in light of the 
              following amendments and remarks. Applicant is filing a Response 
              for Continued Examination pursuant to 37 C.F.R. § 1.114 to have 
              the present response considered.
            </>
          )}
        </div>

        <div className="mb-4">
          <strong>Amendments to the Claims</strong> begin on page 2 of this paper.
        </div>
        
        <div className="mb-4">
          <strong>Remarks</strong> begin on page [X] of this paper.
        </div>
      </div>

      {/* Page Footer */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="text-sm text-center">1</div>
      </div>
    </div>
  ) : (
    // Document container with proper page styling (matches Claims/Remarks)
    <div className={cn('bg-gray-50', className)}>
      <div className="p-6">
        <div className="max-w-[8.5in] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-12 text-black" style={{ 
            fontFamily: 'Times, serif',
            fontSize: '12pt',
            lineHeight: '1.6'
          }}>
            {/* USPTO Header */}
            <div className="text-center mb-8">
              <div className="text-sm font-bold mb-2">
                Application No.: {asmbData.applicationNumber || '[APPLICATION NUMBER]'}
              </div>
              <div className="text-lg font-bold mb-4">
                IN THE UNITED STATES PATENT AND TRADEMARK OFFICE
              </div>
            </div>

            {/* Application Details Table */}
            <div className="mb-8">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-bold w-32 py-1">Inventor(s):</td>
                    <td className="py-1">
                      {ASMBDataService.formatInventors(asmbData.inventors)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Title:</td>
                    <td className="py-1 uppercase">
                      {asmbData.title || '[INVENTION TITLE]'}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">App. No.:</td>
                    <td className="py-1">
                      {asmbData.applicationNumber || '[APPLICATION NUMBER]'}
                    </td>
                    <td className="font-bold w-24 py-1">Filed:</td>
                    <td className="py-1">
                      {formatDate(asmbData.filingDate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Examiner:</td>
                    <td className="py-1">
                      {asmbData.examinerName || '[EXAMINER NAME]'}
                    </td>
                    <td className="font-bold py-1">Group Art Unit:</td>
                    <td className="py-1">
                      {asmbData.artUnit || '[ART UNIT]'}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Customer No.:</td>
                    <td className="py-1">
                      {asmbData.customerNumber || '[CUSTOMER NUMBER]'}
                    </td>
                    <td className="font-bold py-1">Confirmation No.:</td>
                    <td className="py-1">
                      [CONFIRMATION NUMBER]
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Atty. Dkt. No.:</td>
                    <td className="py-1 colspan-3">
                      {asmbData.docketNumber || '[DOCKET NUMBER]'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Correspondence Address */}
            {asmbData.correspondenceAddress && (
              <div className="mb-8">
                <div className="text-sm">
                  <div className="font-bold">Mail Stop: [MAIL STOP]</div>
                  <div>Commissioner for</div>
                  <div>Patents</div>
                  <div>P.O. Box 1450</div>
                  <div>Alexandria, VA 22313-1450</div>
                </div>
              </div>
            )}

            {/* Submission Statement */}
            <div className="text-center mb-8">
              <div className="font-bold text-sm uppercase">
                {asmbData.submissionStatement}
              </div>
            </div>

            {/* Letter Body */}
            <div className="mb-8">
              <div className="mb-4">Dear Commissioner:</div>
              
              <div className="mb-4 leading-relaxed">
                {submissionType === 'RCE' ? (
                  <>
                    In response to the Final Office Action dated{' '}
                    <strong>{formatDate(asmbData.mailingDate)}</strong> ("Office Action"), 
                    please reconsider the above-identified application in light of the 
                    following amendments and remarks. Applicant is filing a Request for 
                    Continued Examination (RCE) in order to have the present response 
                    considered.
                  </>
                ) : (
                  <>
                    In response to the {asmbData.officeActionNumber ? 'Non-Final ' : ''}Office Action dated{' '}
                    <strong>{formatDate(asmbData.mailingDate)}</strong> ("Office Action"), 
                    please reconsider the above-identified application in light of the 
                    following amendments and remarks. Applicant is filing a Response 
                    for Continued Examination pursuant to 37 C.F.R. § 1.114 to have 
                    the present response considered.
                  </>
                )}
              </div>

              <div className="mb-4">
                <strong>Amendments to the Claims</strong> begin on page 2 of this paper.
              </div>
              
              <div className="mb-4">
                <strong>Remarks</strong> begin on page [X] of this paper.
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-600">
              <div className="text-center">
                <p>
                  ASMB Document Generated: {new Date().toLocaleDateString()} | 
                  Page 1 of 1 | 
                  Application: {asmbData.applicationNumber || '[APPLICATION NUMBER]'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Return with or without header wrapper
  if (!showHeader) {
    return documentContent;
  }

  return (
    <SimpleMainPanel
      header={
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">ASMB Preview</h2>
          <p className="text-sm text-gray-600 mt-1">
            Amendment Submission Boilerplate - Page 1 of Amendment Response
          </p>
        </div>
      }
      contentPadding={false}
      className={className}
    >
      {documentContent}
    </SimpleMainPanel>
  );
};

export default ASMBPreview; 