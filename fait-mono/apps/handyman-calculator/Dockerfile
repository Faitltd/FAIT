# Dockerfile for handyman-calculator application
# Extends the base Dockerfile with application-specific configurations

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json files for workspace
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/handyman-calculator/package.json ./apps/handyman-calculator/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN npm ci

# Copy the rest of the monorepo
COPY . .

# Build the application
RUN npm run build -- --filter=handyman-calculator

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
COPY --from=builder --chown=nextjs:nodejs /app/apps/handyman-calculator/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/apps/handyman-calculator/package.json ./

# Install express for serving the application
RUN npm install express

# Copy server file
COPY --from=builder --chown=nextjs:nodejs /app/apps/handyman-calculator/server.js ./

# Expose port
EXPOSE 8080

# Start command
CMD ["node", "server.js"]
