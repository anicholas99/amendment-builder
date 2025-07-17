import React from 'react';
import { Upload, FileText, Image, Layout } from 'lucide-react';

interface TechnologyQuickActionsProps {
  onUploadClick: () => void;
}

export const TechnologyQuickActions: React.FC<TechnologyQuickActionsProps> = ({
  onUploadClick,
}) => {
  return (
    <div className="w-full hidden md:block">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Upload Documents Card */}
        <div
          className="p-3 border border-border rounded-lg cursor-pointer transition-all duration-150 hover:shadow-sm hover:border-blue-300 hover:-translate-y-0.5 bg-card"
          onClick={onUploadClick}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onUploadClick();
            }
          }}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-foreground">
              Upload Documents
            </span>
          </div>
        </div>

        {/* Upload Figures Card */}
        <div
          className="p-3 border border-border rounded-lg cursor-pointer transition-all duration-150 hover:shadow-sm hover:border-purple-300 hover:-translate-y-0.5 bg-card"
          onClick={onUploadClick}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onUploadClick();
            }
          }}
        >
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-foreground">
              Upload Figures
            </span>
          </div>
        </div>

        {/* Template Card - Coming Soon */}
        <div className="p-3 border border-border rounded-lg bg-card opacity-60 cursor-not-allowed">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-muted-foreground">
              Template (coming soon)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
