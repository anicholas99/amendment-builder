/**
 * Remarks Document Preview - REM Document for USPTO Filing
 * 
 * Shows legal arguments in USPTO-compliant format suitable for official filing
 * Follows existing component patterns and design system
 */

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ArgumentSection {
  id: string;
  title: string;
  content: string;
  type: string;
  rejectionId?: string;
}

interface RemarksDocumentPreviewProps {
  argumentSections: ArgumentSection[];
  responseType?: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
  applicationNumber?: string;
  mailingDate?: string;
  examinerName?: string;
  artUnit?: string;
  className?: string;
}

export const RemarksDocumentPreview: React.FC<RemarksDocumentPreviewProps> = ({
  argumentSections,
  responseType = 'AMENDMENT',
  applicationNumber,
  mailingDate,
  examinerName,
  artUnit,
  className,
}) => {
  return (
    <div className={cn('h-full bg-gray-50', className)}>
      <ScrollArea className="h-full">
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
              <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                <div className="mb-4">
                  <p className="text-sm font-bold">IN THE UNITED STATES PATENT AND TRADEMARK OFFICE</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 text-left text-sm mb-4">
                  <div>
                    <p><span className="font-bold">Applicant:</span> [APPLICANT NAME]</p>
                    <p><span className="font-bold">Application No.:</span> {applicationNumber || '[APPLICATION NUMBER]'}</p>
                    <p><span className="font-bold">Filing Date:</span> [FILING DATE]</p>
                  </div>
                  <div>
                    <p><span className="font-bold">Art Unit:</span> {artUnit || '[ART UNIT]'}</p>
                    <p><span className="font-bold">Examiner:</span> {examinerName || '[EXAMINER NAME]'}</p>
                    <p><span className="font-bold">Confirmation No.:</span> [CONFIRMATION NO.]</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-bold">REMARKS</p>
                  <p className="text-sm mt-2">({responseType} Response to Office Action)</p>
                </div>
              </div>

              {/* Remarks Content */}
              {argumentSections.length > 0 && (
                <div className="mb-10">
                  <div className="mb-6">
                    <p className="text-justify">
                      Applicant respectfully submits the following remarks in response to the Office Action. 
                      The rejections are respectfully traversed for the reasons set forth below.
                    </p>
                  </div>
                  
                  {argumentSections.map((section, index) => (
                    <div key={section.id} className="mb-8">
                      <h3 className="font-bold mb-4 text-lg">
                        {String.fromCharCode(65 + index)}. {section.title}
                      </h3>
                      <div className="pl-6 text-justify whitespace-pre-wrap leading-relaxed">
                        {section.content || '[Content will be added when arguments are drafted]'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No arguments message */}
              {argumentSections.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No Remarks Sections</p>
                  <p className="text-sm">Legal arguments will appear here once drafted</p>
                </div>
              )}

              {/* Conclusion */}
              {argumentSections.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold mb-4 text-lg">CONCLUSION</h3>
                  <div className="pl-6 text-justify">
                    <p>
                      In view of the above remarks, Applicant respectfully submits that the claims are in 
                      condition for allowance and requests that the Examiner withdraw the rejections and 
                      allow the application to issue as a patent.
                    </p>
                    <br />
                    <p>Respectfully submitted,</p>
                    <br />
                    <br />
                    <p>_________________________</p>
                    <p>[ATTORNEY NAME]<br />
                    Registration No. [REG NO]<br />
                    Attorney for Applicant</p>
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <div className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-600">
                <div className="text-center">
                  <p>
                    Remarks Document Generated: {new Date().toLocaleDateString()} | 
                    Page 1 of 1 | 
                    Argument Sections: {argumentSections.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default RemarksDocumentPreview; 