# 🔄 Patent Drafter AI - Handover Guide

> **Complete guide for the incoming developer taking over this codebase**

## 📋 Executive Summary

Patent Drafter AI is a sophisticated enterprise-grade application for automated patent drafting and prior art analysis. The system uses advanced AI models to analyze inventions, generate patent claims, search for prior art, and produce complete patent applications.

**Key Stats:**
- **Language**: TypeScript (99% coverage)
- **Framework**: Next.js 15+ with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth0 with JWT tokens
- **Infrastructure**: Docker + Azure App Service
- **Security Score**: B+ (83/100) - Strong security posture

---

## 🚨 **CRITICAL IMMEDIATE ACTIONS REQUIRED**

### 1. Security Issues (DO FIRST)
- **🔴 URGENT**: Rotate ALL API keys immediately - they're exposed in git history
- **🔴 URGENT**: Remove environment files from version control
- **🔴 URGENT**: Implement proper secrets management (Azure Key Vault)

See [Security Audit Report](SECURITY_AUDIT_REPORT.md) for complete details.

### 2. Environment Setup Issues
- Fix hardcoded session secret fallbacks
- Configure proper Redis authentication
- Remove `unsafe-inline` from CSP configuration

---

## 🏗️ **Architecture Overview**

### Technology Stack
- **Frontend**: Next.js, React 18, TypeScript, Chakra UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Azure SQL Database in production)
- **Authentication**: Auth0 with multi-tenant support
- **AI Services**: OpenAI GPT-4, Anthropic Claude, Cardinal AI
- **Storage**: Azure Blob Storage
- **Caching**: Redis (rate limiting), React Query (client state)

### Key Architectural Patterns
1. **Repository Pattern**: All database access through `src/repositories/`
2. **Service Layer**: Business logic in `src/server/services/`
3. **Client Services**: API calls through `src/client/services/`
4. **Async Processing**: Background jobs using `setImmediate()` pattern
5. **Secure-by-Default**: All API routes use SecurePresets middleware

### Directory Structure
```
src/
├── client/services/      # Client-side API services
├── server/services/      # Server-side business logic  
├── repositories/         # Database access layer
├── features/            # Feature modules (claim-refinement, patent-application, etc.)
├── components/          # Reusable UI components
├── pages/api/           # API endpoints
├── middleware/          # Security, auth, validation middleware
├── lib/                 # Core libraries and utilities
└── types/               # TypeScript definitions
```

---

## 🚀 **Getting Started**

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Auth0 account
- API keys: OpenAI, Cardinal AI, Azure Storage

### 2. Quick Setup
```bash
# Clone and install
git clone <repo-url>
cd patent-drafter-ai
npm install

# Setup environment (CRITICAL: Use placeholder values, never real secrets)
cp .env.example .env.local
# Edit .env.local with your configuration

# Database setup
npx prisma migrate dev
npx prisma generate

# Start development
npm run dev
```

### 3. Essential Configuration
See [Getting Started Guide](01-getting-started.md) for complete setup instructions.

---

## 🔑 **Core Features Overview**

### 1. Patent Application Generation
- **Location**: `src/features/patent-application/`
- **Purpose**: AI-powered patent application drafting
- **Key Components**: TiptapPatentEditor, PatentGenerationPlaceholder
- **API**: `/api/[tenant]/patents/`

### 2. Claim Refinement
- **Location**: `src/features/claim-refinement/`
- **Purpose**: Interactive claim editing and analysis
- **Key Components**: ClaimRefinementView, EditableClaim
- **API**: `/api/[tenant]/claims/`

### 3. Citation Extraction
- **Location**: `src/features/citation-extraction/`
- **Purpose**: Prior art search and analysis
- **Key Components**: CitationExtractionPanel, CitationResultsTable
- **API**: `/api/[tenant]/citation-extraction/`
- **Async Pattern**: Uses background processing with polling

### 4. Figure Management
- **Location**: `src/features/technology-details/`
- **Purpose**: Upload and manage patent figures
- **Storage**: Azure Blob Storage with malware scanning
- **API**: `/api/[tenant]/figures/`

### 5. Chat Interface
- **Location**: `src/features/chat/`
- **Purpose**: AI assistant for patent-related questions
- **Streaming**: Real-time responses using Server-Sent Events
- **API**: `/api/[tenant]/chat/`

---

## 🔒 **Security Architecture**

### Authentication & Authorization
- **Auth0 Integration**: JWT tokens with secure session management
- **Multi-Tenant**: Strong tenant isolation with row-level security
- **RBAC**: Role-based access control (USER, ADMIN, INTERNAL_SERVICE)
- **API Protection**: All routes use SecurePresets middleware

### Security Features
- **CSRF Protection**: Double-submit cookie pattern
- **Rate Limiting**: Redis-backed with progressive penalties
- **Input Validation**: Zod schemas on all endpoints
- **File Upload Security**: Magic number validation, malware scanning
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

### Security Headers
- Content Security Policy (CSP)
- HSTS with preload
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

---

## 📊 **Data Flow & Async Architecture**

### Request Flow
```
Client Component → Client Service → API Route → Server Service → Repository → Database
```

### Async Processing Pattern
The application uses `setImmediate()` for background processing:

1. **Semantic Search** (~5-10 seconds)
2. **Citation Extraction** (~25 seconds)

Pattern:
```typescript
// API creates job record, returns immediately
const job = await createJobRecord(data);
setImmediate(async () => {
  await processInBackground(job);
});
res.status(202).json({ jobId: job.id });
```

### Key Async Services
- **Location**: `src/client/services/ASYNC_QUICK_REFERENCE.md`
- **Monitoring**: Status polling via `/api/status` endpoints
- **Error Handling**: Comprehensive retry and timeout logic

---

## 🗄️ **Database Architecture**

### Key Models (Prisma Schema)
- **Users & Tenants**: Multi-tenant user management
- **Projects**: Container for patent work
- **Inventions**: Core invention data
- **Claims**: Patent claims with versioning
- **Citations**: Prior art references
- **Figures**: Uploaded technical drawings
- **SearchHistory**: Search queries and results
- **AuditLogs**: Security and compliance tracking

### Important Patterns
- **Soft Deletes**: Most models support soft deletion
- **Tenant Isolation**: All queries filtered by tenant
- **Versioning**: Claims and patents support version history
- **Audit Trail**: Comprehensive logging for SOC 2 compliance

---

## 🧪 **Testing Strategy**

### Test Structure
```bash
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:security # Security tests
```

### Key Test Areas
- **API Endpoints**: Request/response validation
- **Repository Layer**: Database operations
- **Authentication**: Auth0 integration
- **File Upload**: Security validation
- **Error Handling**: Edge cases and failures

---

## 🚢 **Deployment & Operations**

### Environments
- **Development**: Local with Azurite storage emulator
- **Staging**: Azure App Service with shared resources
- **Production**: Azure App Service with dedicated resources

### Deployment Process
```bash
# Build and deploy
npm run build
docker build -t patent-drafter-ai .
# Deploy to Azure App Service
```

### Monitoring
- **Health Check**: `/api/health`
- **Logging**: Winston with structured logging
- **Error Tracking**: Azure Application Insights
- **Performance**: Custom metrics and monitoring

### Key Scripts
```bash
npm run security:scan     # Security audit
npm run audit:full       # Comprehensive audit
npm run db:migrate-dev    # Database migrations
npm run type-check       # TypeScript validation
```

---

## 🔧 **Development Workflows**

### Code Quality Standards
- **TypeScript**: Strict mode enabled, minimal `any` usage
- **ESLint**: Custom rules for security and consistency
- **Prettier**: Automated code formatting
- **Pre-commit**: Security checks and linting

### Custom ESLint Rules
- **no-direct-api-calls**: Enforce service layer usage
- **no-direct-prisma-import**: Require repository pattern
- **no-legacy-error-handling**: Modern error patterns
- **no-magic-time-values**: Use constants for timeouts

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature development
- **hotfix/***: Critical fixes

---

## 🐛 **Common Issues & Solutions**

### Authentication Issues
- **Symptom**: "User not found" errors
- **Solution**: Check Auth0 configuration and user-tenant associations
- **Script**: `npm run debug:user-tenant`

### Citation Extraction Stuck
- **Symptom**: "Analyzing relevance..." spinning forever
- **Solution**: Check `INTERNAL_API_KEY` configuration
- **Monitoring**: Check job status in database

### Database Connection Issues
- **Symptom**: Prisma connection errors
- **Solution**: Verify `DATABASE_URL` and database availability
- **Debug**: Enable Prisma query logging

### Rate Limiting Triggered
- **Symptom**: 429 Too Many Requests
- **Solution**: Check Redis connection and rate limit configuration
- **Script**: `npm run test:redis`

---

## 📚 **Key Documentation**

### Must-Read Documents
1. [Getting Started Guide](01-getting-started.md) - Setup instructions
2. [Architecture Overview](02-architecture/README.md) - System design
3. [Security Architecture](SECURITY_ARCHITECTURE.md) - Security patterns
4. [Async Services Guide](../src/client/services/ASYNC_QUICK_REFERENCE.md) - Background processing
5. [Directory Guide](../DIRECTORY_GUIDE.md) - Code organization

### Development References
- [Coding Standards](03-development-practices/01-coding-style.md)
- [Testing Strategy](03-development-practices/02-testing-strategy.md)
- [API Design](02-architecture/04-api-design.md)
- [Error Handling](../src/utils/error-handling/README.md)

### Operations
- [Azure Deployment](04-deployment-and-ops/01-azure-deployment.md)
- [Docker Guide](04-deployment-and-ops/02-docker-guide.md)
- [Monitoring Setup](04-deployment-and-ops/03-monitoring-and-health.md)

---

## 🚀 **Immediate Next Steps**

### Week 1: Security & Setup
1. ✅ Rotate all exposed API keys
2. ✅ Set up proper secrets management
3. ✅ Configure development environment
4. ✅ Run security audit and fix critical issues
5. ✅ Review authentication flow

### Week 2: Core Features
1. ✅ Understand patent generation workflow
2. ✅ Test claim refinement features
3. ✅ Verify citation extraction process
4. ✅ Test file upload and figure management
5. ✅ Review async processing patterns

### Week 3: Advanced Features
1. ✅ Chat interface and streaming
2. ✅ Multi-tenant architecture
3. ✅ Database schema and relationships
4. ✅ Error handling patterns
5. ✅ Performance optimization opportunities

### Week 4: Operations
1. ✅ Deployment process
2. ✅ Monitoring and logging
3. ✅ Testing strategies
4. ✅ Backup and recovery procedures
5. ✅ Documentation updates

---

## 📞 **Support & Escalation**

### Technical Issues
1. **Check logs**: Application logs in Azure App Insights
2. **Database issues**: Use Prisma Studio for debugging
3. **API problems**: Enable debug logging in development
4. **Security concerns**: Review audit logs and security headers

### Knowledge Transfer Sessions
- **Codebase walkthrough**: 2-hour deep dive
- **Feature demonstrations**: Live system tour
- **Deployment process**: Hands-on deployment
- **Troubleshooting**: Common issues and solutions

### Contact Information
- **Previous Developer**: [Contact info when available]
- **Product Owner**: [Contact info]
- **DevOps/Infrastructure**: [Contact info]

---

## 🏆 **Success Criteria**

You'll know you're successful when you can:
- ✅ Set up the development environment from scratch
- ✅ Understand the multi-tenant architecture
- ✅ Modify and deploy a feature end-to-end
- ✅ Debug common issues independently
- ✅ Explain the async processing patterns
- ✅ Navigate the security architecture
- ✅ Perform database migrations safely
- ✅ Monitor application health and performance

---

## 📝 **Final Notes**

This codebase demonstrates strong engineering practices with:
- **Type Safety**: Comprehensive TypeScript usage
- **Security**: Defense-in-depth approach
- **Testing**: Good test coverage and patterns
- **Documentation**: Comprehensive guides and references
- **Monitoring**: Production-ready observability

The main areas for improvement are:
- **Secrets Management**: Move to proper vault solution
- **API Documentation**: Generate OpenAPI specs
- **Performance**: Optimize long-running operations
- **Error Recovery**: Enhanced retry mechanisms

**Remember**: This is a production system handling sensitive patent data. Always prioritize security and data integrity in any changes you make.

Good luck! 🚀