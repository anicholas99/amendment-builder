import React from 'react';
import { createPortal } from 'react-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

interface ClaimProcessingOverlayProps {
  isProcessing: boolean;
  message?: string;
  progress?: number;
}

export const ClaimProcessingOverlayShadcn: React.FC<
  ClaimProcessingOverlayProps
> = ({ isProcessing, message = 'Processing claims...', progress }) => {
  const { isDarkMode } = useThemeContext();

  if (!isProcessing) return null;

  // Ensure we're in the browser before using createPortal
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[1400] flex items-center justify-center',
        'bg-black/40 backdrop-blur-sm'
      )}
    >
      <div
        className={cn(
          'rounded-lg shadow-2xl border p-8 max-w-[400px] w-[90%]',
          isDarkMode
            ? 'bg-black/90 border-gray-700'
            : 'bg-white/90 border-gray-200'
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
            <p
              className={cn(
                'text-lg font-medium',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              {message}
            </p>
          </div>

          {progress !== undefined && (
            <div className="w-full">
              <div
                className={cn(
                  'h-2 w-full rounded-full overflow-hidden',
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                )}
              >
                <div
                  className="h-full bg-blue-500 transition-[width] duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Animated stripes */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          )}

          <p
            className={cn(
              'text-sm text-center',
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Please wait while your claims are being added...
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Add shimmer animation to globals.css or tailwind config
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
// .animate-shimmer {
//   animation: shimmer 2s linear infinite;
// }
