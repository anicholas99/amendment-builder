# Production Deployment Checklist

This checklist ensures your Patent Drafter AI application is properly configured for production deployment.

## Environment Configuration

### Required Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_ENV=production`
- [ ] `AUTH0_SECRET` - Generate with: `openssl rand -hex 32`
- [ ] `AUTH0_BASE_URL` - Your production URL
- [ ] `DATABASE_URL` - Production database connection string
- [ ] `AZURE_STORAGE_CONNECTION_STRING` - Production Azure storage
- [ ] `OPENAI_API_KEY` or Azure OpenAI credentials
- [ ] `VIRUSTOTAL_API_KEY` - For malware scanning (security requirement)

### Security Settings
- [ ] `CSP_MODE=strict` - Enable strict Content Security Policy
- [ ] `DB_USE_SSL=true` - Enable SSL for database connections
- [ ] Remove all development/debug flags:
  - [ ] `DEBUG=false`
  - [ ] `ENABLE_LOGGING=false`
  - [ ] `LOG_TO_FILE=false`
  - [ ] `LOG_LEVEL=error` or `warn`

### Performance Optimizations
- [ ] Database indexes applied (run migrations)
- [ ] Redis configured for distributed caching: `REDIS_URL`
- [ ] Connection pool settings:
  - [ ] `DATABASE_CONNECTION_LIMIT=20` (adjust based on load)
  - [ ] `DATABASE_CONNECTION_TIMEOUT=20`
  - [ ] `DATABASE_POOL_TIMEOUT=10`

### AI Configuration
- [ ] `OPENAI_MAX_TOKENS` - Set appropriate limits
- [ ] `CITATION_FILTER_THRESHOLD` - Set production threshold
- [ ] `DEEP_ANALYSIS_TIMEOUT_MS` - Set appropriate timeout

## Pre-Deployment Steps

### 1. Database Migration
```bash
# Apply all migrations including performance indexes
npx prisma migrate deploy
```

### 2. Build Optimization
```bash
# Production build with optimization
npm run build

# Analyze bundle size (optional)
ANALYZE=true npm run build
```

### 3. Security Audit
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 4. Test Production Build
```bash
# Test production build locally
npm run start
```

## Deployment Configuration

### Azure App Service (Recommended)
- [ ] Set Node version to 18+
- [ ] Configure health check endpoint: `/api/health`
- [ ] Enable Always On
- [ ] Configure auto-scaling rules
- [ ] Set up Application Insights

### Docker Deployment
- [ ] Use the provided Dockerfile
- [ ] Set memory limits appropriately (min 512MB)
- [ ] Configure health checks
- [ ] Use multi-stage builds for smaller images

### CDN/Proxy Configuration
- [ ] Configure `TRUSTED_PROXY_IPS` if behind a proxy
- [ ] Enable CDN for static assets
- [ ] Configure proper cache headers

## Post-Deployment Verification

### Functionality Tests
- [ ] User authentication works
- [ ] File uploads work (test with small file)
- [ ] API endpoints respond correctly
- [ ] Search functionality works
- [ ] Patent generation works

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second for most endpoints
- [ ] Search history loads quickly (with pagination)
- [ ] No client-side console logs in production

### Security Tests
- [ ] CSP headers are applied
- [ ] All cookies have secure flags
- [ ] No sensitive data in client-side code
- [ ] File upload scanning works

## Monitoring Setup

### Application Monitoring
- [ ] Error tracking configured (e.g., Sentry, Application Insights)
- [ ] Performance monitoring enabled
- [ ] Custom alerts for critical errors
- [ ] Database query performance monitoring

### Log Management
- [ ] Centralized logging configured
- [ ] Log retention policy set
- [ ] Sensitive data excluded from logs
- [ ] Log levels appropriate for production

## Backup and Recovery

### Data Protection
- [ ] Database backup schedule configured
- [ ] Blob storage backup configured
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented

## Scaling Considerations

### Horizontal Scaling
- [ ] Session management works across instances
- [ ] File storage accessible from all instances
- [ ] Database connection pooling configured
- [ ] Rate limiting works across instances

### Performance Tuning
- [ ] Database query optimization complete
- [ ] Indexes verified and working
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets

## Final Checklist

- [ ] All environment variables set correctly
- [ ] No development dependencies in production
- [ ] All migrations applied successfully
- [ ] Security headers verified
- [ ] Performance benchmarks met
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team trained on deployment procedures

## Quick Commands Reference

```bash
# Production build
npm run build

# Start production server
npm run start

# Apply database migrations
npx prisma migrate deploy

# Check for security vulnerabilities
npm audit

# Generate production environment template
cp .env.example .env.production

# Verify build output
npm run analyze
```

Remember: Always test in a staging environment that mirrors production before deploying! 