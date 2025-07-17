# Patent Drafter AI - Project Handover Guide

This guide provides a comprehensive overview of the Patent Drafter AI project for new team members or anyone taking over development responsibilities.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Summary](#architecture-summary)
3. [Key Technologies](#key-technologies)
4. [Development Setup](#development-setup)
5. [Critical Systems](#critical-systems)
6. [Known Issues & Technical Debt](#known-issues--technical-debt)
7. [Deployment & Operations](#deployment--operations)
8. [Key Contacts & Resources](#key-contacts--resources)

## Project Overview

Patent Drafter AI is an enterprise-grade web application that automates patent application drafting using AI. It serves patent attorneys and inventors by:

- Generating patent claims and full applications using GPT-4/Claude
- Searching prior art using semantic search (Cardinal AI)
- Managing multi-tenant environments with secure data isolation
- Processing technical documents and figures
- Providing real-time collaboration features

### Business Context
- **Primary Users**: Patent attorneys, patent agents, inventors
- **Key Value**: Reduces patent drafting time from weeks to hours
- **Scale**: Supports multiple enterprise tenants with isolated data

## Architecture Summary

### High-Level Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│  API Routes  │────▶│  SQL Server │
│   Frontend  │     │  + Middleware │     │  (Prisma)   │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
              ┌─────▼────┐    ┌─────▼────┐
              │ OpenAI/  │    │ Cardinal │
              │ Claude   │    │    AI    │
              └──────────┘    └──────────┘
```

### Key Design Decisions

1. **Monolithic Architecture**: All services run within the Next.js application for simplicity
2. **Repository Pattern**: Clean separation between data access and business logic
3. **Middleware Composition**: Modular request handling pipeline
4. **Async Processing**: Long-running operations use `setImmediate()` instead of external workers

## Key Technologies

### Core Stack
- **Framework**: Next.js 13.5+ with App Router
- **Language**: TypeScript 5.3.3 (strict mode)
- **Database**: Microsoft SQL Server with Prisma ORM
- **UI**: Tailwind CSS with shadcn/ui components and custom theme
- **Authentication**: Auth0 (transitioning to IPD Identity)

### AI Services
- **OpenAI GPT-4**: Primary text generation
- **Anthropic Claude**: Alternative AI provider
- **Cardinal AI**: Semantic patent search

### Infrastructure
- **Hosting**: Azure App Service
- **Storage**: Azure Blob Storage
- **Rate Limiting**: Redis (with in-memory fallback)
- **Monitoring**: Winston + Azure Application Insights

## Development Setup

### Quick Start
```bash
# 1. Clone and install
git clone <repository>
cd patent-drafter-ai
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Setup database
npx prisma migrate dev
npm run db:seed

# 4. Start development
npm run dev
```

### Essential Environment Variables
- `DATABASE_URL`: SQL Server connection string
- `AUTH0_*`: Authentication configuration
- `OPENAI_API_KEY`: For AI features
- `AIAPI_API_KEY`: For patent search

See `.env.example` in the project root for the complete list of environment variables.

## Critical Systems

### 1. Authentication & Authorization
- **Location**: `src/middleware/auth.ts`
- **Pattern**: JWT validation with Auth0
- **Key Feature**: Multi-tenant isolation via `tenantId` in JWT

### 2. AI Integration
- **Location**: `src/server/services/openai.server-service.ts`
- **Pattern**: Streaming responses for real-time generation
- **Rate Limits**: Managed per-tenant to prevent abuse

### 3. Patent Search
- **Location**: `src/server/services/semantic-search.server-service.ts`
- **Pattern**: Async search with polling
- **Key Files**: 
  - API: `/pages/api/search-history/async-search.ts`
  - Client: `/src/features/search/hooks/useSearchExecution.ts`

### 4. Document Processing
- **Location**: `src/features/patent-application/`
- **Editor**: TipTap-based rich text editor
- **Storage**: Azure Blob Storage for figures

### 5. Real-time Features
- **Chat**: Streaming AI responses via Server-Sent Events
- **Auto-save**: Debounced saves every 5 seconds
- **Collaboration**: Optimistic updates with conflict resolution

## Known Issues & Technical Debt

### High Priority
1. **TypeScript `any` Types**: ~700 instances need fixing
   - Guide: [ANY_TYPE_FIX_GUIDE.md](../ANY_TYPE_FIX_GUIDE.md)
   - Track progress with `npm run track:any-usage`

2. **Performance Issues**:
   - Large patent applications (>100 pages) cause slowdowns
   - Database queries need optimization (see indexes in migrations)

3. **Security Enhancements**:
   - CSRF protection recently added, needs testing
   - Rate limiting requires Redis in production

### Medium Priority
1. **Test Coverage**: Currently at 70%, target is 80%
2. **Error Handling**: Some async operations lack proper error boundaries
3. **Code Organization**: Some features have grown too large (e.g., patent-application)

### Technical Debt Tracking
- Security issues: `npm run security:scan`
- Code quality: `npm run audit:full`
- Migration progress: `npm run migration:progress`

## Deployment & Operations

### Deployment Process
1. **Staging**: Automatic deployment on push to `staging` branch
2. **Production**: Manual approval required after staging tests
3. **Rollback**: Keep 3 previous versions in Azure App Service

### Monitoring & Alerts
- **Health Check**: `GET /api/health`
- **Logs**: Structured JSON logs in Azure Application Insights
- **Metrics**: Custom events for key operations (search, generation, etc.)

### Common Issues & Solutions

1. **"Database connection timeout"**
   - Check Azure SQL firewall rules
   - Verify connection pool settings

2. **"AI generation failed"**
   - Check API key validity
   - Monitor rate limits in logs

3. **"File upload errors"**
   - Verify Azure Storage connection
   - Check CORS settings

### Scaling Considerations
- Database connection pool: Max 10 connections
- API rate limits: 100 requests/15 minutes per user
- File size limits: 5MB per upload

## Key Contacts & Resources

### Documentation
- [Architecture Docs](./02-architecture/README.md)
- [API Documentation](/src/pages/api/README.md)
- [Security Guide](./SECURITY_ARCHITECTURE.md)
- [Database Schema](/prisma/schema.prisma)

### External Services
- **Auth0 Dashboard**: https://manage.auth0.com
- **Azure Portal**: https://portal.azure.com
- **Cardinal AI Support**: support@cardinalai.com

### Internal Resources
- **Jira Project**: [Link to Jira]
- **Confluence Space**: [Link to Confluence]
- **Slack Channel**: #patent-drafter-dev

### Emergency Contacts
- **On-Call Engineer**: Check PagerDuty rotation
- **Product Owner**: [Contact details]
- **Tech Lead**: [Contact details]

## Next Steps for New Developers

1. **Week 1**: 
   - Complete local setup
   - Read architecture documentation
   - Run through the application as a user

2. **Week 2**:
   - Pick up a "good first issue" from backlog
   - Shadow code reviews
   - Attend sprint ceremonies

3. **Week 3+**:
   - Take on feature development
   - Participate in on-call rotation
   - Contribute to documentation

## Important Notes

- **Data Sensitivity**: This application handles confidential patent information. Never log sensitive data.
- **Multi-tenancy**: Always verify tenant isolation when making database changes.
- **AI Costs**: Be mindful of AI API usage; costs can escalate quickly.
- **Backward Compatibility**: Many enterprise clients; avoid breaking changes.

---

*Last Updated: January 2025*
*For questions not covered here, reach out to the development team on Slack.*