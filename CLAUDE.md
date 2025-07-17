# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Patent Drafter AI is an enterprise-grade application for automated patent drafting and prior art analysis. It leverages AI models (GPT-4, Claude) to help users draft patent applications, analyze prior art, and manage intellectual property workflows.

## Development Commands

### Core Development
```bash
npm run dev                # Start development server (port 3000)
npm run build             # Build for production
npm run start             # Start production server
npm run type-check        # Run TypeScript type checking
npm run lint              # Run ESLint with auto-fix
npm run lint:no-fix       # Run ESLint without auto-fix
```

### Database Management
```bash
npm run db:migrate-dev    # Create and apply development migrations
npm run db:migrate        # Apply production migrations
npm run db:push           # Push schema changes without migration (dev only)
npm run db:studio         # Open Prisma Studio for database inspection
npm run db:seed           # Seed database with test data
npm run db:reset          # Reset database and reseed
```

### Testing
```bash
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests
npm run test:e2e          # Run end-to-end tests

# Run a single test file
npm test -- path/to/test.test.ts
```

### Security & Quality Audits
```bash
npm run security:scan     # Run comprehensive security audit
npm run audit:full        # Run all code quality audits
npm run verify:csrf       # Verify CSRF protection coverage
npm run verify:rbac       # Verify role-based access control
npm run check:env         # Validate environment variables
```

### Performance & Optimization
```bash
npm run db:apply-indexes  # Apply database performance indexes
npm run analyze:db        # Analyze database performance
npm run build:analyze     # Analyze bundle size
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.2.4, React 18, TypeScript (strict mode)
- **UI**: shadcn/ui components, Tailwind CSS, Radix UI primitives
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Microsoft SQL Server (Azure SQL)
- **AI Services**: Azure OpenAI (GPT-4), Anthropic Claude
- **Search**: Cardinal AI for patent search, PatBase for enrichment
- **Auth**: Auth0 (migrating to IPD Identity Platform)
- **Storage**: Azure Blob Storage for documents/figures
- **Cache**: Redis for rate limiting and caching

### Core Patterns

1. **Repository Pattern**: All database access through repositories in `/src/repositories/`
   - Each entity has a dedicated repository
   - Repositories handle tenant context automatically
   - Soft deletes are handled via Prisma middleware

2. **Service Layer**: Business logic in `/src/services/`
   - Request-scoped services receive context via constructor
   - Services orchestrate repositories and external APIs
   - AI operations are abstracted into service methods

3. **Client Services**: Frontend API abstraction in `/src/client/services/`
   - Centralized API calls with automatic error handling
   - Built on React Query for caching and optimistic updates
   - Type-safe request/response handling

4. **Secure API Presets**: Standardized middleware composition
   ```typescript
   // Example: authenticated endpoint with rate limiting
   import { withSecurePresets } from '@/middleware/securePresets';
   
   export default withSecurePresets('authenticated')({
     rateLimit: { max: 10, window: '1m' }
   })(handler);
   ```

5. **Tool-Based AI Architecture**: AI interactions use a tool system
   - Tools are defined with schemas and handlers
   - AI can invoke multiple tools in sequence
   - Results are streamed back to the client

### Multi-Tenant Architecture

- Row-level security enforced at repository layer
- Tenant context flows through: Request → Middleware → Service → Repository
- All queries automatically filtered by `tenantId`
- User permissions checked via `UserTenantRole` junction table

### Security Requirements

1. **Authentication & Authorization**
   - All API routes require authentication (except `/api/health/*`)
   - Role-based access control (RBAC) with Admin/Member roles
   - Tenant isolation enforced at data layer

2. **Input Validation**
   - Use Zod schemas for all API input validation
   - Sanitize file uploads and user-generated content
   - Validate tenant context on every request

3. **Rate Limiting**
   - Redis-based rate limiting on all endpoints
   - Different limits for authenticated vs anonymous requests
   - Cost-based limiting for AI operations

### Key Conventions

1. **TypeScript**: Strict mode enabled, no `any` types allowed
2. **Error Handling**: Use structured error responses, never expose stack traces
3. **Logging**: Use `server-logging.ts` utilities, never `console.log`
4. **Async Operations**: Use `setImmediate()` for async processing, not external workers
5. **Database**: Always use soft deletes (deletedAt timestamps)
6. **Testing**: Colocate tests with code in `__tests__` directories

### Critical Files & Directories

- `/src/middleware/securePresets.ts` - Security middleware composition
- `/src/lib/ai/tools/` - AI tool definitions and handlers
- `/src/repositories/` - Database access layer
- `/src/services/` - Business logic layer
- `/src/client/services/` - Frontend API services
- `/src/hooks/api/` - React Query hooks for data fetching
- `/prisma/schema.prisma` - Database schema definition

### Environment Configuration

Required environment variables are documented in `.env.example`. Key variables:
- `DATABASE_URL` - SQL Server connection string
- `AZURE_OPENAI_*` - AI service configuration
- `AUTH0_*` - Authentication configuration
- `REDIS_URL` - Redis connection for rate limiting
- `AZURE_STORAGE_*` - Blob storage configuration

### Common Development Tasks

#### Adding a New API Endpoint
1. Create handler in `/src/pages/api/`
2. Apply security preset based on requirements
3. Add Zod validation schema
4. Create/update repository methods if needed
5. Add client service method
6. Create React Query hook for frontend

#### Modifying Database Schema
1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate-dev` to create migration
3. Update relevant repository interfaces
4. Update API validation schemas
5. Run `npm run type-check` to catch type errors

#### Adding AI Capabilities
1. Define tool in `/src/lib/ai/tools/`
2. Register tool in tool registry
3. Update AI service to use new tool
4. Add streaming support if needed
5. Update client to handle tool invocations

### Performance Considerations

- Database queries are optimized with indexes (see `/scripts/manual-indexes.sql`)
- Use `include` in Prisma queries sparingly to avoid N+1 queries
- Implement pagination for large datasets
- Cache expensive AI operations in Redis
- Use React Query's stale-while-revalidate pattern

### Deployment Notes

- Production uses Azure App Service with GitHub Actions CI/CD
- Database migrations run automatically on deploy
- Environment-specific configs in `/src/config/`
- Health checks available at `/api/health/live` and `/api/health/ready`