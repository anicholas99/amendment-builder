import React, { useState } from 'react';
import { Upload, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OfficeActionUpload } from './OfficeActionUpload';
import { USPTOOfficeActionFetcher } from './USPTOOfficeActionFetcher';

interface EnhancedOfficeActionUploadProps {
  projectId: string;
  onUploadComplete?: (officeAction: any) => void;
  disabled?: boolean;
  defaultTab?: 'upload' | 'uspto';
}

/**
 * Enhanced Office Action Upload Component
 * Provides both manual upload and USPTO fetching capabilities
 */
export const EnhancedOfficeActionUpload: React.FC<EnhancedOfficeActionUploadProps> = ({
  projectId,
  onUploadComplete,
  disabled = false,
  defaultTab = 'upload',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </TabsTrigger>
        <TabsTrigger value="uspto" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Fetch from USPTO
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" className="mt-4">
        <OfficeActionUpload
          projectId={projectId}
          onUploadComplete={onUploadComplete}
          disabled={disabled}
        />
      </TabsContent>
      
      <TabsContent value="uspto" className="mt-4">
        <USPTOOfficeActionFetcher
          projectId={projectId}
          onFetchComplete={onUploadComplete}
          disabled={disabled}
        />
      </TabsContent>
    </Tabs>
  );
};