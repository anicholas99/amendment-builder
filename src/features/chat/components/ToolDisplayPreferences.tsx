import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  Zap,
  CheckCircle,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type ToolDisplayMode =
  | 'full'
  | 'compact'
  | 'inline'
  | 'notification'
  | 'minimal'
  | 'hidden';

interface ToolDisplayPreferencesProps {
  currentMode: ToolDisplayMode;
  onModeChange: (mode: ToolDisplayMode) => void;
  className?: string;
}

const displayModes = [
  {
    id: 'full' as const,
    label: 'Full Cards',
    description: 'Detailed cards with progress bars and animations',
    icon: <Maximize2 className="w-4 h-4" />,
    preview: (
      <div className="w-full p-2 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Tool Name</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full mb-2">
          <div className="h-1 bg-blue-500 rounded-full w-3/4" />
        </div>
        <div className="text-xs text-gray-500">Processing...</div>
      </div>
    ),
  },
  {
    id: 'compact' as const,
    label: 'Compact',
    description: 'Smaller cards with essential information',
    icon: <Minimize2 className="w-4 h-4" />,
    preview: (
      <div className="w-full p-2 bg-gray-50 border rounded-lg">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-blue-600" />
          <span className="text-sm">Tool Name</span>
          <CheckCircle className="w-3 h-3 text-green-600 ml-auto" />
        </div>
      </div>
    ),
  },
  {
    id: 'inline' as const,
    label: 'Inline',
    description: 'Integrated into the chat flow',
    icon: <Eye className="w-4 h-4" />,
    preview: (
      <div className="w-full p-2 bg-gray-50 border rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Tools:</span>
          <Badge variant="secondary" className="text-xs">
            <Zap className="w-2 h-2 mr-1" />
            Tool Name
          </Badge>
        </div>
      </div>
    ),
  },
  {
    id: 'notification' as const,
    label: 'Notification',
    description: 'Small status indicators',
    icon: <Eye className="w-4 h-4" />,
    preview: (
      <div className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs text-blue-700">1 tool running</span>
        </div>
      </div>
    ),
  },
  {
    id: 'minimal' as const,
    label: 'Minimal',
    description: 'Just a status dot',
    icon: <EyeOff className="w-4 h-4" />,
    preview: (
      <div className="w-full p-2 bg-gray-50 border rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm">Assistant message</span>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 'hidden' as const,
    label: 'Hidden',
    description: 'No tool indicators shown',
    icon: <EyeOff className="w-4 h-4" />,
    preview: (
      <div className="w-full p-2 bg-gray-50 border rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm">Assistant message</span>
        </div>
      </div>
    ),
  },
];

export const ToolDisplayPreferences = memo<ToolDisplayPreferencesProps>(
  ({ currentMode, onModeChange, className }) => {
    const currentModeData = displayModes.find(mode => mode.id === currentMode);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'flex items-center gap-2 h-8 px-3 text-xs text-gray-600 dark:text-gray-400',
              className
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Tool Display: {currentModeData?.label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              Tool Display Preferences
            </h3>
            <div className="space-y-2">
              {displayModes.map(mode => (
                <motion.div
                  key={mode.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all',
                    currentMode === mode.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onModeChange(mode.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{mode.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {mode.label}
                        </span>
                        {currentMode === mode.id && (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {mode.description}
                      </p>
                      <div className="scale-75 origin-left">{mode.preview}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your preference will be saved and applied to all tool
                invocations.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

ToolDisplayPreferences.displayName = 'ToolDisplayPreferences';
