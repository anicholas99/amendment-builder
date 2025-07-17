import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  MarkdownComponentProps,
  OrderedListProps,
  TableCellProps,
  PageContext,
} from '../types';
import { CodeBlock } from '../components/CodeBlock';
import { logger } from '@/utils/clientLogger';

export const useMarkdownConfig = (pageContext: PageContext) => {
  const MarkdownComponents = useMemo(
    () => ({
      p: ({ children }: MarkdownComponentProps) => (
        <p
          className={cn(
            'mb-2 leading-relaxed text-sm whitespace-pre-wrap text-foreground'
          )}
        >
          {children}
        </p>
      ),
      strong: ({ children }: MarkdownComponentProps) => (
        <strong className={cn('font-bold text-foreground')}>{children}</strong>
      ),
      em: ({ children }: MarkdownComponentProps) => (
        <em className={cn('italic text-muted-foreground')}>{children}</em>
      ),
      ul: ({ children }: MarkdownComponentProps) => {
        return (
          <ul
            className={cn(
              'pl-4 mb-2 list-disc list-outside space-y-1 text-foreground'
            )}
          >
            {children}
          </ul>
        );
      },
      ol: ({ children, start }: OrderedListProps) => {
        return (
          <ol
            className={cn(
              'pl-4 mb-2 list-decimal list-outside space-y-1 text-foreground'
            )}
            start={start}
          >
            {children}
          </ol>
        );
      },
      li: ({ children }: MarkdownComponentProps) => {
        // Clean, professional list item formatting without semicolons
        return (
          <li className={cn('mb-1 leading-relaxed text-sm text-foreground')}>
            {children}
          </li>
        );
      },
      code: CodeBlock,
      pre: ({ children }: MarkdownComponentProps) => (
        <pre
          className={cn(
            'p-3 rounded-md mb-2 overflow-auto text-xs font-mono bg-muted text-foreground'
          )}
        >
          {children}
        </pre>
      ),
      blockquote: ({ children }: MarkdownComponentProps) => (
        <blockquote
          className={cn(
            'border-l-[3px] border-blue-400 pl-3 py-1.5 mb-2 rounded-sm bg-muted/50 text-foreground'
          )}
        >
          {children}
        </blockquote>
      ),
      h1: ({ children }: MarkdownComponentProps) => (
        <h1
          className={cn(
            'text-lg font-bold mb-2 mt-3 pb-1 border-b text-foreground border-border'
          )}
        >
          {children}
        </h1>
      ),
      h2: ({ children }: MarkdownComponentProps) => (
        <h2 className={cn('text-base font-bold mb-2 mt-3 text-foreground')}>
          {children}
        </h2>
      ),
      h3: ({ children }: MarkdownComponentProps) => (
        <h3 className={cn('text-sm font-bold mb-1.5 mt-2.5 text-foreground')}>
          {children}
        </h3>
      ),
      // Handle line breaks better
      br: () => <br />,
      // Handle plain text with proper whitespace
      text: ({ children }: MarkdownComponentProps) => children,
      // Handle tables
      table: ({ children }: MarkdownComponentProps) => (
        <table className={cn('w-full mb-2 border-collapse text-foreground')}>
          {children}
        </table>
      ),
      th: ({ children }: TableCellProps) => (
        <th
          className={cn(
            'p-1.5 border-b font-semibold text-left text-xs border-border text-foreground'
          )}
        >
          {children}
        </th>
      ),
      td: ({ children }: TableCellProps) => (
        <td
          className={cn('p-1.5 border-b text-xs border-border text-foreground')}
        >
          {children}
        </td>
      ),
      // Add horizontal rule styling
      hr: () => <hr className={cn('border-t my-3 opacity-50 border-border')} />,
    }),
    [pageContext]
  );

  return MarkdownComponents;
};
