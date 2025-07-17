import React from 'react';
import { NextPage } from 'next';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import ToolIntegrationDemo from '@/features/chat/components/ToolIntegrationDemo';

const TestToolIntegrationPage: NextPage = () => {
  return (
    <div className="p-4">
      <SimpleMainPanel
        header={
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Tool Integration Test</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Test the AI tool invocation animations
            </p>
          </div>
        }
      >
        <div className="p-6">
          <ToolIntegrationDemo />
        </div>
      </SimpleMainPanel>
    </div>
  );
};

export default TestToolIntegrationPage;
