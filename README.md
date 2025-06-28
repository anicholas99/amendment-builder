# Patent Drafter AI

A sophisticated enterprise-grade application for automated patent drafting and prior art analysis, leveraging AI to streamline the patent application process.

## 🚀 Overview

Patent Drafter AI is a full-stack Next.js application that helps patent attorneys and inventors draft high-quality patent applications. The system uses advanced AI models to analyze inventions, generate patent claims, search for prior art, and produce complete patent applications.

### Key Features

- **AI-Powered Patent Drafting**: Generate patent applications using GPT-4 and Claude
- **Prior Art Search**: Semantic search across patent databases with Cardinal AI integration
- **Claim Analysis**: Automated claim parsing and element extraction
- **Multi-Tenant Architecture**: Secure tenant isolation with row-level security
- **Real-time Collaboration**: WebSocket-based updates for team collaboration
- **Document Management**: Upload and process technical documents, figures, and drawings

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 13+, React 18, TypeScript, Chakra UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Azure SQL Database in production)
- **Authentication**: Auth0 with JWT tokens
- **AI Services**: OpenAI GPT-4, Anthropic Claude, Cardinal AI
- **Infrastructure**: Docker, Azure App Service
- **Monitoring**: Custom logging with Winston & Azure App Insights compatibility

### Design Patterns

- **Repository Pattern**: Clean data access layer with type-safe queries
- **Middleware Composition**: Modular request handling pipeline
- **Error Boundaries**: Graceful error handling in React components
- **Type Safety**: Strict TypeScript with minimal `any` usage

### Async Services Architecture

- **Background Processing**: Long-running operations (semantic search, citation extraction) use `setImmediate()` for non-blocking execution
- **No External Workers**: All async processing runs within the main application, simplifying deployment
- **Feature Flags**: Toggle between inline processing and external workers with environment variables
- **Documentation**: See [async services documentation](src/client/services/ASYNC_QUICK_REFERENCE.md) for implementation details

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ or Azure SQL Database
- Auth0 account for authentication
- API keys for OpenAI, Anthropic (optional), and Cardinal AI (for search)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/patent-drafter-ai.git
   cd patent-drafter-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
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

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/patent_drafter"

# Auth0
AUTH0_SECRET="your-auth0-secret"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
AIAPI_API_KEY="your-cardinal-ai-key"

# Security
INTERNAL_API_KEY="generate-a-secure-key"
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── features/          # Feature-specific components and logic
├── pages/             # Next.js pages and API routes
├── repositories/      # Data access layer
├── services/          # Business logic and external integrations
├── lib/              # Shared utilities and configurations
├── middleware/        # API middleware (auth, validation, etc.)
├── types/            # TypeScript type definitions
└── utils/            # Helper functions and utilities
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests (coming soon)
npm run test:e2e
```

## 🚢 Deployment

### Docker

```bash
# Build the Docker image
docker build -t patent-drafter-ai .

# Run the container
docker run -p 3000:3000 --env-file .env.production patent-drafter-ai
```

### Azure App Service

The application is configured for deployment to Azure App Service. See `docs/04-deployment-and-ops/01-azure-deployment.md` for detailed instructions.

## 🔒 Security

- **Authentication**: Auth0 with secure JWT validation
- **Authorization**: Tenant-based access control with middleware guards
- **Data Protection**: Row-level security in PostgreSQL
- **API Security**: Rate limiting, CSRF protection, input validation
- **Secrets Management**: Environment variables with Azure Key Vault in production

## 📊 Monitoring & Logging

- **Error Tracking**: Console-based logging captured by the hosting provider (e.g., Azure App Service)
- **Application Logs**: Structured logging with Winston
- **Performance Monitoring**: Custom metrics and Azure Application Insights
- **Health Checks**: `/api/health` endpoint for uptime monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes following our coding standards
3. Add tests for new functionality
4. Ensure all tests pass and linting succeeds
5. Submit a pull request with a clear description

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint and Prettier for code formatting
- Minimum 80% test coverage for new code
- No `console.log` statements in production code
- Comprehensive error handling

## 📚 Documentation

- [Getting Started Guide](docs/01-getting-started.md)
- [Architecture Overview](docs/02-architecture/README.md)
- [Development Practices](docs/03-development-practices/README.md)
- [Deployment Guide](docs/04-deployment-and-ops/README.md)
- [Security Architecture](docs/SECURITY_ARCHITECTURE.md)

## 🐛 Known Issues & Technical Debt

- **Performance Optimizations**: See [docs/reports/DATABASE_OPTIMIZATION_REPORT.md](docs/reports/DATABASE_OPTIMIZATION_REPORT.md) for database improvements
- **Code Cleanup**: See [docs/reports/UNUSED_FILES_REPORT.md](docs/reports/UNUSED_FILES_REPORT.md) for unused file analysis

### Recent Changes (June 2025)
- Semantic search API migrated to async pattern for better performance
- Legacy synchronous search endpoints deprecated (removal planned for v2.0.0)

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 👥 Team

- **Lead Developer**: [Your Name]
- **Product Owner**: [Product Owner Name]
- **Tech Lead**: [Tech Lead Name]

## 🙏 Acknowledgments

- Auth0 for authentication services
- OpenAI and Anthropic for AI capabilities
- Cardinal AI for patent search functionality
- The open-source community for the amazing tools and libraries

---

For questions or support, please contact the development team.
