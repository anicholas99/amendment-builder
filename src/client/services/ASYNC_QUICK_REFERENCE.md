# Async Services - Quick Reference Card

## 🚀 TL;DR
- We use `setImmediate()` for async processing (no external workers)
- Two main async services: **Semantic Search** & **Citation Extraction**
- Both return 202 immediately, process in background

## 🔧 Environment Setup
```env
USE_CITATION_WORKER=false   # Use inline processing (default)
INTERNAL_API_KEY=xxx        # Required for citation post-processing
AIAPI_API_KEY=xxx          # Required for external APIs
```

## 📍 Key Locations

| Service | API Endpoint | Service File | Typical Time |
|---------|-------------|--------------|--------------|
| Semantic Search | `/api/search-history/async-search` | `semanticSearchService.ts` | 5-10s |
| Citation Extract | `/api/citation-extraction/queue` | `citationExtractionService.ts` | ~25s |

## 🔄 Common Pattern
```typescript
// 1. Client Request
POST /api/some-async-endpoint
{ ...data }

// 2. Immediate Response (202)
{ "jobId": "123", "status": "processing" }

// 3. Background Processing
setImmediate(async () => {
  await doWork();
  await updateStatus();
});

// 4. Client Polls or UI Auto-refreshes
```

## 🐛 Debugging Commands
```bash
# Check if async services are configured
grep USE_CITATION_WORKER .env

# Watch logs for async processing
npm run dev | grep -E "CitationExtraction|AsyncSearch"

# Test semantic search
curl -X POST http://localhost:3000/api/search-history/async-search \
  -H "Content-Type: application/json" \
  -d '{"projectId": "PROJECT_ID", "queries": ["test query"]}'
```

## ⚠️ Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Analyzing relevance..." spins forever | Missing `INTERNAL_API_KEY` | Add to `.env.local` |
| Citation extraction fails | External API timeout | Check `AIAPI_API_KEY` and network |
| Search results don't appear | Background process failed | Check logs for errors |

## 📈 Scaling Options
- **Now**: `setImmediate()` in-process (current)
- **If needed**: Set `USE_CITATION_WORKER=true` for external workers
- **Future**: Add Redis/Azure Service Bus queues

## 💡 Pro Tips
- Always check environment variables first when debugging
- Logs are your friend - each service logs its progress
- Failed jobs show retry buttons in UI
- Background processes have 45s timeout protection 