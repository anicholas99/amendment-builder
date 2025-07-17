# 🔌 API Reference Guide

> **Comprehensive API documentation for Patent Drafter AI**

## 📋 Overview

The Patent Drafter AI API follows REST principles with a tenant-aware architecture. All API endpoints are protected by authentication and authorization middleware using the SecurePresets pattern.

### Base URL Structure
```
https://your-domain.com/api/[endpoint]
```

### Authentication
All API requests require authentication via Auth0 JWT tokens (with planned migration to IPD Identity). Include the token in the Authorization header and tenant context:

```
Authorization: Bearer <jwt-token>
x-tenant-slug: <tenant-slug>
```

---

## 🔒 Security Architecture

Every API endpoint uses SecurePresets with defense-in-depth security:

| Preset | Authentication | CSRF | Rate Limit | Tenant Isolation | Validation |
|--------|---------------|------|------------|------------------|------------|
| `tenantProtected` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `userPrivate` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `adminTenant` | ✅ (Admin) | ✅ | ✅ | ✅ | ✅ |
| `public` | ❌ | ❌ | ✅ | ❌ | ✅ |

### Middleware Stack (Applied in Order)
1. **Error Handling** - Catches all errors, prevents info leakage
2. **Security Headers** - X-Frame-Options, CSP, HSTS
3. **Rate Limiting** - Prevents abuse and DDoS
4. **Authentication** - Verifies user identity
5. **Session Security** - Validates session state
6. **CSRF Protection** - Prevents cross-site attacks
7. **Tenant Guard** - Ensures data isolation
8. **Input Validation** - Validates and sanitizes input

---

## 🔐 Authentication Endpoints

### Session Management

#### GET `/api/auth/session`
Get current user session information.

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  },
  "currentTenant": {
    "id": "string",
    "slug": "string",
    "name": "string"
  },
  "tenants": [
    {
      "id": "string",
      "slug": "string", 
      "name": "string"
    }
  ],
  "permissions": ["string"],
  "expiresAt": "2024-01-01T00:00:00Z"
}
```

#### GET `/api/csrf-token`
Get CSRF token for state-changing operations.

**Response:**
```json
{
  "csrfToken": "string"
}
```

---

## 📊 Project Management

### Projects

#### GET `/api/projects`
List all projects for the authenticated user within the tenant.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search query to filter by name
- `filterBy`: Filter by status (all, recent, complete, in-progress, draft)
- `sortBy`: Sort field (name, created, modified, recent)
- `sortOrder`: Sort order (asc, desc)

**Response:**
```json
{
  "projects": [
    {
      "id": "string",
      "name": "string",
      "status": "string",
      "hasPatentContent": "boolean",
      "hasProcessedInvention": "boolean",
      "createdAt": "string",
      "updatedAt": "string",
      "invention": {
        "title": "string",
        "summary": "string"
      },
      "_count": {
        "figures": "number",
        "collaborators": "number",
        "searchHistory": "number"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

#### POST `/api/projects`
Create a new project.

**Request:**
```json
{
  "name": "string",
  "status": "draft" | "active" | "archived",
  "textInput": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "status": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### GET `/api/projects/[projectId]`
Get project details.

#### PUT `/api/projects/[projectId]`
Update project information.

#### DELETE `/api/projects/[projectId]`
Soft delete a project.

### Project Collaboration

#### GET `/api/projects/[projectId]/collaborators`
List project collaborators.

**Response:**
```json
{
  "collaborators": [
    {
      "id": "string",
      "userId": "string",
      "role": "viewer" | "editor" | "admin",
      "invitedBy": "string",
      "createdAt": "string",
      "user": {
        "name": "string",
        "email": "string"
      }
    }
  ]
}
```

#### POST `/api/projects/[projectId]/collaborators`
Add project collaborator.

**Request:**
```json
{
  "userId": "string",
  "role": "viewer" | "editor" | "admin"
}
```

#### DELETE `/api/projects/[projectId]/collaborators/[userId]`
Remove project collaborator.

### Project Documents

#### GET `/api/projects/[projectId]/documents`
List project documents.

**Response:**
```json
{
  "documents": [
    {
      "id": "string",
      "fileName": "string",
      "originalName": "string",
      "fileType": "string",
      "createdAt": "string",
      "uploadedBy": "string"
    }
  ]
}
```

#### POST `/api/projects/[projectId]/documents`
Upload project document.

**Request:** `multipart/form-data`
- `files`: Document files (PDF, DOCX, TXT)
- `fileType`: Document type (parent-patent, office-action, invention-disclosure, etc.)

---

## 🔬 Invention Management

### Inventions

#### GET `/api/projects/[projectId]/invention`
Get invention details for a project.

**Response:**
```json
{
  "invention": {
    "id": "string",
    "title": "string",
    "summary": "string",
    "abstract": "string",
    "technicalField": "string",
    "noveltyStatement": "string",
    "patentCategory": "string",
    "features": ["string"],
    "advantages": ["string"],
    "useCases": ["string"],
    "processSteps": ["string"],
    "definitions": {"key": "value"},
    "claims": [
      {
        "id": "string",
        "number": "number",
        "text": "string"
      }
    ]
  }
}
```

#### PUT `/api/projects/[projectId]/invention`
Update invention information.

**Request:**
```json
{
  "title": "string",
  "summary": "string",
  "abstract": "string",
  "technicalField": "string",
  "features": ["string"],
  "advantages": ["string"],
  "useCases": ["string"],
  "processSteps": ["string"],
  "definitions": {"key": "value"}
}
```

### Claims Management

#### GET `/api/projects/[projectId]/claims`
List claims for a project.

#### POST `/api/projects/[projectId]/claims`
Create or update claims.

**Request:**
```json
{
  "claims": [
    {
      "number": "number",
      "text": "string"
    }
  ]
}
```

#### POST `/api/projects/[projectId]/claims/parse/v2`
Parse claim text into elements.

**Request:**
```json
{
  "claimText": "string"
}
```

**Response:**
```json
{
  "elements": ["string"],
  "version": "2.0.0"
}
```

#### POST `/api/projects/[projectId]/claims/queries/v2`
Generate search queries from claim elements.

**Request:**
```json
{
  "elements": ["string"],
  "inventionData": {}
}
```

**Response:**
```json
{
  "searchQueries": ["string"],
  "timestamp": "string",
  "projectId": "string"
}
```

---

## 🔍 Search & Citation Management

### Search History

#### POST `/api/search-history`
Create a new search.

**Request:**
```json
{
  "projectId": "string",
  "query": "string",
  "parsedElements": ["string"]
}
```

**Response:**
```json
{
  "searchHistory": {
    "id": "string",
    "query": "string",
    "timestamp": "string",
    "projectId": "string"
  }
}
```

#### GET `/api/search-history`
List search history.

**Query Parameters:**
- `projectId`: Filter by project
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

#### DELETE `/api/search-history`
Delete search history entries.

**Query Parameters:**
- `searchHistoryId`: ID of search to delete

### Citation Jobs

#### GET `/api/citation-jobs`
List citation jobs.

**Query Parameters:**
- `searchHistoryId`: Filter by search history

**Response:**
```json
[
  {
    "id": "string",
    "searchHistoryId": "string",
    "referenceNumber": "string",
    "status": "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    "deepAnalysisJson": "object",
    "examinerAnalysisJson": "object",
    "createdAt": "string",
    "completedAt": "string"
  }
]
```

#### POST `/api/citation-jobs`
Create a new citation job.

**Request:**
```json
{
  "userId": "string",
  "searchHistoryId": "string",
  "filterReferenceNumber": "string",
  "searchInputs": ["string"],
  "threshold": "number"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "string"
}
```

### Citation Matches

#### GET `/api/citation-matches/top-results`
Get top citation matches from deep analysis.

**Query Parameters:**
- `searchHistoryId`: Required search history ID
- `referenceNumber`: Optional reference filter

**Response:**
```json
{
  "matches": [
    {
      "id": "string",
      "referenceNumber": "string",
      "citation": "string",
      "score": "number",
      "parsedElementText": "string",
      "reasoningSummary": "string",
      "analysisSource": "string",
      "isTopResult": "boolean"
    }
  ]
}
```

#### GET `/api/citation-matches/by-search`
Get citation matches by search (legacy endpoint).

**Query Parameters:**
- `searchHistoryId`: Required search history ID
- `includeMetadataForAllReferences`: Include metadata (default: false)

---

## 📄 Prior Art Management

### Saved Prior Art

#### GET `/api/projects/[projectId]/prior-art`
List saved prior art for a project.

**Response:**
```json
{
  "priorArt": [
    {
      "id": "string",
      "patentNumber": "string",
      "title": "string",
      "abstract": "string",
      "claim1": "string",
      "summary": "string",
      "url": "string",
      "notes": "string",
      "savedAt": "string",
      "fileType": "string",
      "storageUrl": "string"
    }
  ],
  "count": "number"
}
```

#### POST `/api/projects/[projectId]/prior-art`
Save prior art reference.

**Request:**
```json
{
  "patentNumber": "string",
  "title": "string",
  "abstract": "string",
  "url": "string",
  "notes": "string",
  "claim1": "string",
  "summary": "string"
}
```

### Project Exclusions

#### GET `/api/projects/[projectId]/exclusions`
List excluded patents for a project.

#### POST `/api/projects/[projectId]/exclusions`
Add patent exclusions.

**Request:**
```json
{
  "patentNumbers": ["string"],
  "metadata": {}
}
```

#### DELETE `/api/projects/[projectId]/exclusions`
Remove patent exclusion.

**Request:**
```json
{
  "patentNumber": "string"
}
```

---

## 🖼️ Figure Management

### Figures

#### GET `/api/projects/[projectId]/figures`
List project figures.

**Query Parameters:**
- `includeElements`: Include figure elements (default: false)

**Response:**
```json
{
  "figures": [
    {
      "id": "string",
      "figureKey": "string",
      "title": "string",
      "description": "string",
      "fileName": "string",
      "mimeType": "string",
      "status": "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
      "displayOrder": "number",
      "elements": [
        {
          "elementKey": "string",
          "elementName": "string",
          "calloutDescription": "string"
        }
      ]
    }
  ]
}
```

#### POST `/api/projects/[projectId]/figures`
Upload figure files.

**Request:** `multipart/form-data`
- `files`: Figure files (images, PDFs)
- `descriptions`: JSON array of descriptions

#### GET `/api/projects/[projectId]/figures/[figureId]`
Get figure details.

#### PUT `/api/projects/[projectId]/figures/[figureId]`
Update figure metadata.

#### DELETE `/api/projects/[projectId]/figures/[figureId]`
Delete figure.

### Figure Elements

#### GET `/api/projects/[projectId]/figures/[figureId]/elements`
List figure elements.

#### POST `/api/projects/[projectId]/figures/[figureId]/elements`
Add element to figure.

**Request:**
```json
{
  "elementKey": "string",
  "elementName": "string",
  "calloutDescription": "string"
}
```

#### PATCH `/api/projects/[projectId]/figures/[figureId]/elements`
Update element callout.

#### DELETE `/api/projects/[projectId]/figures/[figureId]/elements`
Remove element from figure.

### Project Elements

#### GET `/api/projects/[projectId]/elements`
Get all elements for a project.

**Response:**
```json
{
  "elements": [
    {
      "elementKey": "string",
      "elementName": "string",
      "id": "string"
    }
  ]
}
```

#### PATCH `/api/projects/[projectId]/elements/[elementKey]`
Update element name.

**Request:**
```json
{
  "name": "string"
}
```

---

## 💬 Chat Interface

### Chat Messages

#### GET `/api/projects/[projectId]/chat`
Get chat conversation history.

**Response:**
```json
{
  "messages": [
    {
      "id": "string",
      "role": "user" | "assistant" | "system",
      "content": "string",
      "metadata": {},
      "timestamp": "string"
    }
  ]
}
```

#### DELETE `/api/projects/[projectId]/chat`
Clear chat history for a project.

**Response:**
```json
{
  "success": true
}
```

### Tool Invocations

#### POST `/api/projects/[projectId]/tool-invocations/execute`
Execute a tool invocation.

**Request:**
```json
{
  "toolName": "string",
  "parameters": {}
}
```

**Response:**
```json
{
  "id": "string",
  "toolName": "string",
  "status": "pending" | "running" | "completed" | "failed",
  "result": {},
  "startTime": "number",
  "endTime": "number"
}
```

---

## 📋 Patent Application Generation

### Application Versions

#### GET `/api/projects/[projectId]/versions`
List application versions.

**Query Parameters:**
- `latest`: Get only the latest version (default: false)

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "createdAt": "string",
    "documents": [
      {
        "id": "string",
        "type": "string",
        "content": "string"
      }
    ]
  }
]
```

#### POST `/api/projects/[projectId]/versions`
Create new application version.

**Request:**
```json
{
  "name": "string",
  "sections": [
    {
      "type": "string",
      "title": "string",
      "content": "string"
    }
  ]
}
```

### Application Sections

#### POST `/api/projects/[projectId]/generate-application-sections`
Generate patent application sections.

**Request:**
```json
{
  "sections": ["TITLE", "ABSTRACT", "BACKGROUND", "SUMMARY", "CLAIMS"],
  "customInstructions": "string"
}
```

**Response:**
```json
{
  "sections": {
    "TITLE": "string",
    "ABSTRACT": "string",
    "BACKGROUND": "string",
    "SUMMARY": "string",
    "CLAIMS": "string"
  }
}
```

---

## 🔧 System & Utility

### Health Check

#### GET `/api/health`
System health check.

**Query Parameters:**
- `detailed`: Include detailed health information (default: false)

**Response:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "string",
  "version": "string",
  "uptime": "number",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "string",
      "duration": "number"
    },
    "storage": {
      "status": "healthy",
      "message": "string",
      "duration": "number"
    },
    "redis": {
      "status": "healthy",
      "message": "string",
      "duration": "number"
    },
    "ai": {
      "status": "healthy",
      "message": "string",
      "duration": "number"
    }
  }
}
```

### API Documentation

#### GET `/api/swagger`
Get OpenAPI/Swagger specification.

**Response:**
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Patent Drafter AI API",
    "version": "1.0.0"
  },
  "paths": {},
  "components": {}
}
```

---

## 📊 Rate Limiting

Different endpoints have different rate limits:

| Endpoint Type | Limit | Window | Key |
|---------------|-------|---------|-----|
| Authentication | 5 requests | 5 minutes | IP + User |
| Standard API | 100 requests | 1 minute | User + Tenant |
| AI Operations | 20 requests | 5 minutes | User + Tenant |
| File Upload | 10 requests | 5 minutes | User + Tenant |
| Search Operations | 50 requests | 1 hour | User + Tenant |
| Read Operations | 500 requests | 15 minutes | User + Tenant |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1635724800
Retry-After: 60
```

---

## ❌ Error Handling

### Standard Error Response
```json
{
  "error": true,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "issue": "Specific validation error"
  },
  "requestId": "req_12345",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `AUTH_FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_FAILED` | 400 | Request validation failed |
| `VALIDATION_REQUIRED_FIELD` | 400 | Required field missing |
| `DB_RECORD_NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `AI_SERVICE_ERROR` | 500 | AI service unavailable |
| `STORAGE_UPLOAD_FAILED` | 500 | File upload failed |
| `SECURITY_MALWARE_DETECTED` | 400 | Malicious file detected |

---

## 🔍 Query Parameters

### Common Query Parameters

#### Pagination
```
?page=1&limit=20
```

#### Filtering
```
?projectId=123&status=active&createdAfter=2024-01-01
```

#### Sorting
```
?sortBy=createdAt&sortOrder=desc
```

#### Field Selection
```
?fields=id,name,createdAt
```

#### Search
```
?search=patent%20application&filterBy=recent
```

---

## 📝 Request/Response Examples

### Create Project with Invention
```bash
curl -X POST "https://api.example.com/api/projects" \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-slug: acme-corp" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrf-token>" \
  -d '{
    "name": "Smart Weight Sensor System",
    "textInput": "A weight sensor that detects load changes using AI algorithms..."
  }'
```

### Upload Project Figure
```bash
curl -X POST "https://api.example.com/api/projects/proj_123/figures" \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-slug: acme-corp" \
  -H "X-CSRF-Token: <csrf-token>" \
  -F "files=@figure1.png" \
  -F "descriptions=[{\"description\":\"System overview diagram\"}]"
```

### Generate Search Queries
```bash
curl -X POST "https://api.example.com/api/projects/proj_123/claims/queries/v2" \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-slug: acme-corp" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrf-token>" \
  -d '{
    "elements": [
      "a weight sensor",
      "a microprocessor",
      "a wireless transmitter"
    ]
  }'
```

---

## 🧪 Testing API Endpoints

### Development Testing
```bash
# Set base URL and tenant
export API_BASE="http://localhost:3000/api"
export TENANT="test-tenant"

# Get CSRF token
csrf_token=$(curl -s "$API_BASE/csrf-token" | jq -r '.csrfToken')

# Test health endpoint
curl "$API_BASE/health?detailed=true"

# Test authenticated endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "x-tenant-slug: $TENANT" \
     -H "X-CSRF-Token: $csrf_token" \
     "$API_BASE/projects"
```

### Rate Limit Testing
```bash
# Test rate limiting
for i in {1..30}; do
  curl -w "%{http_code}\n" -o /dev/null -s \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "x-tenant-slug: $TENANT" \
    "$API_BASE/projects"
done
```

---

## 🔗 Related Documentation

- [Authentication Guide](02-architecture/02-authentication.md)
- [Security Architecture](SECURITY_ARCHITECTURE.md)
- [Data Fetching Standards](../src/lib/api/DATA_FETCHING_STANDARDS.md)
- [Async Services Guide](../src/client/services/ASYNC_QUICK_REFERENCE.md)
- [Repository Pattern Guide](../src/repositories/README.md)

---

For questions about specific endpoints or to report API issues, please check the corresponding service files in `src/client/services/` and `src/server/services/`.