# 🔑 Environment Variables Reference

> **Complete guide to configuring Patent Drafter AI environment variables**

## 📋 Overview

Environment variables are used to configure the application for different environments (development, staging, production). All sensitive values should be stored securely and never committed to version control.

**🚨 SECURITY WARNING**: Never commit real API keys or secrets to git. Use placeholder values in `.env.example` and real values only in deployment.

---

## 🏗️ Required Variables

### Application Environment
```env
# Application environment
NODE_ENV=development|staging|production
NEXT_PUBLIC_APP_ENV=development|qa|production

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### Database Configuration
```env
# Database connection
DATABASE_URL="postgresql://user:password@host:port/database"

# Optional: SSL configuration for production
DB_USE_SSL=true
DB_SSL_CERT_PATH=/path/to/cert.pem
```

**Examples:**
- Development: `postgresql://postgres:password@localhost:5432/patent_drafter_dev`
- Production: `postgresql://user:pass@prod-db.postgres.database.azure.com:5432/patent_drafter`

### Authentication (Auth0)
```env
# Auth0 configuration
AUTH0_SECRET="your-auth0-secret-minimum-32-chars"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-tenant.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
AUTH0_AUDIENCE="https://your-api-identifier"
```

**🔒 Security Notes:**
- `AUTH0_SECRET` must be at least 32 characters
- Generate with: `openssl rand -hex 32`
- Never use the fallback "change-this-in-production"

---

## 🤖 AI Services Configuration

### OpenAI
```env
# OpenAI configuration
AI_PROVIDER=openai
OPENAI_API_KEY="sk-proj-..."
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.1
```

### Azure OpenAI
```env
# Azure OpenAI configuration (alternative to OpenAI)
AI_PROVIDER=azure-openai
AZURE_OPENAI_API_KEY="your-azure-openai-key"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
AZURE_OPENAI_API_VERSION="2024-02-01"
```

### Anthropic Claude
```env
# Anthropic Claude configuration (optional)
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000
```

### Cardinal AI (Search)
```env
# Cardinal AI for patent search
AIAPI_API_KEY="your-cardinal-ai-key"
AIAPI_BASE_URL="https://api.cardinalai.com"
SEMANTIC_SEARCH_TIMEOUT_MS=30000
```

---

## 🗄️ Storage Configuration

### Azure Blob Storage
```env
# Azure Storage configuration
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=account;AccountKey=key;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME=figures
AZURE_STORAGE_PRIVATE_CONTAINER=private-figures
AZURE_STORAGE_CDN_URL="https://your-cdn.azureedge.net"
```

**For Local Development (Azurite):**
```env
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
```

### File Upload Limits
```env
# File upload configuration
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
MALWARE_SCANNING_ENABLED=true
VIRUSTOTAL_API_KEY="your-virustotal-key"
```

---

## 🔒 Security Configuration

### Internal API Authentication
```env
# Internal service authentication
INTERNAL_API_KEY="your-secure-internal-key-minimum-32-chars"
IPD_SHARED_SECRET="your-ipd-shared-secret"
```

**🔒 Security Notes:**
- Generate secure keys: `openssl rand -hex 32`
- Rotate regularly in production
- Use different keys per environment

### CSRF Protection
```env
# CSRF configuration
CSRF_SECRET="your-csrf-secret-minimum-32-chars"
CSRF_TOKEN_NAME=csrf-token
CSRF_HEADER_NAME=x-csrf-token
CSRF_EXPIRY_HOURS=1
```

### Rate Limiting
```env
# Redis for rate limiting (optional - uses in-memory if not set)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your-redis-password"
REDIS_TLS=false

# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_FAILED_REQUESTS=true
```

---

## 🌐 External Services

### PatBase Integration
```env
# PatBase patent database
PATBASE_USERNAME="your-patbase-username"
PATBASE_PASSWORD="your-patbase-password"
PATBASE_API_URL="https://api.patbase.com"
```

### Analytics & Monitoring
```env
# Application Insights (Azure)
APPINSIGHTS_INSTRUMENTATIONKEY="your-app-insights-key"
APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=key;IngestionEndpoint=endpoint"

# Custom analytics
ANALYTICS_ENABLED=true
ANALYTICS_SAMPLE_RATE=0.1
```

### Email Services (optional)
```env
# SendGrid or similar for notifications
SENDGRID_API_KEY="your-sendgrid-key"
EMAIL_FROM="noreply@yourcompany.com"
EMAIL_ENABLED=false
```

---

## ⚙️ Feature Flags

### Async Processing
```env
# Async service configuration
USE_CITATION_WORKER=false  # Use inline processing vs external workers
USE_ASYNC_SEARCH=true      # Enable async search pattern
CITATION_TIMEOUT_MS=45000  # 45 seconds
SEARCH_TIMEOUT_MS=30000    # 30 seconds
```

### UI Features
```env
# Frontend feature flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_FIGURES=true
NEXT_PUBLIC_ENABLE_CITATIONS=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_DEBUG_MODE=false
```

### Development Features
```env
# Development and debugging
ENABLE_API_DOCS=true       # Swagger UI in development
ENABLE_QUERY_LOGGING=false # Log all database queries
ENABLE_PERFORMANCE_MONITORING=true
MOCK_EXTERNAL_APIS=false   # Use mocks instead of real APIs
```

---

## 🏃‍♂️ Performance Configuration

### Caching
```env
# Cache configuration
CACHE_TTL_SECONDS=3600     # 1 hour default cache
CACHE_MAX_SIZE_MB=100      # Max memory cache size
ENABLE_QUERY_CACHING=true
```

### Database Performance
```env
# Database connection pooling
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT_MS=30000
DATABASE_IDLE_TIMEOUT_MS=600000
```

### API Performance
```env
# API timeouts and limits
API_TIMEOUT_MS=30000
MAX_REQUEST_SIZE_MB=10
ENABLE_COMPRESSION=true
COMPRESSION_THRESHOLD=1024
```

---

## 🌍 Environment-Specific Examples

### Development (.env.local)
```env
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

DATABASE_URL="postgresql://postgres:password@localhost:5432/patent_drafter_dev"

AUTH0_SECRET="dev-secret-minimum-32-characters-long"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://dev-tenant.auth0.com"
AUTH0_CLIENT_ID="dev-client-id"
AUTH0_CLIENT_SECRET="dev-client-secret"

OPENAI_API_KEY="sk-..."
AIAPI_API_KEY="dev-cardinal-key"

# Azurite for local development
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"

# Development flags
NEXT_PUBLIC_DEBUG_MODE=true
ENABLE_API_DOCS=true
MOCK_EXTERNAL_APIS=false
```

### Staging (.env.staging)
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=qa
NEXT_PUBLIC_BASE_URL=https://staging.yourapp.com

DATABASE_URL="postgresql://staging_user:password@staging-db:5432/patent_drafter_staging"

AUTH0_SECRET="staging-secret-different-from-prod"
AUTH0_BASE_URL="https://staging.yourapp.com"
AUTH0_ISSUER_BASE_URL="https://staging-tenant.auth0.com"

# Staging Azure Storage
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=stagingstorage;AccountKey=...;"

# Staging Redis
REDIS_URL="redis://staging-redis:6379"

# Feature flags
NEXT_PUBLIC_ENABLE_CHAT=true
USE_CITATION_WORKER=false
ENABLE_PERFORMANCE_MONITORING=true
```

### Production (.env.production)
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_BASE_URL=https://app.yourcompany.com

DATABASE_URL="postgresql://prod_user:secure_password@prod-db.postgres.database.azure.com:5432/patent_drafter_prod?sslmode=require"

AUTH0_SECRET="production-secret-highly-secure-32-plus-chars"
AUTH0_BASE_URL="https://app.yourcompany.com"
AUTH0_ISSUER_BASE_URL="https://yourcompany.auth0.com"

# Production Azure Storage
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=prodstorage;AccountKey=...;EndpointSuffix=core.windows.net"

# Production Redis with TLS
REDIS_URL="rediss://prod-redis.redis.cache.windows.net:6380"
REDIS_PASSWORD="secure-redis-password"
REDIS_TLS=true

# Production monitoring
APPINSIGHTS_INSTRUMENTATIONKEY="production-app-insights-key"
ANALYTICS_ENABLED=true

# Security hardening
ENABLE_API_DOCS=false
NEXT_PUBLIC_DEBUG_MODE=false
MOCK_EXTERNAL_APIS=false
```

---

## 🔍 Environment Validation

The application validates environment variables on startup:

```typescript
// src/config/env-validation.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().min(1),
  AUTH0_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  // ... more validations
});
```

### Validation Errors
If validation fails, the application will:
1. Log specific validation errors
2. Exit with non-zero status code
3. Prevent startup with invalid configuration

### Custom Validation Script
```bash
# Validate environment configuration
npm run validate:env

# Check for missing required variables
npm run check:env-security
```

---

## 🛠️ Environment Management

### Local Development Setup
```bash
# Copy example file
cp .env.example .env.local

# Generate secure secrets
echo "AUTH0_SECRET=$(openssl rand -hex 32)" >> .env.local
echo "INTERNAL_API_KEY=$(openssl rand -hex 32)" >> .env.local
echo "CSRF_SECRET=$(openssl rand -hex 32)" >> .env.local
```

### Docker Environment
```dockerfile
# Dockerfile
ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}
ENV AUTH0_SECRET=${AUTH0_SECRET}
# ... other variables
```

### Azure App Service Configuration
Variables can be set in Azure Portal:
- Configuration → Application settings
- Use Azure Key Vault references for secrets
- Format: `@Microsoft.KeyVault(SecretUri=https://vault.vault.azure.net/secrets/secret-name/)`

---

## 🚨 Security Best Practices

### Secret Management
1. **Never commit secrets to git**
2. **Use different secrets per environment**
3. **Rotate secrets regularly**
4. **Use Azure Key Vault in production**
5. **Implement least-privilege access**

### Environment Files
```bash
# .gitignore
.env
.env.local
.env.*.local
.env.production
.env.staging

# Only commit example file
.env.example  # ✅ Safe to commit
```

### Secret Rotation Checklist
- [ ] Generate new secret
- [ ] Update Azure Key Vault
- [ ] Deploy application with new secret
- [ ] Verify functionality
- [ ] Revoke old secret
- [ ] Update documentation

---

## 🔧 Troubleshooting

### Common Issues

#### "Environment variable not found"
```bash
# Check if variable is set
echo $DATABASE_URL

# Verify .env.local exists and contains the variable
cat .env.local | grep DATABASE_URL
```

#### "Invalid AUTH0_SECRET"
```bash
# Generate new secret
openssl rand -hex 32

# Verify length (should be 64 characters for hex-encoded 32 bytes)
echo $AUTH0_SECRET | wc -c
```

#### "Database connection failed"
```bash
# Test database connection
npx prisma db pull

# Check connection string format
echo $DATABASE_URL
```

#### "Redis connection timeout"
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Check if Redis is running
docker ps | grep redis
```

### Debug Commands
```bash
# Print all environment variables (careful with secrets!)
npm run debug:env

# Validate environment configuration
npm run validate:env

# Test external service connections
npm run test:connections
```

---

## 📚 Related Documentation

- [Getting Started Guide](01-getting-started.md)
- [Security Architecture](SECURITY_ARCHITECTURE.md)
- [Azure Deployment Guide](04-deployment-and-ops/01-azure-deployment.md)
- [Configuration Validation](../src/config/env-validation.ts)

---

For questions about environment configuration or to report issues with environment variables, check the validation files in `src/config/` and the deployment documentation.