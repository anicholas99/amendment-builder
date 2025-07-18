/**
 * Amendment Workflow Guide
 * 
 * Shows users the step-by-step workflow for responding to Office Actions
 */

import React from 'react';
import { 
  Upload, 
  FileSearch, 
  Brain, 
  Edit3, 
  Shield, 
  Download,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'active' | 'complete';
  action?: () => void;
  actionLabel?: string;
}

interface AmendmentWorkflowGuideProps {
  currentStep: string;
  completedSteps: string[];
  onStepAction?: (stepId: string) => void;
  className?: string;
}

const WORKFLOW_STEPS: Omit<WorkflowStep, 'status' | 'action'>[] = [
  {
    id: 'upload',
    title: 'Upload Office Action',
    description: 'Upload and parse the Office Action document',
    icon: Upload,
  },
  {
    id: 'analyze',
    title: 'Analyze Rejections',
    description: 'AI evaluates examiner reasoning and rejection strength',
    icon: FileSearch,
  },
  {
    id: 'strategy',
    title: 'Review Strategy',
    description: 'Get recommendations on arguing vs. amending claims',
    icon: Brain,
  },
  {
    id: 'draft',
    title: 'Draft Response',
    description: 'Generate and edit your amendment response',
    icon: Edit3,
  },
  {
    id: 'validate',
    title: 'Validate Changes',
    description: 'Check amended claims for new prior art risks',
    icon: Shield,
  },
  {
    id: 'export',
    title: 'Export & File',
    description: 'Download USPTO-ready response document',
    icon: Download,
  },
];

export const AmendmentWorkflowGuide: React.FC<AmendmentWorkflowGuideProps> = ({
  currentStep,
  completedSteps,
  onStepAction,
  className,
}) => {
  const getStepStatus = (stepId: string): WorkflowStep['status'] => {
    if (completedSteps.includes(stepId)) return 'complete';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getStepStyles = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'complete':
        return {
          card: 'border-green-200 bg-green-50',
          icon: 'text-green-600',
          title: 'text-green-900',
          description: 'text-green-700',
        };
      case 'active':
        return {
          card: 'border-blue-300 bg-blue-50 shadow-md',
          icon: 'text-blue-600',
          title: 'text-blue-900 font-semibold',
          description: 'text-blue-700',
        };
      default:
        return {
          card: 'border-gray-200 bg-gray-50',
          icon: 'text-gray-400',
          title: 'text-gray-600',
          description: 'text-gray-500',
        };
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Amendment Workflow</h3>
        <Badge variant="outline">
          {completedSteps.length} of {WORKFLOW_STEPS.length} complete
        </Badge>
      </div>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200" />

        {/* Steps */}
        <div className="space-y-3">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const styles = getStepStyles(status);
            const Icon = step.icon;
            const isLast = index === WORKFLOW_STEPS.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Step card */}
                <Card 
                  className={cn(
                    'ml-16 transition-all cursor-pointer hover:shadow-lg',
                    styles.card
                  )}
                  onClick={() => onStepAction?.(step.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={cn('font-medium', styles.title)}>
                          {step.title}
                        </h4>
                        <p className={cn('text-sm mt-1', styles.description)}>
                          {step.description}
                        </p>
                      </div>
                      {status === 'active' && (
                        <ArrowRight className="h-5 w-5 text-blue-600 animate-pulse" />
                      )}
                      {status === 'complete' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Step icon */}
                <div 
                  className={cn(
                    'absolute left-0 w-16 h-16 rounded-full flex items-center justify-center bg-white border-4',
                    status === 'complete' ? 'border-green-200' : 
                    status === 'active' ? 'border-blue-300' : 
                    'border-gray-200'
                  )}
                >
                  <Icon className={cn('h-6 w-6', styles.icon)} />
                </div>

                {/* Connection dot */}
                {!isLast && (
                  <div 
                    className={cn(
                      'absolute left-8 -bottom-1.5 w-1 h-1 rounded-full',
                      status === 'complete' ? 'bg-green-400' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 