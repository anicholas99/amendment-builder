import React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';
import 'swagger-ui-react/swagger-ui.css';

// Dynamic import to avoid SSR issues with swagger-ui-react
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="p-6 text-center">
      <p className="text-muted-foreground">Loading API documentation...</p>
    </div>
  ),
});

export default function ApiDocsPage() {
  const { isDarkMode } = useThemeContext();

  return (
    <div>
      {/* Header */}
      <div
        className={cn(
          'border-b px-8 py-6',
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        )}
      >
        <div className="max-w-[1200px] mx-auto space-y-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold">API Documentation</h1>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              v1.0.0
            </Badge>
          </div>
          <p className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
            Enterprise REST API for Patent Drafter AI. All endpoints require
            authentication and tenant context.
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <a
              href="/api/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 flex items-center space-x-1"
            >
              <span>OpenAPI Spec (JSON)</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span
              className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-600')}
            >
              •
            </span>
            <a
              href="https://github.com/your-org/patent-drafter-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 flex items-center space-x-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span
              className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-600')}
            >
              •
            </span>
            <a href="/docs/api" className="text-blue-500 hover:text-blue-600">
              Developer Guide
            </a>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div
        className="swagger-container"
        style={
          {
            '--swagger-bg-secondary': isDarkMode
              ? 'hsl(var(--secondary))'
              : 'hsl(var(--secondary))',
            '--swagger-border-color': isDarkMode
              ? 'hsl(var(--border))'
              : 'hsl(var(--border))',
            '--swagger-primary-color': isDarkMode
              ? 'hsl(var(--primary))'
              : 'hsl(var(--primary))',
            '--swagger-primary-hover': isDarkMode
              ? 'hsl(var(--primary))'
              : 'hsl(var(--primary))',
          } as React.CSSProperties
        }
      >
        <style>{`
          .swagger-container .swagger-ui {
            font-family: Inter, system-ui, sans-serif;
          }
          .swagger-container .swagger-ui .topbar {
            display: none;
          }
          .swagger-container .swagger-ui .info {
            margin-bottom: 2rem;
          }
          .swagger-container .swagger-ui .scheme-container {
            background-color: var(--swagger-bg-secondary);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
          }
          .swagger-container .swagger-ui .btn {
            border-radius: 6px;
          }
          .swagger-container .swagger-ui .btn.authorize {
            background-color: var(--swagger-primary-color);
            color: white;
            border: none;
          }
          .swagger-container .swagger-ui .btn.authorize:hover {
            background-color: var(--swagger-primary-hover);
          }
          .swagger-container .swagger-ui .opblock.opblock-post {
            border-color: var(--swagger-primary-color);
            background-color: var(--swagger-bg-secondary);
          }
          .swagger-container .swagger-ui .opblock.opblock-get {
            border-color: #60a5fa;
            background-color: #dbeafe;
          }
          .swagger-container .swagger-ui .opblock.opblock-put {
            border-color: #fb923c;
            background-color: #fed7aa;
          }
          .swagger-container .swagger-ui .opblock.opblock-delete {
            border-color: #ef4444;
            background-color: #fee2e2;
          }
          .swagger-container .swagger-ui .opblock-summary {
            border-radius: 6px;
          }
          .swagger-container .swagger-ui .parameter__name {
            font-weight: 600;
          }
          .swagger-container .swagger-ui .parameter__type {
            font-family: Consolas, Monaco, monospace;
            font-size: 0.875rem;
          }
          .swagger-container .swagger-ui table tbody tr td {
            padding: 0.75rem;
          }
          .swagger-container .swagger-ui .response-col_status {
            font-weight: 600;
          }
          .swagger-container .swagger-ui .model-box {
            border-radius: 6px;
            border: 1px solid var(--swagger-border-color);
          }
          .swagger-container .swagger-ui .model {
            font-family: Consolas, Monaco, monospace;
            font-size: 0.875rem;
          }
        `}</style>
        <SwaggerUI url="/api/swagger" />
      </div>
    </div>
  );
}
