/**
 * Test page for minimalist UI features
 * Access at: /test/minimalist-ui?tenant=default
 */

import React from 'react';
import { AmendmentStudio } from '@/features/amendment/components/AmendmentStudio';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { isFeatureEnabled } from '@/config/featureFlags';
import type { NextPage } from 'next';

const MinimalistUITest: NextPage = () => {
  const isMinimalistEnabled = isFeatureEnabled('ENABLE_MINIMALIST_AMENDMENT_UI');
  
  return (
    <div className="min-h-screen bg-background">
      {/* Test Status Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Minimalist UI Test</h1>
              <p className="text-muted-foreground">
                Testing attorney-focused minimalist design patterns
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Feature Flag:</span>
                <Badge variant={isMinimalistEnabled ? "default" : "secondary"}>
                  {isMinimalistEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Checklist */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Minimalist UI Checklist</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {isMinimalistEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <span className="text-sm">
                  AI Panel starts collapsed (shows only quick action icons)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  Collapse/Expand toggle button on panel edge
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  Quick actions expand panel when clicked
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  3-tab center panel (Analysis, Draft, Preview)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  Attorney-focused project cards with prosecution metadata
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  Simplified timeline strip (milestone nodes only)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-muted-foreground">
                  Risk badges on claims (pending)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Amendment Studio */}
        <Card className="h-[600px]">
          <CardContent className="p-0 h-full">
            <AmendmentStudio 
              projectId="test-project-123"
              officeActionId="test-oa-456"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MinimalistUITest;