# Configuration System Guide

## 🎯 Quick Start for Developers

This application uses a **single, centralized configuration system** that is secure, type-safe, and easy to use.

### How to Use Configuration

```typescript
// Import from ONE place:
import { environment } from '@/config/environment';

// Use it anywhere:
if (environment.isDevelopment) {
  console.log('Dev mode!');
}

const apiUrl = environment.api.baseUrl;
const isMultiTenant = environment.features.multiTenant;
```

### Key Principles

1. **Single Source of Truth**: All config comes from `environment.ts`
2. **Type-Safe**: Full TypeScript support with intellisense
3. **Secure by Default**: Server secrets are NEVER exposed to the browser
4. **No Confusion**: Clear `isServer` checks show what's available where

### Common Patterns

#### Client-Safe Values
```typescript
// These work everywhere (client & server):
environment.isDevelopment
environment.features.enableDrafting
environment.ui.toastDuration
```

#### Server-Only Values
```typescript
// These return empty strings on client (for security):
environment.auth.clientSecret  // '' on client
environment.database.password  // '' on client
environment.openai.apiKey      // '' on client
```

### Adding New Config

1. Add to `.env` file:
   ```
   MY_NEW_SECRET=secret123
   NEXT_PUBLIC_MY_NEW_FEATURE=true
   ```

2. Add to `environment.ts`:
   ```typescript
   myNewConfig: {
     // Client-safe value (use NEXT_PUBLIC_)
     feature: process.env.NEXT_PUBLIC_MY_NEW_FEATURE === 'true',
     
     // Server-only value
     secret: isServer ? process.env.MY_NEW_SECRET || '' : '',
   }
   ```

3. Use it:
   ```typescript
   import { environment } from '@/config/environment';
   
   if (environment.myNewConfig.feature) {
     // Feature is enabled
   }
   ```

### Why This Pattern?

- **Next.js Official Pattern**: This is how Next.js recommends handling env vars
- **No Build Issues**: Works perfectly with webpack/turbopack
- **Clear Security Boundary**: Obvious what's server-only vs client-safe
- **Easy to Test**: Can mock the entire config object
- **Zero Magic**: No dynamic imports, no eval(), no hacks

### Common Questions

**Q: Why not use separate client/server configs?**  
A: One import is simpler. The `isServer` pattern is clear and prevents mistakes.

**Q: What about validation?**  
A: Server startup validates required vars in `env-validation.ts`

**Q: How do I know what config is available?**  
A: TypeScript intellisense shows everything!

### Need Help?

- Check `environment.ts` - it's well-commented
- Use TypeScript intellisense to explore
- Server secrets return `''` on client (not undefined) 