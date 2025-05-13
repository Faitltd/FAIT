# Dockerfile for home-health-score application
# Extends the base Dockerfile with application-specific configurations

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json files for workspace
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/home-health-score/package.json ./apps/home-health-score/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN npm ci

# Copy the rest of the monorepo
COPY . .

# Build the application
RUN npm run build -- --filter=home-health-score

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
COPY --from=builder --chown=nextjs:nodejs /app/apps/home-health-score/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/home-health-score/.next/static ./apps/home-health-score/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/home-health-score/public ./apps/home-health-score/public

# Expose port
EXPOSE 8080

# Set the PORT environment variable for Next.js
ENV PORT=8080

# Start command
CMD ["node", "apps/home-health-score/server.js"]
