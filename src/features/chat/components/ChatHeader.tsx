import React from 'react';
import { FiCpu, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AssistantInfo } from '../types';

interface ChatHeaderProps {
  assistantInfo: AssistantInfo;
  onRefresh: () => void;
  onClearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  assistantInfo,
  onRefresh,
  onClearChat,
}) => {
  return (
    <div className="bg-card border-b border-border shadow-sm">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-3">
          <Avatar
            className="w-8 h-8 shadow-sm"
            style={{ backgroundColor: assistantInfo.color }}
          >
            <AvatarFallback className="bg-transparent text-white">
              <FiCpu className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start space-y-0">
            <span className="text-sm font-semibold text-foreground">
              {assistantInfo.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {assistantInfo.description}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={onRefresh}
                  aria-label="Refresh conversation"
                >
                  <FiRefreshCw className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                  )}
                  onClick={onClearChat}
                  aria-label="Clear conversation"
                >
                  <FiTrash2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
