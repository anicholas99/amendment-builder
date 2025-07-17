import React, { useState } from 'react';
import {
  FiArrowRight,
  FiCheck,
  FiInfo,
  FiAlertTriangle,
  FiAlertCircle,
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import ProcessingAnimation from '../../../components/ui/processing-animation';
import { apiConfig } from '@/config/environment.client';

interface TechnologyInputFooterProps {
  textLength: number;
  isProcessing: boolean;
  isUploading: boolean;
  hasContent: boolean;
  onProcessClick: () => void;
  progress: number;
}

// Token limit configuration (matches API endpoint)
const maxTokens = typeof window !== 'undefined' ? apiConfig.maxTokens : 6000;
const MAX_CHARS = maxTokens * 4; // Approximate chars per token
const WARNING_THRESHOLD = 0.8; // Warn at 80%
const DANGER_THRESHOLD = 0.95; // Danger at 95%

/**
 * Get the status and styling for the character counter based on current usage
 */
const getCounterStatus = (textLength: number) => {
  const approxTokens = Math.ceil(textLength / 4);
  const percentage = approxTokens / maxTokens;

  if (percentage >= 1) {
    return {
      status: 'over-limit',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: FiAlertCircle,
      message: 'Exceeds maximum limit',
      isOverLimit: true,
    };
  } else if (percentage >= DANGER_THRESHOLD) {
    return {
      status: 'danger',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: FiAlertTriangle,
      message: 'Approaching limit',
      isOverLimit: false,
    };
  } else if (percentage >= WARNING_THRESHOLD) {
    return {
      status: 'warning',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      icon: FiAlertTriangle,
      message: 'Consider condensing',
      isOverLimit: false,
    };
  } else {
    return {
      status: 'normal',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: FiInfo,
      message: 'Within limits',
      isOverLimit: false,
    };
  }
};

/**
 * Footer component with enhanced character count, token limits, and process button
 */
export const TechnologyInputFooter: React.FC<TechnologyInputFooterProps> =
  React.memo(
    ({
      textLength,
      isProcessing,
      isUploading,
      hasContent,
      onProcessClick,
      progress,
    }) => {
      const approxTokens = Math.ceil(textLength / 4);
      const counterStatus = getCounterStatus(textLength);
      const percentage = (approxTokens / maxTokens) * 100;

      return (
        <div className="p-4 bg-muted border-t border-gray-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center">
              {/* Enhanced Character/Token Counter */}
              <div className="flex items-center space-x-3">
                {React.createElement(counterStatus.icon, {
                  className: cn('w-5 h-5', counterStatus.color),
                })}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {textLength > 0
                        ? `${textLength.toLocaleString()} characters`
                        : 'No content yet'}
                    </span>
                    {textLength > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className={cn(
                                'text-xs px-2 py-1 rounded-md',
                                counterStatus.status === 'over-limit' ||
                                  counterStatus.status === 'danger'
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : counterStatus.status === 'warning'
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                              )}
                            >
                              ~{approxTokens.toLocaleString()} /{' '}
                              {maxTokens.toLocaleString()} tokens
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Approximately {approxTokens.toLocaleString()}{' '}
                              tokens. Maximum allowed:{' '}
                              {maxTokens.toLocaleString()} tokens.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {textLength > 0 && counterStatus.status !== 'normal' && (
                    <p className={cn('text-xs mt-1', counterStatus.color)}>
                      {counterStatus.message}
                      {counterStatus.isOverLimit &&
                        ' - Please reduce content length'}
                    </p>
                  )}
                </div>
              </div>

              {/* Process Button */}
              {isProcessing ? (
                <div className="flex items-center gap-3">
                  <ProcessingAnimation
                    isOpen={isProcessing}
                    variant="inline"
                    size="sm"
                  />
                  <span className="text-sm font-medium text-muted-foreground animate-pulse">
                    Processing...
                  </span>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={onProcessClick}
                  disabled={
                    isProcessing ||
                    isUploading ||
                    !hasContent ||
                    counterStatus.isOverLimit
                  }
                  className={cn(
                    'px-8 py-6 rounded-lg font-semibold',
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    'transition-all duration-150 ease-out',
                    'hover:transform hover:-translate-y-0.5 hover:shadow-lg',
                    'active:transform active:translate-y-0 active:shadow-md active:bg-blue-800',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                  )}
                  data-testid="process-invention-button"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Process Invention
                      <FiArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              )}

              {/* Progress Indicator */}
              <div className="flex items-center space-x-4">
                <Progress
                  value={progress}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700"
                />
                <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                  {progress}% Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  );

TechnologyInputFooter.displayName = 'TechnologyInputFooter';
