# ---- Base Node ----
# Use a specific Node.js LTS version. Alpine is smaller.
FROM node:18-alpine AS base
WORKDIR /app

# Install OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl

# ---- Dependencies ----
# Install ALL dependencies needed for building
FROM base AS deps
# Copy package.json and lock file
COPY package.json package-lock.json* ./
# Install all dependencies (including devDependencies)
RUN npm ci

# ---- Builder ----
# Build the Next.js application
FROM base AS builder
WORKDIR /app
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client before building
RUN npx prisma generate

# Set build-time environment variables if needed
# ARG NEXT_PUBLIC_SOME_VAR
# ENV NEXT_PUBLIC_SOME_VAR=$NEXT_PUBLIC_SOME_VAR

# Important: Make sure 'output: standalone' is enabled in next.config.js
# Build the application (which will use the full node_modules)
RUN npm run build

# ---- Runner ----
# Create the final, small production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Optionally, disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
# The standalone output copies necessary production node_modules automatically
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma schema for runtime (needed for migrations)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Set the user to the non-root user
USER nextjs

# Expose the port the app runs on (default 3000)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Set the default command to start the server
CMD ["node", "server.js"] 