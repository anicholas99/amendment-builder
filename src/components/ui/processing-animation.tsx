import React from 'react';
import { cn } from '@/lib/utils';
import {
  Cpu,
  Search,
  FileText,
  CheckCircle,
  Brain,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface ProcessingAnimationProps {
  isOpen: boolean;
  message?: string;
  variant?: 'modal' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Modern animated component shown during processing operations
 * Displays a visually engaging animation with morphing icons
 */
const ProcessingAnimation = ({
  isOpen,
  message = 'Analyzing your invention details...',
  variant = 'modal',
  size = 'md',
}: ProcessingAnimationProps) => {
  // Size configurations
  const sizeConfig = {
    sm: { container: 80, icon: 20, text: 'text-xs' },
    md: { container: 120, icon: 32, text: 'text-sm' },
    lg: { container: 160, icon: 40, text: 'text-base' },
  };

  const config = sizeConfig[size];

  // Animation content
  const animationContent = (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        variant === 'modal' && 'animate-in fade-in-0 zoom-in-95 duration-500'
      )}
    >
      {/* Main animation container */}
      <div
        className="relative"
        style={{
          height: `${config.container}px`,
          width: `${config.container}px`,
        }}
      >
        {/* Gradient background glow */}
        <div className="absolute inset-0 blur-2xl opacity-30">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
        </div>

        {/* Rotating outer ring with gradient */}
        <div className="absolute inset-0">
          <svg className="w-full h-full animate-spin [animation-duration:8s]">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor="rgb(59, 130, 246)"
                  stopOpacity="0.8"
                />
                <stop
                  offset="50%"
                  stopColor="rgb(147, 51, 234)"
                  stopOpacity="0.6"
                />
                <stop
                  offset="100%"
                  stopColor="rgb(236, 72, 153)"
                  stopOpacity="0.4"
                />
              </linearGradient>
            </defs>
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray="8 4"
            />
          </svg>
        </div>

        {/* Inner pulsing circle */}
        <div className="absolute inset-4">
          <div className="h-full w-full rounded-full bg-gradient-to-br from-background to-muted/50 shadow-lg border border-border animate-pulse [animation-duration:2s]" />
        </div>

        {/* Center icon container with morphing effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Brain icon */}
            <Brain
              className={cn(
                'absolute inset-0 text-purple-500 transition-all duration-1000',
                'animate-pulse [animation-duration:2s]'
              )}
              size={config.icon}
            />

            {/* Sparkles overlay */}
            <Sparkles
              className={cn(
                'absolute inset-0 text-amber-500 transition-all duration-1000',
                'animate-pulse [animation-duration:2s] [animation-delay:0.5s]',
                'opacity-60'
              )}
              size={config.icon}
            />

            {/* CPU underlay */}
            <Cpu
              className={cn(
                'text-blue-500 transition-all duration-1000',
                'opacity-40'
              )}
              size={config.icon}
            />
          </div>
        </div>

        {/* Orbiting particles */}
        {size !== 'sm' && (
          <>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 120}deg) translateX(${config.container * 0.4}px) translateY(-50%)`,
                  animation: `orbit ${3 + i}s linear infinite`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Text content */}
      {size !== 'sm' && (
        <div className="mt-6 text-center space-y-2 max-w-sm">
          <h3
            className={cn(
              'font-semibold tracking-tight',
              config.text === 'text-base' ? 'text-lg' : config.text,
              'text-foreground'
            )}
          >
            AI Analysis in Progress
          </h3>
          <p className={cn(config.text, 'text-muted-foreground')}>{message}</p>
        </div>
      )}

      {/* Modern progress indicator */}
      <div className="mt-4 flex items-center gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-gradient-to-r from-blue-500 to-purple-500',
              'animate-pulse'
            )}
            style={{
              height: size === 'sm' ? '4px' : '6px',
              width: size === 'sm' ? '4px' : '6px',
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
      </div>
    </div>
  );

  // Add orbit animation styles
  if (
    typeof window !== 'undefined' &&
    !document.querySelector('#orbit-animation')
  ) {
    const style = document.createElement('style');
    style.id = 'orbit-animation';
    style.textContent = `
      @keyframes orbit {
        from { transform: rotate(0deg) translateX(${config.container * 0.4}px) translateY(-50%) rotate(0deg); }
        to { transform: rotate(360deg) translateX(${config.container * 0.4}px) translateY(-50%) rotate(-360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Render inline or as modal based on variant
  if (variant === 'inline') {
    if (!isOpen) return null;
    return (
      <div className="inline-flex items-center justify-center">
        {animationContent}
      </div>
    );
  }

  // Default modal version
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className={cn(
          'sm:max-w-md border-0 bg-background/80 backdrop-blur-xl',
          '[&>button]:hidden' // Hide close button
        )}
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {animationContent}
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingAnimation;
