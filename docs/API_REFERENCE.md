# 🔌 API Reference Guide

> **Comprehensive API documentation for Patent Drafter AI**

## 📋 Overview

The Patent Drafter AI API follows REST principles with a tenant-aware architecture. All API endpoints are protected by authentication and authorization middleware.

### Base URL Structure
```
https://your-domain.com/api/[tenant]/[resource]
```

### Authentication
All API requests require authentication via Auth0 JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## 🔒 Security Presets

Every API endpoint uses one of these security presets:

| Preset | Authentication | CSRF | Rate Limit | Tenant Isolation |
|--------|---------------|------|------------|------------------|
| `tenantProtected` | ✅ | ✅ | ✅ | ✅ |
| `userPrivate` | ✅ | ✅ | ✅ | ❌ |
| `adminTenant` | ✅ (Admin) | ✅ | ✅ | ✅ |
| `adminGlobal` | ✅ (Admin) | ✅ | ✅ | ❌ |
| `public` | ❌ | ❌ | ✅ | ❌ |
| `browserAccessible` | Conditional | ❌ | ✅ | ✅ |

---

## 📊 Project Management

### Projects

#### GET `/api/[tenant]/projects`
List all projects for the tenant.

**Response:**
```json
{
  "projects": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "inventionCount": "number"
    }
  ]
}
```

#### POST `/api/[tenant]/projects`
Create a new project.

**Request:**
```json
{
  "name": "string",
  "description": "string"
}
```

#### GET `/api/[tenant]/projects/[id]`
Get project details with inventions.

#### PUT `/api/[tenant]/projects/[id]`
Update project information.

#### DELETE `/api/[tenant]/projects/[id]`
Soft delete a project.

---

## 🔬 Invention Management

### Inventions

#### GET `/api/[tenant]/projects/[projectId]/inventions`
List inventions in a project.

#### POST `/api/[tenant]/projects/[projectId]/inventions`
Create a new invention.

**Request:**
```json
{
  "title": "string",
  "summary": "string",
  "backgroundText": "string",
  "detailedDescription": "string",
  "claims": ["string"],
  "figureDescriptions": ["string"]
}
```

#### GET `/api/[tenant]/inventions/[id]`
Get invention details.

#### PUT `/api/[tenant]/inventions/[id]`
Update invention information.

---

## ⚖️ Claims Management

### Claims

#### GET `/api/[tenant]/projects/[projectId]/claims`
List claims for a project.

#### POST `/api/[tenant]/projects/[projectId]/claims`
Create new claims.

**Request:**
```json
{
  "claims": [
    {
      "number": "number",
      "text": "string",
      "type": "independent" | "dependent",
      "dependsOn": "number"
    }
  ]
}
```

#### GET `/api/[tenant]/claims/[id]/history`
Get claim version history.

#### PUT `/api/[tenant]/claims/[id]`
Update a claim.

#### POST `/api/[tenant]/claims/[id]/generate-variants`
Generate claim variants using AI.

---

## 🔍 Citation & Prior Art

### Citation Extraction

#### POST `/api/[tenant]/citation-extraction/queue`
Start citation extraction job (async).

**Request:**
```json
{
  "searchHistoryId": "string",
  "useDeepAnalysis": "boolean",
  "priority": "high" | "normal" | "low"
}
```

**Response:**
```json
{
  "jobId": "string",
  "status": "queued"
}
```

#### GET `/api/[tenant]/citation-extraction/[jobId]/status`
Check citation extraction status.

**Response:**
```json
{
  "status": "processing" | "completed" | "failed",
  "progress": "number",
  "citationCount": "number",
  "error": "string"
}
```

#### GET `/api/[tenant]/citation-matches`
List citation matches with filtering.

**Query Parameters:**
- `projectId`: Filter by project
- `searchHistoryId`: Filter by search
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

### Prior Art Analysis

#### GET `/api/[tenant]/prior-art/saved`
List saved prior art references.

#### POST `/api/[tenant]/prior-art/save`
Save a prior art reference.

**Request:**
```json
{
  "publicationNumber": "string",
  "title": "string",
  "abstract": "string",
  "relevanceScore": "number",
  "notes": "string"
}
```

---

## 🔍 Search & Analysis

### Search History

#### POST `/api/[tenant]/search-history/async-search`
Start asynchronous patent search.

**Request:**
```json
{
  "projectId": "string",
  "queries": ["string"],
  "filters": {
    "jurisdiction": "US" | "EP" | "WO",
    "dateFrom": "string",
    "dateTo": "string",
    "documentTypes": ["string"]
  }
}
```

**Response:**
```json
{
  "searchId": "string",
  "status": "processing"
}
```

#### GET `/api/[tenant]/search-history/[id]/status`
Check search status and get results.

#### GET `/api/[tenant]/search-history`
List search history for project.

---

## 📄 Patent Generation

### Patent Documents

#### POST `/api/[tenant]/patents/generate`
Generate patent application document.

**Request:**
```json
{
  "inventionId": "string",
  "template": "utility" | "provisional",
  "includeDrawings": "boolean",
  "customInstructions": "string"
}
```

#### GET `/api/[tenant]/patents/[id]`
Get patent document content.

#### PUT `/api/[tenant]/patents/[id]`
Update patent document.

#### POST `/api/[tenant]/patents/[id]/export`
Export patent to DOCX format.

---

## 🖼️ Figure Management

### Figures

#### POST `/api/[tenant]/projects/[projectId]/figures`
Upload figure files.

**Request:** `multipart/form-data`
- `files`: Figure files (images, PDFs)
- `descriptions`: JSON array of descriptions

**Response:**
```json
{
  "figures": [
    {
      "id": "string",
      "filename": "string",
      "mimeType": "string",
      "size": "number",
      "description": "string",
      "url": "string"
    }
  ]
}
```

#### GET `/api/[tenant]/figures/[id]`
Get figure metadata.

#### GET `/api/[tenant]/figures/[id]/download`
Download figure file (secure access).

#### PUT `/api/[tenant]/figures/[id]`
Update figure description.

#### DELETE `/api/[tenant]/figures/[id]`
Delete figure.

---

## 💬 Chat Interface

### Chat

#### POST `/api/[tenant]/chat/message`
Send message to AI assistant.

**Request:**
```json
{
  "message": "string",
  "context": {
    "projectId": "string",
    "inventionId": "string"
  }
}
```

**Response:** Server-Sent Events stream
```
data: {"type": "thinking", "message": "Analyzing your question..."}
data: {"type": "content", "message": "Based on your invention..."}
data: {"type": "complete"}
```

#### GET `/api/[tenant]/chat/history`
Get chat conversation history.

---

## 👥 User & Tenant Management

### Users

#### GET `/api/[tenant]/users/profile`
Get current user profile.

#### PUT `/api/[tenant]/users/profile`
Update user profile.

### Tenant Management (Admin Only)

#### GET `/api/admin/tenants`
List all tenants.

#### POST `/api/admin/tenants`
Create new tenant.

#### GET `/api/admin/tenants/[id]/users`
List tenant users.

---

## 🔧 System & Utility

### Health Check

#### GET `/api/health`
System health check.

**Response:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "string",
  "services": {
    "database": "healthy",
    "storage": "healthy",
    "redis": "healthy",
    "ai": "healthy"
  }
}
```

### CSRF Token

#### GET `/api/csrf-token`
Get CSRF token for forms.

**Response:**
```json
{
  "csrfToken": "string"
}
```

---

## 📊 Rate Limiting

Different endpoints have different rate limits:

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| Authentication | 10 requests | 1 hour |
| Standard API | 100 requests | 15 minutes |
| AI Operations | 20 requests | 15 minutes |
| File Upload | 10 requests | 15 minutes |
| Citation Extraction | 5 requests | 15 minutes |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1635724800
```

---

## ❌ Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "requestId": "req_12345"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

---

## 🔍 Query Parameters

### Common Query Parameters

#### Pagination
```
?limit=20&offset=0
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

---

## 📝 Request/Response Examples

### Create Invention with Claims
```bash
curl -X POST "https://api.example.com/api/acme-corp/projects/proj_123/inventions" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrf-token>" \
  -d '{
    "title": "Smart Weight Sensor System",
    "summary": "A weight sensor that detects load changes",
    "claims": [
      "A weight sensor comprising: a load cell; a microprocessor; and a wireless transmitter.",
      "The weight sensor of claim 1, wherein the load cell is a strain gauge."
    ]
  }'
```

### Start Citation Extraction
```bash
curl -X POST "https://api.example.com/api/acme-corp/citation-extraction/queue" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrf-token>" \
  -d '{
    "searchHistoryId": "search_456",
    "useDeepAnalysis": true,
    "priority": "high"
  }'
```

---

## 🧪 Testing API Endpoints

### Development Testing
```bash
# Set base URL
export API_BASE="http://localhost:3000/api"
export TENANT="test-tenant"

# Get CSRF token
csrf_token=$(curl -s "$API_BASE/csrf-token" | jq -r '.csrfToken')

# Test health endpoint
curl "$API_BASE/health"

# Test authenticated endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "X-CSRF-Token: $csrf_token" \
     "$API_BASE/$TENANT/projects"
```

### Rate Limit Testing
```bash
# Test rate limiting
for i in {1..30}; do
  curl -w "%{http_code}\n" -o /dev/null -s \
    "$API_BASE/test-endpoint"
done
```

---

## 🔗 Related Documentation

- [Authentication Guide](02-architecture/02-authentication.md)
- [Security Architecture](SECURITY_ARCHITECTURE.md)
- [Error Handling Patterns](../src/utils/error-handling/README.md)
- [Async Services Guide](../src/client/services/ASYNC_QUICK_REFERENCE.md)

---

For questions about specific endpoints or to report API issues, please check the corresponding service files in `src/client/services/` and `src/server/services/`.