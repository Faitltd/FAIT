# Dockerfile for offershield application
# Extends the base Dockerfile with application-specific configurations

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json files for workspace
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/offershield/package.json ./apps/offershield/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN npm ci

# Copy the rest of the monorepo
COPY . .

# Build the application
RUN npm run build -- --filter=offershield

# Production stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/offershield/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/offershield/.next/static ./apps/offershield/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/offershield/public ./apps/offershield/public

# Expose port
EXPOSE 8080

# Set the PORT environment variable for Next.js
ENV PORT=8080

# Start command
CMD ["node", "apps/offershield/server.js"]
