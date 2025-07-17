import React from 'react';
import { InventionData } from '@/types';
import { ProjectData as BaseProjectData } from '@/types/project';
import { ToolInvocation } from './tool-invocation';

// Re-export ProjectData with local modifications if needed in the future
// For now, it's a direct re-export
export type ProjectData = BaseProjectData;

// Chat message types
export interface ChatMessage {
  /**
   * Optional unique identifier. Front-end creates temporary IDs for streaming
   * messages; historical messages from the database may omit it.
   */
  id?: string;
  role: 'assistant' | 'user' | 'system' | 'tool';
  content: string;
  /**
   * Back-end returns Date objects while optimistic updates sometimes use ISO
   * strings. Accept both to keep type-checking happy.
   */
  timestamp: string | Date;
  inventionData?: InventionData;
  /**
   * Tool invocations for when the AI is calling functions/tools
   */
  toolInvocations?: ToolInvocation[];
  /**
   * Whether this message is currently streaming
   */
  isStreaming?: boolean;
}

export interface ChatHistoryMessage {
  role: string; // 'user' | 'assistant' | 'system' (matches database)
  content: string;
  createdAt: string | Date; // Can be either string from JSON or Date from Prisma
}

// Command types
export interface ChatCommand {
  type: 'patent_document_updated' | 'project_data_updated' | 'update_field';
  field?: string;
  value?: unknown;
  operation?: string;
  [key: string]: unknown;
}

// Context types
export interface ContextData {
  pageContext: PageContext;
  projectData: {
    id: string;
    name?: string;
    inventionData?: InventionData;
  } | null;
}

export type PageContext = 'technology' | 'claim-refinement' | 'patent';

// Component prop types
export interface ChatInterfaceProps {
  projectData: ProjectData | null;
  onContentUpdate: (newContent: string) => void;
  setPreviousContent: (content: string | null) => void;
  pageContext?: PageContext;
  projectId: string;
}

export interface MessagesContainerProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  markdownComponents: unknown;
  renderDualContent: (
    content: string,
    isStreamingMsg: boolean,
    justCompleted?: boolean
  ) => JSX.Element;
  assistantInfoColor: string;
  markdownTextColor: string;
  lastAssistantRef?: React.RefObject<HTMLDivElement>;
}

// Markdown component types
export interface MarkdownComponentProps {
  children?: React.ReactNode;
}

export interface OrderedListProps extends MarkdownComponentProps {
  start?: number;
}

export interface TableCellProps extends MarkdownComponentProps {
  align?: 'left' | 'center' | 'right' | 'justify' | 'char';
}

// Assistant info type
export interface AssistantInfo {
  title: string;
  description: string;
  color: string;
}
