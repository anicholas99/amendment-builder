#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

// Create type definition files for common patterns

const typesDir = path.join(process.cwd(), 'src', 'types');

// API Response Types
const apiResponseTypes = `
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}
`;

// Search Related Types
const searchTypes = `
export interface SearchHistoryEntry {
  id: string;
  projectId: string;
  query: string;
  searchType: string;
  results?: SearchResult[];
  parsedElements?: ParsedElement[];
  parsedElementsJson?: string;
  searchParams?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  reference: string;
  title: string;
  abstract?: string;
  publicationDate?: string;
  patentNumber?: string;
  assignee?: string;
  inventor?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface ParsedElement {
  id?: string;
  elementId?: string;
  elementType?: string;
  text: string;
  claimNumber?: number;
  dependency?: string | null;
  originalText?: string;
  variants?: string[];
}

export interface ParsedElementWithVariants extends ParsedElement {
  variantsList?: string[];
  selectedVariant?: string;
}
`;

// Citation Types
const citationTypes = `
export interface CitationMatch {
  id: string;
  searchHistoryId: string;
  reference: string;
  elementId: string;
  elementText: string;
  parsedElementText?: string;
  matchingText?: string;
  score?: number;
  reasoning?: string;
  citationLocation?: CitationLocation;
  deepAnalysisResult?: DeepAnalysisResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface CitationLocation {
  reference: string;
  elementId: string;
  locations: Array<{
    section: string;
    text: string;
    context?: string;
  }>;
}

export interface DeepAnalysisResult {
  overallRelevance: number;
  elementAnalysis: Array<{
    elementId: string;
    relevance: number;
    explanation: string;
    matchedConcepts: string[];
  }>;
  keyFindings: string[];
  recommendations?: string[];
}

export interface CitationJob {
  id: string;
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  elementIds?: string[];
  result?: unknown;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
`;

// Project Types Enhancement
const projectTypesEnhancement = `
// Add these to your existing project types

export interface ClaimSetVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  title?: string;
  description?: string;
  content: string;
  parsedElements?: ParsedElement[];
  parsedElementsJson?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectExclusion {
  id: string;
  projectId: string;
  patentNumber: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedPriorArt {
  id: string;
  projectId: string;
  reference: string;
  title?: string;
  abstract?: string;
  claim1?: string;
  summary?: string;
  relevanceScore?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
`;

// React Component Props Types
const componentPropTypes = `
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface FormFieldProps<T = unknown> extends BaseComponentProps {
  name: string;
  label?: string;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}
`;

// Hook Return Types
const hookTypes = `
export interface UseAsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export interface UseApiResponse<T = unknown> extends UseAsyncState<T> {
  mutate: (data: Partial<T>) => Promise<void>;
  remove: () => Promise<void>;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
}
`;

// Utility Types
const utilityTypes = `
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type AsyncFunction<T = void> = () => Promise<T>;
export type AsyncFunctionWithArgs<TArgs, TReturn = void> = (args: TArgs) => Promise<TReturn>;

export type ErrorHandler = (error: Error | unknown) => void;
export type SuccessHandler<T = unknown> = (data: T) => void;

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;
`;

// Create the files
const files = [
  { name: 'api-responses.ts', content: apiResponseTypes },
  { name: 'search.ts', content: searchTypes },
  { name: 'citations.ts', content: citationTypes },
  { name: 'project-enhancements.ts', content: projectTypesEnhancement },
  { name: 'components.ts', content: componentPropTypes },
  { name: 'hooks.ts', content: hookTypes },
  { name: 'utility.ts', content: utilityTypes },
];

console.log('📝 Creating type definition files...\n');

files.forEach(({ name, content }) => {
  const filePath = path.join(typesDir, name);
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`✅ Created: ${name}`);
});

// Create an index file that exports all types
const indexContent = files
  .map(({ name }) => `export * from './${name.replace('.ts', '')}';`)
  .join('\n');

fs.writeFileSync(
  path.join(typesDir, 'index.ts'),
  `// Auto-generated type exports\n${indexContent}\n`
);

console.log('\n✅ Created index.ts with all exports');

// Create a type guard utilities file
const typeGuardUtils = `
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is { [key in K]: unknown } {
  return isObject(obj) && key in obj;
}

export function isApiError(error: unknown): error is { message: string; statusCode?: number } {
  return isObject(error) && hasProperty(error, 'message') && isString(error.message);
}

export function ensureError(value: unknown): Error {
  if (isError(value)) return value;
  if (isString(value)) return new Error(value);
  if (isApiError(value)) return new Error(value.message);
  return new Error('An unknown error occurred');
}
`;

fs.writeFileSync(
  path.join(process.cwd(), 'src', 'utils', 'type-guards.ts'),
  typeGuardUtils.trim() + '\n'
);

console.log('\n✅ Created type guard utilities');

console.log('\n📋 Next steps:');
console.log(
  '1. Run the automated fix script: npx tsx scripts/fix-all-any-types.ts'
);
console.log('2. Import these new types where needed');
console.log(
  '3. Replace unknown types with specific types from these definitions'
);
console.log('4. Run type checking to identify remaining issues');
