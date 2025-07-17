# Patent Drafter Application - Technical Reference Document

## Executive Summary

The Patent Drafter Application is an AI-powered platform that streamlines the patent application process for attorneys and inventors. This document outlines the current technical architecture and implementation details.

## Current System Architecture

### Frontend
- **Framework**: React 18 with Next.js 15.2.4
- **UI Library**: shadcn/ui with Tailwind CSS
- **State Management**: React Query + Context API
- **Language**: TypeScript with strict mode
- **Testing**: Jest with React Testing Library

### Backend
- **API**: Next.js API Routes with SecurePresets architecture
- **Authentication**: Auth0 (transitioning to IPD Identity)
- **Database**: Microsoft SQL Server with Prisma ORM
- **File Storage**: Azure Blob Storage with secure access patterns
- **Caching**: Redis with in-memory fallback
- **Rate Limiting**: Redis-backed distributed rate limiting

### AI Integration
- **Provider**: Azure OpenAI (configurable with standard OpenAI)
- **Models**: GPT-4, GPT-3.5-turbo with fallback support
- **Features**: Patent claim generation, invention analysis, chat assistance
- **Audit**: Comprehensive AI audit logging for compliance

## Key Features

### 1. Project Management
- Multi-project support per user/tenant
- Project collaboration with role-based access (viewer, editor, admin)
- Invention disclosure capture and processing
- Document version control with draft management
- Real-time collaboration support

### 2. Patent Search & Analysis
- **Search Provider**: Cardinal AI API
  - Semantic search with relevance scoring
  - Multi-query parallel search support
  - Configurable thresholds and filters
- **Citation Extraction**: Cardinal AI API
  - Element-based citation matching with V2 parser
  - Location finding within patents
  - Deep analysis capabilities with examiner-style assessment
- **Data Enrichment**: PatBase API
  - Patent metadata enrichment
  - Family deduplication
- Prior art saving and management with file linking
- Patent exclusion lists with metadata support

### 3. AI-Powered Assistance
- Chat interface for patent drafting help with tool invocations
- Claim generation and refinement with versioning
- Invention summary generation with structured data
- Prior art analysis with combined examiner analysis
- Comprehensive AI audit logging for compliance

### 4. Document Generation
- Patent application drafting with section generation
- Claims management with normalized storage
- Figure upload and management with element tracking
- Export capabilities (DOCX, PDF)
- Draft document management

### 5. Multi-Tenant Architecture
- Tenant isolation at database level with SecurePresets
- User-tenant relationships with role-based access
- Project collaboration within tenants
- Comprehensive audit trails

### 6. Security Architecture
- **SecurePresets Pattern**: Defense-in-depth security middleware
- **Rate Limiting**: Distributed Redis-backed rate limiting
- **CSRF Protection**: Token-based CSRF validation
- **Input Validation**: Zod schema validation
- **Malware Scanning**: VirusTotal integration
- **Session Security**: Enhanced session management

## Complete User Workflow

### 1. Project Creation & Invention Disclosure
1. User creates a new project with optional collaboration
2. Enters or pastes invention disclosure text
3. Uploads supporting documents (DOCX, PDF, TXT) with metadata extraction
4. Uploads invention figures/images with element tracking
5. Clicks "Process" to analyze invention with AI audit logging

### 2. Invention Processing & Structuring
- AI analyzes the disclosure to extract:
  - Title, abstract, summary with structured data
  - Technical field and background information
  - Key features and advantages as JSON arrays
  - Use cases and applications
  - Process steps and implementation details
  - Figure elements and reference numerals with normalization
- Data is structured into normalized database tables:
  - Core invention details with JSON field storage
  - Separate claim storage with versioning
  - Figure metadata with element relationships
  - Project documents with file linking support
- Users can edit and refine all extracted information
- All AI operations are logged for audit compliance

### 3. Claim Refinement & Analysis
1. **Initial Claims**: System generates initial patent claims from invention if needed
2. **Semantic Search**: User searches for relevant prior art
   - Multiple search queries generated from claim elements using V2 parser
   - Cardinal AI queues and processes searches in parallel
   - Results filtered by patent family and enriched with PatBase
3. **Citation Extraction**: For each relevant reference:
   - Queue citation job against current claim 1 elements
   - Cardinal AI finds matching citations in the reference
   - Raw results processed with deep analysis and examiner analysis
   - Citation matches created with relevance scores and locations
4. **Deep Analysis**: 
   - Examines how each prior art reference reads on claim elements
   - Provides examiner-style assessment (102/103 rejections)
   - Suggests claim amendments and distinctions
5. **Combined Examiner Analysis**:
   - Analyzes multiple references together
   - Determines if claims are anticipated (§102) or obvious (§103)
   - Provides strategic recommendations
   - Suggests revised claim language

### 4. Patent Application Generation
- User navigates to Patent Application view
- System generates complete application sections using AI:
  - Title and Abstract
  - Background and Technical Field
  - Brief Description of Drawings
  - Detailed Description
  - Claims (refined version)
- Figures integrated with proper numbering and element references
- Real-time preview and editing with draft management
- Export to DOCX or PDF format
- Version control for application iterations

## Technical Implementation

### Database Schema
```
Main Entities:
- User → UserTenant → Tenant
- Project → Invention, Claims, ProjectFigure, ProjectDocument
- Project → ProjectCollaborator (role-based access)
- SearchHistory → CitationJob → CitationMatch
- SavedPriorArt → SavedCitation (with file linking)
- ChatMessage (project conversations)
- AIAuditLog (AI operation compliance tracking)
- CombinedExaminerAnalysis (multi-reference analysis)
- UserPrivacy (GDPR compliance)
```

### API Structure
- RESTful endpoints under `/api/*`
- SecurePresets middleware composition for defense-in-depth security
- Repository pattern for database access with type safety
- Consistent error handling with ApplicationError system
- Comprehensive input validation with Zod schemas

### Security Architecture
- **SecurePresets Pattern**: Standardized security middleware stack
  1. Error Handling - Prevents information leakage
  2. Security Headers - X-Frame-Options, CSP, HSTS
  3. Rate Limiting - Distributed Redis-backed protection
  4. Authentication - JWT validation with Auth0/IPD
  5. Session Security - Enhanced session management
  6. CSRF Protection - Token-based validation
  7. Tenant Guard - Data isolation enforcement
  8. Input Validation - Zod schema validation
- JWT-based authentication with planned IPD migration
- Tenant context validation with automatic injection
- SQL injection prevention via Prisma ORM
- Rate limiting with graduated responses
- Malware scanning for file uploads

### File Storage
- Azure Blob Storage for documents/figures with secure access
- Project-specific containers for tenant isolation
- Secure URL generation with expiring links
- File type validation and malware scanning
- Size limits enforced per tenant

## IPD Integration (Replacing Auth0)

### Overview
IPD (IP Dashboard) will become the primary authentication and identity provider, replacing the current Auth0 implementation. This integration provides:
- Single Sign-On (SSO) across all IPD ecosystem applications
- Unified user and tenant management
- Centralized billing and subscription handling

### Authentication Flow
```
1. User visits Patent Drafter Application
2. Application checks for IPD session cookies:
   - ipd_session (encrypted session ID)
   - ipd_user (user claims and permissions)
   - ipd_tenant (active tenant context)
3. If no valid session:
   - Redirect to IPD login (https://ipdashboard.com/login)
   - User authenticates with IPD
   - IPD redirects back with session cookies
4. Application validates cookies:
   - Option 1: Call IPD validation API
   - Option 2: Verify cookie signature with IPD public key
5. Extract user context and permissions
6. Apply tenant-based access controls
```

### Implementation Status

#### Completed
- Configuration scaffolding in `src/config/ipd.ts`
- Cookie utilities in `src/lib/ipd/cookieUtils.ts`
- Redirect utilities in `src/lib/auth/redirects.ts`
- Environment variable structure
- Middleware hooks for future integration
- Authentication abstraction layer in `src/lib/auth/`

#### Pending IPD API Specifications
- Cookie format and encryption details
- Public key for signature validation
- API endpoints for session validation
- Webhook URLs for real-time updates
- User claim structure

### Migration Plan
1. **Phase 1**: Dual authentication support
   - Keep Auth0 active
   - Add IPD as optional provider
   - Toggle via `NEXT_PUBLIC_AUTH_TYPE` environment variable

2. **Phase 2**: IPD primary, Auth0 fallback
   - Default new users to IPD
   - Migrate existing users gradually
   - Maintain Auth0 for legacy accounts

3. **Phase 3**: Complete migration
   - Remove Auth0 dependencies
   - IPD-only authentication
   - Clean up legacy code

### Configuration
```env
# IPD Integration Settings
IPD_BASE_URL=https://ipdashboard.com
IPD_API_URL=https://api.ipdashboard.com
IPD_COOKIE_DOMAIN=.ipdashboard.com
IPD_SESSION_COOKIE_NAME=ipd_session
IPD_USER_COOKIE_NAME=ipd_user
IPD_TENANT_COOKIE_NAME=ipd_tenant
IPD_PUBLIC_KEY=<public-key-for-validation>
IPD_VALIDATION_METHOD=api_endpoint
NEXT_PUBLIC_USE_IPD_IDENTITY=true
NEXT_PUBLIC_AUTH_TYPE=ipd
```

### Key Integration Points
- **Login**: Redirect to IPD login page
- **Logout**: Clear IPD cookies and redirect
- **Session Refresh**: Call IPD token refresh endpoint
- **Tenant Switching**: Update tenant context via IPD API
- **User Profile**: Sync with IPD user management

## Cardinal AI Integration

### Search Workflow
1. Queue search job with Cardinal AI (`/semantic-search/queue`)
2. Poll for results with exponential backoff (`/semantic-search/result`)
3. Filter results by patent family (via PatBase)
4. Apply project exclusions with metadata
5. Enrich metadata with PatBase
6. Return processed results with audit logging

### Citation Extraction Flow
1. User selects a relevant reference from search results
2. System queues citation job for that reference
   - Sends parsed elements from current claim 1 using V2 parser
   - Configurable relevance threshold (default 30%)
3. Cardinal AI processes the job asynchronously
4. System polls for results (status 0: processing, 1: complete, 2: failed)
5. Raw citation data undergoes deep analysis:
   - Element-by-element comparison with enhanced scoring
   - Relevance scoring and ranking with top results identification
   - Location identification within patent
   - Examiner-style analysis for 102/103 rejections
6. Results stored as CitationMatch records with analysis source tracking
7. UI displays matches grouped by claim element with reasoning

### Combined Analysis Flow
1. User selects multiple references for combined analysis
2. System retrieves deep analysis data for each reference
3. AI evaluates references together to determine:
   - Single reference anticipation (§102)
   - Obviousness combinations (§103)
   - Motivation to combine references
4. Generates revised claim language with strategic recommendations
5. Provides comprehensive examiner-style assessment
6. All AI operations logged for audit compliance

## Error Handling

### ApplicationError System
The application uses a centralized error handling system with typed error codes:

```typescript
// Common error codes
ErrorCode.VALIDATION_FAILED        // 400 - Bad request
ErrorCode.AUTH_UNAUTHORIZED         // 401 - Authentication required
ErrorCode.AUTH_FORBIDDEN           // 403 - Forbidden
ErrorCode.DB_RECORD_NOT_FOUND      // 404 - Not found
ErrorCode.RATE_LIMIT_EXCEEDED      // 429 - Too many requests
ErrorCode.INTERNAL_ERROR           // 500 - Server error
ErrorCode.AI_SERVICE_ERROR         // 500 - AI service error
ErrorCode.STORAGE_UPLOAD_FAILED    // 500 - File upload failed
ErrorCode.SECURITY_MALWARE_DETECTED // 400 - Malware detected
```

### SecurePresets Pattern
All API routes use the SecurePresets pattern for consistent error responses:
- Catches and logs all errors with structured logging
- Maps ApplicationError codes to HTTP status codes
- Returns sanitized error messages to clients
- Includes request IDs for tracking
- Prevents information leakage

### Client Error Display
- Never expose internal error details
- Provide user-friendly messages
- Log full errors server-side with context
- Use React error boundaries for graceful degradation

## Rate Limiting

### Configuration by Endpoint Type
| Endpoint Type | Requests | Window | Purpose | Redis Key |
|--------------|----------|---------|---------|-----------|
| Auth | 5 | 5 minutes | Login protection | rl:auth: |
| AI/ML | 20 | 5 minutes | AI service limits | rl:ai: |
| Search | 50 | 1 hour | Search operations | rl:search: |
| Upload | 10 | 5 minutes | File upload protection | rl:upload: |
| Standard API | 100 | 1 minute | General API access | rl:api: |
| Read-only | 500 | 15 minutes | Data retrieval | rl:read: |

### Implementation
- Redis-backed distributed rate limiting
- Falls back to memory storage if Redis unavailable
- User + Tenant based tracking for multi-tenancy
- Standard rate limit headers in responses
- Graduated response with Retry-After headers

### Usage
```typescript
// Apply rate limiting via SecurePresets
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    rateLimit: 'ai', // Uses AI preset
    validate: { body: requestSchema }
  }
);
```

## Data Privacy & Compliance

### GDPR Compliance
- **Right to Access**: User data export functionality
- **Right to Erasure**: Complete data deletion with soft deletes
- **Consent Management**: UserPrivacy model for consent tracking
- **Data Retention**: Configurable retention periods per user
- **Privacy by Design**: Built into SecurePresets architecture

### Audit Logging
All data access and modifications are logged:
- **General Audit**: User actions, API requests, resource modifications
- **AI Audit**: Comprehensive AI operation logging with token usage
  - Operation type, model used, prompt/response content
  - Token usage tracking for billing/compliance
  - Human review workflow for sensitive operations
  - Export capabilities for compliance reporting
- Stored with appropriate retention policies

### Data Security
- Encryption at rest (SQL Server TDE)
- Encryption in transit (TLS 1.3)
- Soft deletes for data recovery
- Tenant isolation enforced via SecurePresets
- Malware scanning for all file uploads

## Deployment Configuration

### Environment Variables

#### Core Requirements
```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=sqlserver://server:1433;database=patent_drafter;...

# Authentication (Current - Auth0)
AUTH0_SECRET=minimum-32-characters
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Authentication (Future - IPD)
IPD_BASE_URL=https://ipdashboard.com
IPD_API_URL=https://api.ipdashboard.com
IPD_COOKIE_DOMAIN=.ipdashboard.com
IPD_SESSION_COOKIE_NAME=ipd_session
IPD_USER_COOKIE_NAME=ipd_user
IPD_TENANT_COOKIE_NAME=ipd_tenant
IPD_PUBLIC_KEY=your-ipd-public-key
NEXT_PUBLIC_USE_IPD_IDENTITY=true
NEXT_PUBLIC_AUTH_TYPE=ipd

# AI Services
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_STORAGE_CONTAINER_NAME=figures

# External APIs
AIAPI_API_KEY=cardinal-api-key
PATBASE_USER=patbase-username
PATBASE_PASS=patbase-password

# Redis (recommended for production)
REDIS_URL=rediss://your-redis.redis.cache.windows.net:6380

# Security
VIRUSTOTAL_API_KEY=your-virustotal-key
CSP_MODE=strict
```

### Azure Deployment
1. **Resources Required**:
   - Azure App Service (Linux, Docker)
   - Azure SQL Database with performance tier
   - Azure Blob Storage with secure access
   - Azure Redis Cache for distributed operations
   - Azure Container Registry

2. **Deployment Steps**:
   - Build Docker image: `docker build -t patent-drafter .`
   - Push to ACR: `docker push yourregistry.azurecr.io/patent-drafter`
   - Configure App Service environment variables
   - Run migrations: `npx prisma migrate deploy`
   - Apply database indexes for performance

3. **Health Monitoring**:
   - Health endpoint: `/api/health` with detailed checks
   - Application Insights integration
   - Structured logging to Azure Monitor
   - Rate limit monitoring and alerting

## Common Operations

### Database Migrations
```bash
# Generate migration from schema changes
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Adding New Users
```bash
# Use the provided SQL scripts in prisma/ directory to add users to tenants
# See prisma/create-tenant-user.sql for the template
```

### Monitoring & Debugging
- **Logs**: Check Application Insights or structured logs
- **API Errors**: Look for request IDs in error responses
- **Performance**: Monitor `/api/health` metrics with detailed checks
- **Database**: Check slow query logs in Azure SQL
- **Rate Limits**: Monitor Redis rate limit keys and violations
- **AI Operations**: Check AIAuditLog for operation tracking

### Troubleshooting

#### Common Issues
1. **Authentication Failures**
   - Verify Auth0/IPD configuration matches environment
   - Check cookie domain settings and CSRF tokens
   - Validate JWT secret and session configuration

2. **API Rate Limiting**
   - Check Redis connection and rate limit violations
   - Monitor rate limit headers in responses
   - Adjust limits in SecurePresets configuration

3. **File Upload Errors**
   - Verify Azure Storage connection string
   - Check container permissions and malware scanning
   - Ensure VirusTotal API key is configured

4. **AI Service Errors**
   - Validate API keys and endpoints
   - Check service quotas/limits and token usage
   - Monitor timeout settings and audit logs

5. **Database Performance**
   - Check index usage and query performance
   - Monitor connection pool usage
   - Verify tenant isolation in queries

## Performance Characteristics

### Current Metrics
- Average API response: <500ms with SecurePresets
- Document generation: 5-10 seconds with AI audit
- AI chat response: 3-5 seconds with tool invocations
- Search queries: 2-5 seconds with caching
- Citation extraction: 10-30 seconds per reference with deep analysis

### Infrastructure
- Azure App Service hosting with auto-scaling
- Azure SQL Database with performance monitoring
- Azure Redis Cache for distributed operations
- Azure Application Insights monitoring
- Azure Blob Storage with CDN integration

## Development Workflow

### Tech Stack
- Node.js 20 LTS with strict TypeScript
- pnpm package manager
- ESLint with security-focused custom rules
- Jest for testing with React Testing Library
- Prisma for type-safe database access

### Key Directories
```
src/
├── components/     # Reusable UI components with accessibility
├── features/       # Feature-specific modules
├── pages/api/      # API endpoints with SecurePresets
├── repositories/   # Database access layer with type safety
├── services/       # Business logic and external integrations
├── lib/           # Utilities and integrations
├── middleware/     # API middleware (auth, validation, etc.)
├── types/         # TypeScript definitions
└── server/        # Server-side services and tools
```

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint with security rules (no console.log, no direct API calls)
- Repository pattern for database access
- Service layer architecture for API calls
- SecurePresets for all API endpoints
- Comprehensive error handling
- AI audit logging for compliance

## External Integrations

### Active
- Auth0 (authentication - being replaced by IPD)
- Azure OpenAI (AI features with audit logging)
- Cardinal AI API (search & citation extraction)
- PatBase API (data enrichment)
- Azure services (storage, monitoring, Redis)
- VirusTotal (malware scanning)

### Planned
- IPD Dashboard (full SSO - replacing Auth0)
- USPTO direct filing (future)
- Enhanced AI providers (Anthropic Claude)

## AI Audit & Compliance

### AI Audit Logging
All AI operations are comprehensively logged:
- **Operation Tracking**: Type of AI operation (generate-claims, analyze-prior-art, etc.)
- **Model Information**: AI provider, model name, version
- **Content Logging**: Full prompt and response content
- **Token Usage**: Detailed token consumption for billing
- **Status Tracking**: Success/failure with error messages
- **Human Review**: Workflow for reviewing sensitive AI operations
- **Export Capabilities**: Compliance reporting and data export

### Compliance Features
- **SOC 2 Compliance**: Comprehensive audit trails
- **GDPR Compliance**: User privacy controls and data export
- **AI Governance**: Human review workflow for AI operations
- **Data Retention**: Configurable retention policies
- **Export Controls**: Audit log export for compliance reporting

---

**Version**: 2.0  
**Last Updated**: January 2025  
**Status**: Current Implementation with IPD Migration Planning 