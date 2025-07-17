import React from 'react';
import { Edit3 } from 'lucide-react';

export const TechnologyWelcomeSection: React.FC = () => {
  return (
    <>
      {/* Desktop Welcome - Clean and professional */}
      <div className="text-center max-w-3xl mx-auto pt-2 pb-2 hidden md:block">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <Edit3 className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">
              Describe Your Invention
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-tight px-4">
            Type or paste your invention description below, or drag and drop
            documents (PDF, DOCX, TXT, Images)
          </p>
        </div>
      </div>

      {/* Mobile Header - Clean */}
      <div className="block md:hidden w-full pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center gap-2">
            <Edit3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Describe Your Invention
            </h2>
          </div>
          <p className="text-xs text-muted-foreground px-4 text-center">
            Type, paste, or upload documents
          </p>
        </div>
      </div>
    </>
  );
};
