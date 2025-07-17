import React from 'react';
import { FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

export interface ReferenceJobStatus {
  referenceNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  isHighRelevance?: boolean;
  hasDeepAnalysis?: boolean;
  hasExaminerAnalysis?: boolean;
  hasHighImportanceFindings?: boolean;
}

interface ReferenceBadgesProps {
  referenceJobStatuses: ReferenceJobStatus[];
  selectedReference: string | null;
  onSelectReference: (refNumber: string | null) => void;
}

export const ReferenceBadges: React.FC<ReferenceBadgesProps> = ({
  referenceJobStatuses,
  selectedReference,
  onSelectReference,
}) => {
  const { isDarkMode } = useThemeContext();

  if (referenceJobStatuses.length === 0) {
    return null;
  }

  const getStatusIcon = (status: ReferenceJobStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'processing':
        return <AlertCircle className="w-3 h-3 text-blue-500" />;
      default:
        return <FileText className="w-3 h-3 text-gray-500" />;
    }
  };

  const getStatusColor = (
    status: ReferenceJobStatus['status'],
    isSelected: boolean
  ) => {
    if (isSelected) {
      return isDarkMode
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-blue-100 text-blue-800 border-blue-200';
    }

    switch (status) {
      case 'completed':
        return isDarkMode
          ? 'bg-green-900/30 text-green-300 border-green-600'
          : 'bg-green-50 text-green-800 border-green-200';
      case 'failed':
        return isDarkMode
          ? 'bg-red-900/30 text-red-300 border-red-600'
          : 'bg-red-50 text-red-800 border-red-200';
      case 'processing':
        return isDarkMode
          ? 'bg-blue-900/30 text-blue-300 border-blue-600'
          : 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return isDarkMode
          ? 'bg-gray-800 text-gray-300 border-gray-600'
          : 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {referenceJobStatuses.map(jobStatus => {
        const isSelected = selectedReference === jobStatus.referenceNumber;

        return (
          <Button
            key={jobStatus.referenceNumber}
            variant="outline"
            size="sm"
            onClick={() => onSelectReference(jobStatus.referenceNumber)}
            className={cn(
              'flex items-center gap-1 relative',
              getStatusColor(jobStatus.status, isSelected)
            )}
          >
            {getStatusIcon(jobStatus.status)}
            {jobStatus.referenceNumber}

            {/* High relevance indicator */}
            {jobStatus.isHighRelevance && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 border border-white" />
            )}

            {/* Deep analysis indicator */}
            {jobStatus.hasDeepAnalysis && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 border border-white" />
            )}

            {/* Examiner analysis indicator */}
            {jobStatus.hasExaminerAnalysis && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 border border-white" />
            )}

            {/* High importance findings indicator */}
            {jobStatus.hasHighImportanceFindings && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 border border-white" />
            )}
          </Button>
        );
      })}
    </div>
  );
};
