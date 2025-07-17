import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FileText, CheckCircle, Sparkles, Brain } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useInterval } from '@/hooks/useInterval';

interface ProfessionalLoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  showProgress?: boolean;
}

export const ProfessionalLoadingModal: React.FC<
  ProfessionalLoadingModalProps
> = ({
  isOpen,
  title = 'AI Analysis in Progress',
  message = 'Analyzing your invention details...',
  showProgress = true,
}) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { icon: FileText, text: 'Reading', color: 'text-blue-500' },
    { icon: Brain, text: 'Processing', color: 'text-purple-500' },
    { icon: Sparkles, text: 'Analyzing', color: 'text-amber-500' },
    { icon: CheckCircle, text: 'Finalizing', color: 'text-green-500' },
  ];

  // Progress animation callback
  const updateProgress = useCallback(() => {
    setProgress(prev => {
      if (prev >= 95) return 95;
      // Use deterministic progress increments instead of random
      const increment = prev < 50 ? 8 : prev < 80 ? 5 : 2;
      return Math.min(prev + increment, 95);
    });
  }, []);

  // Step animation callback
  const updateStep = useCallback(() => {
    setStep(prev => (prev + 1) % steps.length);
  }, [steps.length]);

  // Use custom hooks for intervals
  useInterval(updateProgress, isOpen ? 500 : null);
  useInterval(updateStep, isOpen ? 2000 : null);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setProgress(0);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        // Intentionally empty to prevent dialog from closing
      }}
    >
      <DialogContent
        className={cn(
          'sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300',
          '[&>button]:hidden' // Hide close button
        )}
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <div className="py-8 px-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Modern animated icon with glow effect */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-2xl opacity-50">
                <div
                  className={cn(
                    'h-20 w-20 rounded-full animate-pulse',
                    steps[step].color.replace('text-', 'bg-')
                  )}
                />
              </div>

              {/* Main icon container */}
              <div className="relative">
                {/* Rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 animate-spin [animation-duration:8s]" />

                {/* Icon background */}
                <div
                  className={cn(
                    'relative h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500',
                    'bg-gradient-to-br from-background to-muted/50',
                    'shadow-lg border border-border'
                  )}
                >
                  {/* Animated icon */}
                  <div className="relative">
                    {steps.map((s, index) => {
                      const StepIcon = s.icon;
                      return (
                        <StepIcon
                          key={index}
                          className={cn(
                            'h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500',
                            index === step
                              ? cn('opacity-100 scale-100', s.color)
                              : 'opacity-0 scale-75'
                          )}
                        />
                      );
                    })}
                  </div>

                  {/* Pulse effect */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full animate-ping opacity-20',
                      steps[step].color.replace('text-', 'bg-')
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Title and message with better typography */}
            <div className="text-center space-y-2 max-w-sm">
              <h3
                className={cn(
                  'text-lg font-semibold tracking-tight',
                  'text-foreground'
                )}
              >
                {title}
              </h3>
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  'text-muted-foreground'
                )}
              >
                {message}
              </p>
            </div>

            {/* Modern step indicators */}
            <div className="flex items-center gap-6">
              {steps.map((s, index) => {
                const isActive = index === step;
                const isPast = index < step;

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex flex-col items-center gap-2 transition-all duration-500',
                      isActive ? 'scale-110' : 'scale-100'
                    )}
                  >
                    {/* Step dot with animation */}
                    <div className="relative p-2">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full transition-all duration-500',
                          isActive
                            ? s.color.replace('text-', 'bg-')
                            : isPast
                              ? 'bg-muted-foreground/50'
                              : 'bg-muted-foreground/20'
                        )}
                      />
                      {isActive && (
                        <div
                          className={cn(
                            'absolute inset-2 rounded-full animate-ping opacity-75',
                            s.color.replace('text-', 'bg-')
                          )}
                        />
                      )}
                    </div>

                    {/* Step text */}
                    <span
                      className={cn(
                        'text-xs font-medium transition-all duration-500',
                        isActive ? s.color : 'text-muted-foreground'
                      )}
                    >
                      {s.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Enhanced progress bar */}
            {showProgress && (
              <div className="w-full space-y-2">
                <Progress value={progress} className="h-1.5 w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}

            {/* Animated dots */}
            <div className="flex gap-1 py-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full bg-muted-foreground/50',
                    'animate-bounce'
                  )}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1.5s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalLoadingModal;
