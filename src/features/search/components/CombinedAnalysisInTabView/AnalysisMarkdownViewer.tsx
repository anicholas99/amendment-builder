import React from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useThemeContext } from '@/contexts/ThemeContext';

interface AnalysisMarkdownViewerProps {
  markdownText: string;
}

export const AnalysisMarkdownViewer: React.FC<AnalysisMarkdownViewerProps> = ({
  markdownText,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }) => (
          <h1
            className={cn(
              'text-lg font-bold mt-5 mb-3',
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            )}
            {...props}
          >
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2
            className={cn(
              'text-md font-semibold mt-4 mb-2',
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            )}
            {...props}
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            className={cn(
              'text-sm font-semibold mt-3 mb-1',
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            )}
            {...props}
          >
            {children}
          </h3>
        ),
        p: ({ children, onClick, ...props }) => (
          <p
            className={cn(
              'mb-2 text-sm',
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            )}
            {...props}
          >
            {children}
          </p>
        ),
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside mb-2 space-y-1" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li
            className={cn(
              'ml-5 text-sm',
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            )}
            {...props}
          >
            {children}
          </li>
        ),
        code: ({ children }) => (
          <code
            className={cn(
              'px-1 py-0.5 text-xs font-mono rounded-sm',
              isDarkMode
                ? 'bg-gray-700 text-gray-200'
                : 'bg-gray-100 text-gray-900'
            )}
          >
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className={cn(
              'border-l-4 pl-4 py-2 my-3 italic',
              isDarkMode
                ? 'border-gray-600 bg-gray-800 text-gray-400'
                : 'border-gray-300 bg-gray-50 text-gray-600'
            )}
          >
            {children}
          </blockquote>
        ),
      }}
    >
      {markdownText}
    </ReactMarkdown>
  );
};
