import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CitationJob } from '@/features/search/hooks/useCitationJobs';

interface HistoricalViewBannerProps {
  viewingJobId: string;
  allCitationJobs: CitationJob[];
  onReturnToLatest: () => void;
}

export const HistoricalViewBanner: React.FC<HistoricalViewBannerProps> = ({
  viewingJobId,
  allCitationJobs,
  onReturnToLatest,
}) => {
  const job = allCitationJobs.find(j => j.id === viewingJobId);

  if (!job) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 p-2 border-b border-blue-200 dark:border-blue-800">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Viewing historical extraction from{' '}
            {new Date(job.createdAt).toLocaleString()}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onReturnToLatest}
          className="h-6 px-3 text-xs border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
        >
          Return to Latest
        </Button>
      </div>
    </div>
  );
};
