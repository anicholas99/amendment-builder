# 2.1 System Overview

**Last Updated**: January 8, 2025

This document provides a high-level overview of the Patent Drafter AI application's architecture, technology stack, and core design principles.

## Table of Contents
- [Guiding Philosophy](#-guiding-philosophy-separation-of-concerns)
- [Technology Stack](#-technology-stack)
- [External Integrations](#-external-integrations)
- [Application Structure](#-application-structure)
- [Core Architectural Patterns](#-core-architectural-patterns)
- [Data Flow](#-data-flow)

---

## 🏛️ Guiding Philosophy: Separation of Concerns

Our architecture is built on a strict separation of concerns, with a clear boundary between:
-   **Client-Side Code**: React components, hooks, and client services (`src/components/`, `src/features/`, `src/client/services/`).
-   **Server-Side Code**: API routes, server services, and repositories (`src/pages/api/`, `src/server/`, `src/repositories/`).
-   **Shared Code**: Libraries, utilities, and types (`src/lib/`, `src/utils/`, `src/types/`).

This makes the codebase easier to navigate, debug, and extend.

---

## 🔧 Technology Stack

The application is built with a modern, type-safe technology stack:

### Core Framework
-   **Framework**: Next.js 15.2.4 (Pages Router)
-   **Language**: TypeScript (with `strict` mode enabled)
-   **Runtime**: Node.js 18+

### Frontend
-   **UI Library**: React 18 with shadcn/ui and Tailwind CSS
-   **Component System**: Radix UI primitives with custom styling
-   **State Management**: React Query (`@tanstack/react-query`) for server state and React Context for global UI state
-   **Form Handling**: React Hook Form with Zod validation
-   **Icons**: Lucide React

### Backend
-   **API**: Next.js API Routes with custom middleware system
-   **Database ORM**: Prisma
-   **Database**: Microsoft SQL Server (Azure SQL)
-   **Caching**: Redis with in-memory fallback
-   **Queue System**: Azure Storage Queue (with in-process fallback)
-   **File Storage**: Azure Blob Storage

### Authentication & Security
-   **Authentication**: Auth0 (with migration path to IPD Identity)
-   **Session Management**: Secure HTTP-only cookies
-   **API Security**: Bearer tokens for service-to-service
-   **Rate Limiting**: Redis-based with fallback

### AI & ML Services
-   **Primary AI**: Azure OpenAI
-   **Fallback AI**: OpenAI API
-   **External AI**: Cardinal AI API
-   **Chat Architecture**: Tool-based function calling

### Deployment & Infrastructure
-   **Container**: Docker
-   **Hosting**: Azure App Service
-   **CDN**: Azure CDN (planned)
-   **Monitoring**: Application Insights (planned)

---

## 🌐 External Integrations

### Cardinal AI API
-   **Purpose**: Advanced AI capabilities and patent analysis
-   **Endpoints**: Search, chat, citation extraction
-   **Authentication**: API key-based

### PatBase API
-   **Purpose**: Patent data enrichment and family information
-   **Features**: Patent lookup, family deduplication, metadata enrichment
-   **Authentication**: API key-based

### Azure Services
-   **Blob Storage**: Document and figure storage
-   **Queue Storage**: Asynchronous job processing
-   **SQL Database**: Primary data store

### Third-Party Services
-   **VirusTotal**: Malware scanning for uploads
-   **Auth0**: User authentication and management

---

## 📁 Application Structure

The `src/` directory is organized to reflect the separation of concerns:

```
src/
├── components/           # Reusable UI components and layouts
├── features/            # Feature-specific modules
│   ├── {feature}/
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/      # Feature-specific hooks
│   │   ├── utils/      # Feature utilities
│   │   └── types/      # Feature types
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   └── [tenant]/      # Multi-tenant pages
├── server/            # Server-side code
│   ├── services/      # Business logic services
│   ├── tools/         # AI tool implementations
│   └── prompts/       # AI prompt templates
├── repositories/      # Data access layer
├── lib/              # Shared libraries
│   ├── api/          # API clients
│   ├── auth/         # Authentication utilities
│   ├── cache/        # Caching utilities
│   └── validation/   # Schema validation
├── hooks/            # Global React hooks
├── contexts/         # React contexts
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

---

## 🏗️ Core Architectural Patterns

### 1. Repository Pattern
All database access is abstracted through repositories:
```typescript
// Example: projectRepository.ts
export class ProjectRepository {
  async findById(id: string, tenantId: string): Promise<Project | null> {
    // Database query with tenant isolation
  }
}
```

### 2. Service Layer
Business logic is encapsulated in services:
```typescript
// Example: patent.server-service.ts
export class PatentService {
  async generateClaims(projectId: string): Promise<Claims> {
    // Complex business logic
  }
}
```

### 3. Secure API Presets
Standardized security middleware composition:
```typescript
// Example API route
export default SecurePresets.tenantProtected(
  async (req, res) => {
    // Handler with built-in security
  }
);
```

### 4. Client Services
Frontend API calls are abstracted:
```typescript
// Example: project.client-service.ts
export const projectService = {
  getProject: (id: string) => apiClient.get(`/api/projects/${id}`),
  updateProject: (id: string, data: UpdateData) => apiClient.put(`/api/projects/${id}`, data)
};
```

### 5. Tool-Based AI Architecture
AI capabilities exposed as tools:
```typescript
// Example: AI tool
export const analyzePatentTool = {
  name: 'analyzePatent',
  description: 'Analyzes patent claims',
  parameters: { /* schema */ },
  execute: async (params) => { /* implementation */ }
};
```

---

## 🔄 Data Flow

### Request Lifecycle

1. **Client Request** → React Query → Client Service
2. **API Gateway** → Middleware Stack:
   - Rate Limiting
   - Authentication
   - CSRF Protection
   - Tenant Validation
   - Request Validation
3. **Business Logic** → Service Layer → Repository Layer
4. **Data Store** → Database/Cache/External API
5. **Response** → Transformation → Client

### Caching Strategy

```
Client → API → Cache Check → Database
              ↓ (miss)        ↓
              Redis     →    SQL Server
              ↓ (miss)
              In-Memory
```

### Async Processing

```
API Request → Immediate Response
     ↓
Queue Message → Worker Process → Update Database
                                 ↓
                              Notify Client
```

### Real-Time Updates

```
Client → SSE Connection → API
                         ↓
                    Stream Updates ← Service Events
```

---

## Security Architecture

### Defense in Depth
1. **Edge**: Rate limiting, DDoS protection
2. **Application**: Authentication, authorization, CSRF
3. **Data**: Encryption, validation, sanitization
4. **Infrastructure**: Network isolation, secrets management

### Tenant Isolation
- Database: Row-level security via tenant ID
- API: Automatic tenant context injection
- Storage: Tenant-prefixed blob containers
- Cache: Tenant-scoped keys

---

## Performance Optimizations

### Client-Side
- Code splitting and lazy loading
- Optimistic UI updates
- Request deduplication
- Prefetching strategies

### Server-Side
- Multi-tier caching
- Database query optimization
- Connection pooling
- Background job processing

### Infrastructure
- CDN for static assets
- Geographic distribution
- Auto-scaling policies
- Health monitoring

---

## Monitoring & Observability

### Logging
- Structured JSON logging
- Correlation IDs for request tracing
- Security event tracking
- Performance metrics

### Metrics
- API response times
- Error rates
- Cache hit ratios
- Queue depths

### Alerts
- Authentication failures
- Rate limit violations
- System errors
- Performance degradation

---

This architecture provides a scalable, secure, and maintainable foundation for the Patent Drafter AI application, with clear separation of concerns and well-defined patterns for common scenarios.