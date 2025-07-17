# Patent Drafter AI

A sophisticated enterprise-grade application for automated patent drafting and prior art analysis, leveraging AI to streamline the patent application process with comprehensive audit logging and security controls.

## 🚀 Overview

Patent Drafter AI is a full-stack Next.js application that helps patent attorneys and inventors draft high-quality patent applications. The system uses advanced AI models to analyze inventions, generate patent claims, search for prior art, and produce complete patent applications with full compliance tracking.

### Key Features

- **AI-Powered Patent Drafting**: Generate patent applications using GPT-4 and Claude with comprehensive audit logging
- **Prior Art Search**: Semantic search across patent databases with Cardinal AI integration
- **Citation Extraction**: Automated citation matching with deep analysis and examiner-style assessment
- **Multi-Tenant Architecture**: Secure tenant isolation with SecurePresets middleware
- **Project Collaboration**: Real-time collaboration with role-based access control (viewer, editor, admin)
- **Document Management**: Upload and process technical documents, figures, and drawings with file linking
- **SecurePresets Security**: Defense-in-depth security with rate limiting, CSRF protection, and malware scanning
- **AI Audit & Compliance**: Comprehensive AI operation logging for SOC 2 and GDPR compliance
- **Advanced Analytics**: Performance monitoring and structured logging with Azure Application Insights

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15.2.4, React 18, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes with SecurePresets architecture, Prisma ORM
- **Database**: Microsoft SQL Server (Azure SQL Database in production)
- **Authentication**: Auth0 with JWT tokens (transitioning to IPD Identity)
- **AI Services**: Azure OpenAI GPT-4, Cardinal AI, PatBase API
- **Infrastructure**: Docker, Azure App Service, Azure Redis Cache
- **Monitoring**: Winston logging with Azure Application Insights integration
- **Security**: SecurePresets middleware with Redis-backed rate limiting
- **Storage**: Azure Blob Storage for figures and documents with secure access
- **Testing**: Jest with React Testing Library

### Design Patterns

- **SecurePresets Pattern**: Standardized security middleware stack for all API endpoints
- **Repository Pattern**: Clean data access layer with type-safe queries and tenant isolation
- **Service Layer Architecture**: All API calls go through dedicated service layers with validation
- **Tenant Guard Pattern**: Automatic tenant context validation and data isolation
- **Error Boundaries**: Graceful error handling with ApplicationError system
- **Type Safety**: Strict TypeScript with comprehensive Zod validation

### Security Architecture

The application uses the SecurePresets pattern for defense-in-depth security:

1. **Error Handling** - Catches all errors, prevents information leakage
2. **Security Headers** - X-Frame-Options, CSP, HSTS
3. **Rate Limiting** - Distributed Redis-backed protection
4. **Authentication** - JWT validation with Auth0/IPD
5. **Session Security** - Enhanced session management
6. **CSRF Protection** - Token-based validation
7. **Tenant Guard** - Data isolation enforcement
8. **Input Validation** - Zod schema validation

### Async Services Architecture

- **Background Processing**: Long-running operations (semantic search, citation extraction) use `setImmediate()` for non-blocking execution
- **No External Workers**: All async processing runs within the main application, simplifying deployment
- **Feature Flags**: Toggle between inline processing and external workers with environment variables
- **Documentation**: See [async services documentation](src/client/services/ASYNC_QUICK_REFERENCE.md) for implementation details

## 📋 Prerequisites

- Node.js 20 LTS and pnpm 8+
- Microsoft SQL Server or Azure SQL Database
- Auth0 account for authentication (or IPD Identity for SSO)
- API keys for Azure OpenAI, Cardinal AI, and PatBase
- Redis (recommended for production rate limiting and caching)
- Azurite (for local blob storage emulation)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/patent-drafter-ai.git
   cd patent-drafter-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration (see Environment Variables section)

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start Azurite (for local development)**
   ```bash
   npm run azurite
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Key environment variables (see [ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) for complete guide):

```env
# Database
DATABASE_URL="sqlserver://localhost:1433;database=patent_drafter;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"

# Authentication (Current - Auth0)
AUTH0_SECRET="your-auth0-secret-minimum-32-characters"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_AUTH_TYPE="auth0"

# Authentication (Future - IPD Identity)
IPD_BASE_URL="https://ipdashboard.com"
IPD_API_URL="https://api.ipdashboard.com"
NEXT_PUBLIC_USE_IPD_IDENTITY="false"
NEXT_PUBLIC_AUTH_TYPE="auth0"

# AI Services
AI_PROVIDER="azure"
AZURE_OPENAI_API_KEY="your-azure-openai-key"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"

# External APIs
AIAPI_API_KEY="your-cardinal-ai-key"
PATBASE_USER="patbase-username"
PATBASE_PASS="patbase-password"

# Storage
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
AZURE_STORAGE_CONTAINER_NAME="figures"

# Security
VIRUSTOTAL_API_KEY="your-virustotal-key"
CSP_MODE="strict"

# Redis (recommended for production)
REDIS_URL="rediss://your-redis.redis.cache.windows.net:6380"
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components with accessibility
├── features/          # Feature-specific components and logic
├── pages/             # Next.js pages and API routes with SecurePresets
├── repositories/      # Data access layer with tenant isolation
├── services/          # Business logic and external integrations
├── lib/              # Shared utilities and configurations
├── middleware/        # API middleware (auth, validation, tenant guards)
├── types/            # TypeScript type definitions
├── utils/            # Helper functions and utilities
├── contexts/         # React contexts for state management
├── hooks/            # Custom React hooks
└── server/           # Server-side services and tools
```

## 🧪 Testing

### Available Test Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI/CD
npm run test:ci

# Test specific functionality
npm run test:redis          # Test Redis connection
npm run test:search-realtime # Test search functionality
npm run test:db             # Test database connection
```

### Code Quality & Security

```bash
# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Security scanning
npm run security:scan       # Full security audit
npm run test:security      # Dependency vulnerabilities
npm run lint:security      # Security-focused linting
npm run check:env          # Environment variable security

# Comprehensive audits
npm run audit:full         # Complete security + API audit
npm run audit:csrf         # CSRF protection audit
npm run audit:console      # Console usage audit
npm run audit:env          # Environment variable audit
```

### Development Tools

```bash
# Environment management
npm run env:dev            # Load development environment
npm run env:staging        # Load staging environment
npm run env:prod           # Load production environment

# Database management
npm run db:generate        # Generate Prisma client
npm run db:migrate-dev     # Run migrations
npm run db:seed           # Seed database
npm run db:reset          # Reset and reseed database

# Code maintenance
npm run cleanup:analyze    # Analyze unused code
npm run cleanup:safe       # Safe cleanup operations
npm run cleanup:unused-deps # Find unused dependencies
npm run find:any          # Find TypeScript 'any' usage
npm run find:console      # Find console statements
```

## 🚀 Deployment

### Azure App Service

The application is configured for deployment to Azure App Service. See [Azure Deployment Guide](docs/04-deployment-and-ops/01-azure-deployment.md) for detailed instructions.

### Build Process

```bash
# Production build with security validation
npm run build

# Development build
npm run build:dev

# Build without type checking (emergency use)
npm run build-skip-types
```

## 🔒 Security

### SecurePresets Architecture

All API endpoints use the SecurePresets pattern for consistent security:

| Preset | Authentication | CSRF | Rate Limit | Tenant Isolation | Validation |
|--------|---------------|------|------------|------------------|------------|
| `tenantProtected` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `userPrivate` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `adminTenant` | ✅ (Admin) | ✅ | ✅ | ✅ | ✅ |
| `public` | ❌ | ❌ | ✅ | ❌ | ✅ |

### Security Features

- **Authentication**: Auth0 with secure JWT validation (transitioning to IPD Identity)
- **Authorization**: Tenant-based access control with automatic middleware guards
- **Data Protection**: Row-level security in SQL Server with soft deletes
- **API Security**: SecurePresets with rate limiting, CSRF protection, comprehensive input validation
- **Content Security Policy**: Strict CSP headers with configurable modes
- **Malware Scanning**: VirusTotal integration for file uploads
- **Secrets Management**: Environment variables with Azure Key Vault in production
- **Audit Logging**: Comprehensive audit trails for compliance (SOC 2, GDPR)

### Rate Limiting Configuration

| Endpoint Type | Requests | Window | Purpose | Redis Key |
|--------------|----------|---------|---------|-----------|
| Auth | 5 | 5 minutes | Login protection | rl:auth: |
| AI/ML | 20 | 5 minutes | AI service limits | rl:ai: |
| Search | 50 | 1 hour | Search operations | rl:search: |
| Upload | 10 | 5 minutes | File upload protection | rl:upload: |
| Standard API | 100 | 1 minute | General API access | rl:api: |
| Read-only | 500 | 15 minutes | Data retrieval | rl:read: |

## 📊 Monitoring & Compliance

### Logging & Monitoring
- **Error Tracking**: Structured Winston logging with Azure App Service integration
- **Application Logs**: JSON-formatted logs with correlation IDs
- **Performance Monitoring**: Custom metrics and Azure Application Insights
- **Health Checks**: `/api/health` endpoint with detailed service checks
- **Security Logging**: Dedicated security event tracking
- **Rate Limit Monitoring**: Real-time rate limit tracking and alerts

### AI Audit & Compliance
- **AI Operation Logging**: Comprehensive tracking of all AI operations
  - Operation type, model used, prompt/response content
  - Token usage tracking for billing/compliance
  - Human review workflow for sensitive operations
  - Export capabilities for compliance reporting
- **SOC 2 Compliance**: Comprehensive audit trails
- **GDPR Compliance**: User privacy controls and data export
- **Data Retention**: Configurable retention policies

## 🔄 Authentication Migration

### Current State: Auth0
The application currently uses Auth0 for authentication with plans to migrate to IPD Identity for unified SSO.

### Planned Migration: IPD Identity
- **Single Sign-On**: Unified authentication across IPD ecosystem
- **Session Management**: Cookie-based session handling
- **Tenant Management**: Centralized tenant and user management
- **Configuration**: Toggle via `NEXT_PUBLIC_AUTH_TYPE` environment variable

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/03-development-practices/03-contributing.md) for details.

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes following our coding standards
3. Add tests for new functionality
4. Ensure all tests pass and linting succeeds
5. Run security checks: `npm run security:scan`
6. Verify dark mode compatibility: `npm run verify:dark-mode`
7. Submit a pull request with a clear description

### Pre-commit Hooks

```bash
# Set up pre-commit hooks (automatic)
npm run setup:precommit

# Manual pre-commit check
npm run precommit

# Pre-push validation
npm run prepush
```

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint with security-focused custom rules (no console.log, no direct API calls)
- Repository pattern for database access with tenant isolation
- Service layer architecture for API calls with validation
- SecurePresets for all API endpoints
- Comprehensive error handling with ApplicationError system
- AI audit logging for compliance

## 📚 Documentation

- [Getting Started Guide](docs/01-getting-started.md)
- [Architecture Overview](docs/02-architecture/README.md)
- [Development Practices](docs/03-development-practices/README.md)
- [Deployment Guide](docs/04-deployment-and-ops/README.md)
- [Security Architecture](docs/SECURITY_ARCHITECTURE.md)
- [Technical Reference](docs/PATENT_DRAFTER_TECHNICAL_REFERENCE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)

## 🔧 Production Readiness

### Performance Characteristics
- Average API response: <500ms with SecurePresets
- Document generation: 5-10 seconds with AI audit
- AI chat response: 3-5 seconds with tool invocations
- Search queries: 2-5 seconds with caching
- Citation extraction: 10-30 seconds per reference with deep analysis

### Infrastructure Requirements
- Azure App Service hosting with auto-scaling
- Azure SQL Database with performance monitoring
- Azure Redis Cache for distributed operations
- Azure Application Insights monitoring
- Azure Blob Storage with CDN integration

### Monitoring & Health Checks
```bash
# Production readiness check
npm run check:production

# Verify dark mode compatibility
npm run verify:dark-mode

# Bundle analysis
npm run cleanup:bundle-analysis

# Health check endpoint
curl /api/health?detailed=true
```

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 👥 Team

- **Lead Developer**: [Your Name]
- **Product Owner**: [Product Owner Name]
- **Tech Lead**: [Tech Lead Name]

## 🙏 Acknowledgments

- Auth0 and IPD for authentication services
- Azure and OpenAI for AI capabilities with audit logging
- Cardinal AI for patent search functionality
- PatBase for patent data enrichment
- The open-source community for the amazing tools and libraries

---

For questions or support, please contact the development team or check the comprehensive documentation in the `docs/` directory.
