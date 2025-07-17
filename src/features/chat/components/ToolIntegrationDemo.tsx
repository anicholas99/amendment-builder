'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolInvocationGroup } from './ToolInvocationGroup';
import { ToolInvocation, ToolStatus } from '../types/tool-invocation';
import { useTimeout } from '@/hooks/useTimeout';

/**
 * Demo component to showcase tool integration animations
 * This demonstrates how tool invocations work in the chat interface
 */
export const ToolIntegrationDemo: React.FC = () => {
  const [invocations, setInvocations] = useState<ToolInvocation[]>([]);
  const [demoStep, setDemoStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Step 1: Initial search invocation
  useTimeout(
    () => {
      if (demoStep === 1) {
        // Step 2: Add analysis tool
        setDemoStep(2);
        const analysisInvocation: ToolInvocation = {
          id: 'demo-analysis-1',
          toolName: 'analyze-claims',
          status: 'pending',
          parameters: [
            { name: 'claimCount', value: 3 },
            { name: 'depth', value: 'detailed' },
          ],
          startTime: Date.now(),
        };
        setInvocations(prev => [...prev, analysisInvocation]);
      }
    },
    isRunning && demoStep === 1 ? 2000 : null
  );

  // Step 2: Start analysis
  useTimeout(
    () => {
      if (demoStep === 2) {
        setInvocations(prev =>
          prev.map(inv =>
            inv.id === 'demo-analysis-1'
              ? { ...inv, status: 'running' as ToolStatus }
              : inv
          )
        );
        // Move to step 3
        setDemoStep(3);
      }
    },
    isRunning && demoStep === 2 ? 1000 : null
  );

  // Step 3: Complete search and add generation
  useTimeout(
    () => {
      if (demoStep === 3) {
        // Complete the search
        setInvocations(prev =>
          prev.map(inv =>
            inv.id === 'demo-search-1'
              ? {
                  ...inv,
                  status: 'completed' as ToolStatus,
                  endTime: Date.now(),
                  result: { patentsFound: 47, relevantResults: 12 },
                }
              : inv
          )
        );

        // Add generation tool
        const generationInvocation: ToolInvocation = {
          id: 'demo-generation-1',
          toolName: 'generate-description',
          status: 'running',
          parameters: [
            { name: 'style', value: 'technical' },
            { name: 'length', value: 'detailed' },
          ],
          startTime: Date.now(),
        };

        setInvocations(prev => [...prev, generationInvocation]);
        setDemoStep(4);
      }
    },
    isRunning && demoStep === 3 ? 1000 : null
  );

  // Step 4: Complete analysis
  useTimeout(
    () => {
      if (demoStep === 4) {
        setInvocations(prev =>
          prev.map(inv =>
            inv.id === 'demo-analysis-1'
              ? {
                  ...inv,
                  status: 'completed' as ToolStatus,
                  endTime: Date.now(),
                  result: 'Analysis complete: 3 independent claims identified',
                }
              : inv
          )
        );
        setDemoStep(5);
      }
    },
    isRunning && demoStep === 4 ? 2000 : null
  );

  // Step 5: Complete generation
  useTimeout(
    () => {
      if (demoStep === 5) {
        setInvocations(prev =>
          prev.map(inv =>
            inv.id === 'demo-generation-1'
              ? {
                  ...inv,
                  status: 'completed' as ToolStatus,
                  endTime: Date.now(),
                  result: 'Generated detailed technical description',
                }
              : inv
          )
        );
        setDemoStep(6);
      }
    },
    isRunning && demoStep === 5 ? 2000 : null
  );

  // Step 6: Add failed operation
  useTimeout(
    () => {
      if (demoStep === 6) {
        const failedInvocation: ToolInvocation = {
          id: 'demo-failed-1',
          toolName: 'update-invention',
          status: 'running',
          parameters: [
            { name: 'field', value: 'technicalField' },
            { name: 'value', value: 'Invalid data...' },
          ],
          startTime: Date.now(),
        };

        setInvocations(prev => [...prev, failedInvocation]);
        setDemoStep(7);
      }
    },
    isRunning && demoStep === 6 ? 2000 : null
  );

  // Step 7: Show failure
  useTimeout(
    () => {
      if (demoStep === 7) {
        setInvocations(prev =>
          prev.map(inv =>
            inv.id === 'demo-failed-1'
              ? {
                  ...inv,
                  status: 'failed' as ToolStatus,
                  endTime: Date.now(),
                  error:
                    'Validation error: Technical field must be at least 20 characters',
                }
              : inv
          )
        );
        setIsRunning(false); // Demo complete
      }
    },
    isRunning && demoStep === 7 ? 2000 : null
  );

  const startDemo = () => {
    setDemoStep(1);
    setIsRunning(true);
    setInvocations([]);

    // Step 1: Create search tool invocation
    const searchInvocation: ToolInvocation = {
      id: 'demo-search-1',
      toolName: 'search-prior-art',
      status: 'running',
      parameters: [
        { name: 'query', value: 'wireless power transfer efficiency' },
        { name: 'dateRange', value: '2020-2024' },
        { name: 'jurisdictions', value: ['US', 'EP', 'JP'] },
      ],
      startTime: Date.now(),
    };

    setInvocations([searchInvocation]);
  };

  const resetDemo = () => {
    setDemoStep(0);
    setIsRunning(false);
    setInvocations([]);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Tool Integration Demo</h3>
        <p className="text-sm text-muted-foreground">
          This demo shows how tool invocations appear in the chat interface with
          real-time animations.
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={startDemo} disabled={isRunning}>
          Start Demo
        </Button>
        <Button onClick={resetDemo} variant="outline">
          Reset
        </Button>
      </div>

      {demoStep > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Step {Math.min(demoStep, 6)} of 6:{' '}
            {demoStep === 1
              ? 'Searching prior art...'
              : demoStep === 2
                ? 'Starting claim analysis...'
                : demoStep === 3
                  ? 'Search complete, generating description...'
                  : demoStep === 4
                    ? 'Analysis complete...'
                    : demoStep === 5
                      ? 'All operations complete!'
                      : 'Demonstrating error handling...'}
          </div>

          <div className="border rounded-lg p-4 bg-muted/5">
            <ToolInvocationGroup invocations={invocations} isCompact={false} />
          </div>
        </div>
      )}

      {demoStep === 0 && (
        <div className="text-sm text-muted-foreground space-y-2">
          <p>This demo will show:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Multiple tools running in parallel</li>
            <li>Real-time status updates with animations</li>
            <li>Success and failure states</li>
            <li>Loading messages and progress indicators</li>
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ToolIntegrationDemo;
