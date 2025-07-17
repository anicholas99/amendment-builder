import React, { memo } from 'react';

interface ThinkingAnimationProps {
  color?: string;
  message?: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = memo(
  ({ color = 'blue.400', message = 'Thinking' }) => {
    // Map theme-style colors to Tailwind classes
    const colorClass = color === 'blue.400' ? 'bg-blue-500' : '';

    return (
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600 mr-2">{message}</span>
        <div
          className={`w-1 h-1 rounded-full animate-thinking-dots ${colorClass}`}
          style={color !== 'blue.400' ? { backgroundColor: color } : undefined}
        />
        <div
          className={`w-1 h-1 rounded-full animate-thinking-dots-delay-1 ${colorClass}`}
          style={color !== 'blue.400' ? { backgroundColor: color } : undefined}
        />
        <div
          className={`w-1 h-1 rounded-full animate-thinking-dots-delay-2 ${colorClass}`}
          style={color !== 'blue.400' ? { backgroundColor: color } : undefined}
        />
      </div>
    );
  }
);

ThinkingAnimation.displayName = 'ThinkingAnimation';
