# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amendment Builder (Patent Drafter AI) is an enterprise-grade application for automated patent amendment drafting and Office Action response. It leverages AI models (GPT-4, Claude) to help patent attorneys efficiently respond to USPTO Office Actions with comprehensive audit logging and security controls.

## Development Commands

### Core Development
```bash
npm run dev                # Start development server (port 3000)
npm run build             # Build for production
npm run start             # Start production server
npm run type-check        # Run TypeScript type checking
npm run lint              # Run ESLint with auto-fix
npm run lint:fix          # Alternative ESLint with auto-fix
```

### Database Management
```bash
npm run db:migrate-dev    # Create and apply development migrations
npm run db:push           # Push schema changes without migration (dev only)
npm run db:generate       # Generate Prisma client
npm run db:studio         # Open Prisma Studio for database inspection
npm run db:seed           # Seed database with test data
npm run db:reset          # Reset database and reseed
npm run db:apply-indexes  # Apply database performance indexes
```

### Testing
```bash
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:ci           # Run tests in CI mode

# Run a single test file
npm test -- path/to/test.test.ts
```

### Security & Quality Audits
```bash
npm run security:scan     # Run comprehensive security audit
npm run audit:full        # Run all code quality audits
npm run audit:csrf        # Verify CSRF protection coverage
npm run verify:dark-mode  # Verify dark mode compatibility
npm run check:env         # Validate environment variables
```

### Code Quality
```bash
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting
npm run find:any          # Find TypeScript 'any' usage
npm run find:console      # Find console statements
npm run cleanup:unused-deps # Find unused dependencies
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.2.4, React 18, TypeScript (strict mode)
- **UI**: shadcn/ui components, Tailwind CSS, Radix UI primitives
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Microsoft SQL Server (Azure SQL)
- **AI Services**: Azure OpenAI (GPT-4), Anthropic Claude, Cardinal AI for patent search
- **Auth**: Auth0 (migrating to IPD Identity Platform)
- **Storage**: Azure Blob Storage for documents/figures
- **Cache**: Redis for rate limiting and caching
- **Security**: SecurePresets pattern for defense-in-depth

### Core Patterns

1. **SecurePresets Pattern**: Standardized security middleware composition
   ```typescript
   export default SecurePresets.tenantProtected(
     TenantResolvers.fromProject,
     handler,
     { rateLimit: 'ai', validate: { body: requestSchema } }
   );
   ```

2. **Repository Pattern**: All database access through repositories in `/src/repositories/`
   - Automatic tenant context injection
   - Soft deletes via Prisma middleware
   - Type-safe queries with Zod validation

3. **Service Layer**: Business logic in `/src/services/`
   - Request-scoped services with context injection
   - AI operations abstracted into service methods
   - External API integrations

4. **Client Services**: Frontend API abstraction in `/src/client/services/`
   - Built on React Query for caching
   - Type-safe request/response handling
   - Automatic error handling

### Multi-Tenant Architecture

- Row-level security at repository layer
- Tenant context flows: Request → Middleware → Service → Repository
- All queries filtered by `tenantId`
- User permissions via `UserTenantRole` model

### Security Requirements

1. **Authentication & Authorization**
   - All API routes require authentication (except `/api/health/*`)
   - Role-based access control (Admin/Member/Viewer)
   - Tenant isolation enforced at data layer

2. **Input Validation**
   - Zod schemas for all API input validation
   - File upload validation with malware scanning
   - Never use `z.any()` without justification

3. **Rate Limiting**
   - Redis-backed distributed rate limiting
   - Different limits by endpoint type:
     - Auth: 5 req/5min
     - AI/ML: 20 req/5min
     - Search: 50 req/hour
     - Standard: 100 req/min

### Key Conventions

1. **TypeScript**: Strict mode, no `any` types without justification
2. **Error Handling**: Use ApplicationError system, never expose stack traces
3. **Logging**: Use `server-logging.ts` utilities, never `console.log`
4. **Async**: Use `setImmediate()` for async processing, not external workers
5. **Database**: Always use soft deletes (`deletedAt` timestamps)
6. **Testing**: Colocate tests with code in `__tests__` directories

### Critical Files & Directories

- `/src/middleware/securePresets.ts` - Security middleware composition
- `/src/lib/ai/tools/` - AI tool definitions and handlers
- `/src/repositories/` - Database access layer
- `/src/services/` - Business logic layer
- `/src/client/services/` - Frontend API services
- `/src/hooks/api/` - React Query hooks
- `/prisma/schema.prisma` - Database schema

### Environment Configuration

Required environment variables are documented in `.env.example`. Key variables:
- `DATABASE_URL` - SQL Server connection string
- `AZURE_OPENAI_*` - AI service configuration
- `AUTH0_*` - Authentication configuration (migrating to IPD)
- `REDIS_URL` - Redis connection for rate limiting
- `AZURE_STORAGE_*` - Blob storage configuration
- `VIRUSTOTAL_API_KEY` - Malware scanning
- `AIAPI_API_KEY` - Cardinal AI for patent search
- `PATBASE_USER/PASS` - PatBase for data enrichment

### Common Development Tasks

#### Adding a New API Endpoint
1. Create handler in `/src/pages/api/`
2. Apply SecurePresets based on requirements
3. Add Zod validation schema
4. Create/update repository methods if needed
5. Add client service method
6. Create React Query hook

#### Modifying Database Schema
1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate-dev` to create migration
3. Update repository interfaces
4. Update API validation schemas
5. Run `npm run type-check` to catch errors

#### Adding AI Capabilities
1. Define tool in `/src/lib/ai/tools/`
2. Register tool in tool registry
3. Update AI service to use new tool
4. Add streaming support if needed
5. Update client to handle tool invocations

### Performance Considerations

- Use database indexes (see `/scripts/manual-indexes.sql`)
- Use `include` in Prisma queries sparingly (avoid N+1)
- Implement pagination for large datasets
- Cache expensive AI operations in Redis
- Use React Query's stale-while-revalidate

### AI Audit & Compliance

All AI operations are logged comprehensively:
- Operation type, model used, prompt/response content
- Token usage tracking for billing/compliance
- Human review workflow for sensitive operations
- Export capabilities for compliance reporting
- Stored in `AIAuditLog` table

### Deployment Notes

- Production uses Azure App Service with GitHub Actions CI/CD
- Database migrations run automatically on deploy
- Environment-specific configs in `/src/config/`
- Health checks at `/api/health/live` and `/api/health/ready`

### Authentication Migration (Auth0 → IPD)

Currently using Auth0 with plans to migrate to IPD Identity:
- Toggle via `NEXT_PUBLIC_AUTH_TYPE` environment variable
- IPD configuration in `src/config/ipd.ts`
- Cookie-based session handling with IPD
- Unified SSO across IPD ecosystem