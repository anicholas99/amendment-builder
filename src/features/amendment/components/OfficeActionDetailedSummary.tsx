/**
 * Office Action Detailed Summary Component
 * 
 * Displays comprehensive, structured analysis of Office Action
 * including rejections, objections, strategic implications, etc.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle, XCircle, Target, ClipboardList, AlertOctagon, AlertCircle, Check, Minus } from 'lucide-react';
import type { DetailedAnalysis } from '@/types/amendment';

interface OfficeActionDetailedSummaryProps {
  examinerRemarks?: string;
  detailedAnalysis?: DetailedAnalysis;
  metadata?: {
    applicationNumber?: string;
    mailingDate?: string;
    examinerName?: string;
  };
}

export const OfficeActionDetailedSummary: React.FC<OfficeActionDetailedSummaryProps> = ({
  examinerRemarks,
  detailedAnalysis,
  metadata,
}) => {
  // If no detailed analysis is available, show basic summary
  if (!detailedAnalysis) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            View Summary
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Office Action Summary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {examinerRemarks ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">{examinerRemarks}</p>
              </div>
            ) : (
              <p className="text-gray-500">No summary available for this Office Action.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          View Detailed Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Comprehensive Office Action Analysis
            {metadata?.applicationNumber && (
              <Badge variant="secondary">{metadata.applicationNumber}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{detailedAnalysis.overview}</p>
              {metadata && (
                <div className="mt-3 flex gap-4 text-sm text-gray-600">
                  {metadata.examinerName && (
                    <span>Examiner: {metadata.examinerName}</span>
                  )}
                  {metadata.mailingDate && (
                    <span>Date: {new Date(metadata.mailingDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejections */}
          {detailedAnalysis.rejectionBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-red-600" />
                  Rejections (Substantive Issues)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailedAnalysis.rejectionBreakdown.map((rejection, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-red-900">
                        {rejection.type}: {rejection.title}
                      </h4>
                      <Badge variant="destructive">
                        Claims: {rejection.claims.join(', ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {rejection.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className="flex items-start gap-2">
                          <Minus className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                          <span className="text-red-800 text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Objections */}
          {detailedAnalysis.objections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Objections (Formal Issues)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailedAnalysis.objections.map((objection, index) => (
                  <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-yellow-900">{objection.type}</h4>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Claims: {objection.claims.join(', ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {objection.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className="flex items-start gap-2">
                          <Minus className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                          <span className="text-yellow-800 text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Withdrawn Items */}
          {detailedAnalysis.withdrawn.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Withdrawn/Allowed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailedAnalysis.withdrawn.map((item, index) => (
                  <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-green-900">{item.type} Withdrawn</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Claims: {item.claims.join(', ')}
                      </Badge>
                    </div>
                    <p className="text-green-800 text-sm">{item.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Strategic Implications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Strategic Implications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(detailedAnalysis.strategicImplications.difficulty)}`}>
                    {detailedAnalysis.strategicImplications.difficulty} Response
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Time to Respond</div>
                  <div className="font-semibold">{detailedAnalysis.strategicImplications.timeToRespond}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Recommended Approach</div>
                  <div className="font-semibold text-sm">{detailedAnalysis.strategicImplications.recommendedApproach}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Positive Aspects
                  </h4>
                  <ul className="space-y-1">
                    {detailedAnalysis.strategicImplications.positives.map((positive, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {positive}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Main Concerns
                  </h4>
                  <ul className="space-y-1">
                    {detailedAnalysis.strategicImplications.concerns.map((concern, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Summary for Reference */}
          {examinerRemarks && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Quick Reference Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{examinerRemarks}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 