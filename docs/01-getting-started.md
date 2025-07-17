# 1. Getting Started

This guide provides everything you need to set up, configure, and run the Patent Drafter AI application on your local machine for development.

## Table of Contents
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Running Tests](#-running-tests)
- [Troubleshooting](#-troubleshooting)

---

## 📋 Prerequisites

Before you begin, ensure you have the following tools installed and running on your system:

- **Node.js**: `v20 LTS` or higher (required for latest features and security)
- **pnpm**: `v8.0.0` or higher (preferred package manager for performance)
- **Git**: For cloning the repository
- **Database**: A running instance of Microsoft SQL Server (or Azure SQL Database for production)
- **Azure Storage Emulator**: [Azurite](https://github.com/Azure/Azurite) is required for local file and figure uploads
- **Redis** (recommended): For distributed rate limiting and caching. Development uses in-memory fallback by default
- **TypeScript**: `v5.3.3` (installed automatically with package installation)

---

## ⚙️ Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-org/patent-drafter-ai.git
    cd patent-drafter-ai
    ```

2.  **Install Dependencies**
    This command installs all necessary packages, including `devDependencies` required for development.
    ```bash
    pnpm install
    ```
    
    This will automatically:
    - Install all package dependencies with pnpm's efficient storage
    - Generate Prisma client (via postinstall script)
    - Set up Husky git hooks for pre-commit checks

---

## 🔑 Environment Configuration

Application secrets and configuration are managed via an environment file with comprehensive validation.

1.  **Create Your Environment File**
    Copy the example file to create your local configuration. This file is git-ignored and will not be committed.
    ```bash
    cp .env.example .env.local
    ```

2.  **Update `.env.local`**
    Open `.env.local` and fill in the required values. At a minimum, you will need to configure the database connection and your Auth0 credentials for local development.

    **Key Variables for Local Setup:**
    ```env
    # APPLICATION ENVIRONMENT
    NODE_ENV=development
    NEXT_PUBLIC_APP_ENV=development
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # DATABASE (Prisma)
    # Point this to your local Microsoft SQL Server instance.
    DATABASE_URL="sqlserver://localhost:1433;database=patent_drafter_dev;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"

    # AUTHENTICATION (Auth0 - Current)
    # These are required to simulate login during development.
    AUTH0_SECRET="<generate a secret with: openssl rand -hex 32>"
    AUTH0_BASE_URL="http://localhost:3000"
    AUTH0_ISSUER_BASE_URL="https://<your-tenant>.auth0.com"
    AUTH0_CLIENT_ID="<your-auth0-client-id>"
    AUTH0_CLIENT_SECRET="<your-auth0-client-secret>"
    NEXTAUTH_SECRET="<same-as-auth0-secret>"
    NEXTAUTH_URL="http://localhost:3000"
    NEXT_PUBLIC_AUTH_TYPE="auth0"

    # AUTHENTICATION (IPD Identity - Future)
    # Uncomment these when migrating to IPD Identity
    # IPD_BASE_URL="https://ipdashboard.com"
    # IPD_API_URL="https://api.ipdashboard.com"
    # NEXT_PUBLIC_USE_IPD_IDENTITY="false"
    # NEXT_PUBLIC_AUTH_TYPE="auth0"

    # AI PROVIDERS
    # Choose your AI provider and configure accordingly
    AI_PROVIDER="azure"
    
    # Option 1: Azure OpenAI (Recommended)
    AZURE_OPENAI_API_KEY="<your-azure-openai-key>"
    AZURE_OPENAI_ENDPOINT="https://<your-resource>.openai.azure.com/"
    AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
    
    # Option 2: Standard OpenAI
    # OPENAI_API_KEY="<your-openai-api-key>"
    # OPENAI_MODEL="gpt-4o"

    # EXTERNAL AI SERVICES
    AIAPI_API_KEY="<your-cardinal-ai-key>"
    PATBASE_USER="<patbase-username>"
    PATBASE_PASS="<patbase-password>"

    # RATE LIMITING & CACHING (Redis - recommended)
    # For development, rate limiting can run in-memory mode
    # For production, configure Redis connection
    REDIS_URL="redis://localhost:6379"  # Optional - will use in-memory if not set

    # AZURE STORAGE (Azurite for local)
    # The default value in .env.example points to a standard local Azurite instance.
    AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
    AZURE_STORAGE_CONTAINER_NAME="figures"
    AZURE_STORAGE_INVENTION_CONTAINER_NAME="inventions"

    # SECURITY CONFIGURATION
    VIRUSTOTAL_API_KEY="<your-virustotal-key>"  # Optional for development
    CSP_MODE="strict"  # Options: strict, report-only, or unset for legacy

    # FEATURE FLAGS
    ENABLE_MULTI_TENANT=true
    ENABLE_DRAFTING=true
    ENABLE_PRIOR_ART_SEARCH=true
    ENABLE_EXAMINER_ANALYSIS=true
    ENABLE_DEEP_ANALYSIS=true
    NEXT_PUBLIC_ENABLE_DEEP_ANALYSIS=false
    NEXT_PUBLIC_USE_REAL_API=true

    # DEVELOPMENT SETTINGS
    LOG_LEVEL=debug
    DEBUG=true
    LOG_TO_FILE=true
    ```
    
    **For a complete list of all variables, refer to the `.env.example` file in the project root.**

---

## 🗄️ Database Setup

The application uses Prisma for database migrations with comprehensive schema management.

1.  **Create the Development Database**
    Make sure your Microsoft SQL Server instance is running, then create the database specified in your `DATABASE_URL` (e.g., `patent_drafter_dev`). You can do this using SQL Server Management Studio (SSMS), Azure Data Studio, or any SQL Server client.

2.  **Run Database Migrations**
    This command applies all pending migrations from the `prisma/migrations` directory to your database, creating the necessary tables and columns with proper indexes.
    ```bash
    npx prisma migrate dev
    ```

3.  **Generate Prisma Client**
    Ensure the Prisma client is up to date with your schema:
    ```bash
    npx prisma generate
    ```

4.  **Seed the Database (Optional)**
    To populate your database with sample data for testing:
    ```bash
    npm run db:seed
    ```

5.  **Apply Performance Indexes**
    For optimal performance, apply the recommended database indexes:
    ```bash
    npm run db:apply-indexes
    ```

---

## ▶️ Running the Application

1.  **Start Local Storage Emulator (Azurite)**
    In a separate terminal, start the Azurite service. This emulates Azure Storage for local file uploads.
    ```bash
    npm run azurite
    ```
    
    Or manually:
    ```bash
    npx azurite --silent --location ./azurite-data
    ```

2.  **Start Redis (Optional but Recommended)**
    If you have Redis installed locally, start it for rate limiting and caching:
    ```bash
    redis-server
    ```

3.  **Run the Development Server**
    In another terminal, run the Next.js development server.
    ```bash
    npm run dev
    ```

The application should now be running and accessible at [http://localhost:3000](http://localhost:3000).

### Development URLs
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health?detailed=true
- **Prisma Studio**: `npm run db:studio` (opens in browser)
- **Azurite Blob**: http://127.0.0.1:10000

---

## 🛠️ Common Development Scripts

Here are some useful scripts for development:

```bash
# Development environment shortcuts
npm run env:dev          # Load development environment
npm run env:staging      # Load staging environment  
npm run env:prod         # Load production environment

# Database management
npm run db:generate      # Generate Prisma client
npm run db:migrate-dev   # Run migrations in development
npm run db:push          # Push schema changes without migrations
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset and reseed database

# Code quality and security
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
npm run security:scan    # Full security audit
npm run audit:full       # Comprehensive security + API audit

# Testing and validation
npm run test:db          # Test database connection
npm run test:redis       # Test Redis connection
npm run check:env        # Validate environment variables
npm run verify:dark-mode # Verify dark mode implementation

# Performance and analysis
npm run cleanup:analyze  # Analyze unused code
npm run find:any         # Find TypeScript 'any' usage
npm run find:console     # Find console statements
```

---

## 🧪 Running Tests

To ensure the application is functioning correctly, you can run the comprehensive test suite.

```bash
# Run all unit tests
npm test

# Run tests in watch mode for active development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD pipeline
npm run test:ci

# Test specific functionality
npm run test:redis          # Test Redis connection
npm run test:search-realtime # Test search functionality
npm run test:db             # Test database connection

# Code quality checks
npm run lint                # Run ESLint
npm run lint:security       # Security-focused linting
npm run type-check          # TypeScript validation

# Security and compliance
npm run security:scan       # Full security audit
npm run audit:csrf          # CSRF protection audit
npm run audit:console       # Console usage audit
npm run audit:env           # Environment variable audit
```

---

## 🔒 Security Validation

The application includes comprehensive security validation:

```bash
# Validate security configuration
npm run check:env-security

# Test SecurePresets middleware
npm run test:security

# Audit API endpoints
npm run audit:api

# Check for security vulnerabilities
npm run audit:vulnerabilities
```

---

## 🐛 Troubleshooting

### Database Connection Errors
- Ensure your Microsoft SQL Server instance is running and accessible.
- Double-check the `DATABASE_URL` in your `.env.local` file.
- Verify the database user and password are correct.
- For local development, ensure `trustServerCertificate=true` is included in the connection string.
- Test connection: `npm run test:db`

### Authentication Errors
- Confirm all `AUTH0_*` variables are set correctly in `.env.local`.
- Ensure the "Allowed Callback URLs" in your Auth0 application settings includes `http://localhost:3000/api/auth/callback`.
- Verify `AUTH0_SECRET` is at least 32 characters long.
- Check that `NEXTAUTH_SECRET` matches `AUTH0_SECRET`.

### File Upload Failures
- Make sure the Azurite terminal instance is running: `npm run azurite`.
- If issues persist, try clearing the Azurite cache: `rm -rf ./azurite-data/*` and restart.
- Check Azure Storage connection string format.
- Verify VirusTotal API key is set for malware scanning (optional in development).

### Rate Limiting Issues
- Redis connection: Test with `npm run test:redis`.
- If Redis is unavailable, the application will fall back to in-memory rate limiting.
- Check Redis URL format: `redis://localhost:6379` for local or `rediss://` for Azure.

### Environment Variable Issues
- Run `npm run check:env` to validate required variables.
- Use `npm run check:env-security` to verify security-sensitive variables.
- Check for typos in variable names and values.
- Ensure `.env.local` file exists and is properly formatted.

### Build and Type Errors
- Run `npm run type-check` to identify TypeScript errors.
- Use `npm run build` to catch build-time errors.
- Check for missing dependencies: `pnpm install`.
- Verify Node.js version: `node --version` (should be v20 LTS or higher).

### Performance Issues
- Enable Redis for better caching: set `REDIS_URL` in `.env.local`.
- Check database performance with `npm run db:studio`.
- Monitor health endpoint: `curl http://localhost:3000/api/health?detailed=true`.
- Review logs for slow queries or rate limit violations.

### AI Service Errors
- Verify AI provider configuration (`AI_PROVIDER` setting).
- Check API keys for Azure OpenAI or standard OpenAI.
- Test external API connections (Cardinal AI, PatBase).
- Review AI audit logs for operation tracking.

### Port Conflicts
- If another service is using port 3000, run on a different port: `PORT=3001 npm run dev`.
- Check for other applications using ports 10000-10002 (Azurite).
- Verify Redis port 6379 is available.

### Common Commands for Debugging
```bash
# Check application health
curl http://localhost:3000/api/health?detailed=true

# Validate environment
npm run check:env

# Test all connections
npm run test:db && npm run test:redis

# Check logs
tail -f logs/combined.log

# Reset everything (nuclear option)
npm run db:reset && rm -rf ./azurite-data/* && npm run dev
```

---

For additional help, refer to the comprehensive documentation in the `docs/` directory or contact the development team. 