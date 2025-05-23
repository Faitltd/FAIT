# Multi-stage build for optimized production image

# Base stage for shared settings
FROM --platform=linux/amd64 node:20.12.1-alpine3.19 AS base
WORKDIR /app

# Dependencies stage - install all dependencies including dev dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build stage - build the application
FROM deps AS builder
COPY . .

# Set build arguments with defaults
ARG BUILD_ENV=production

# Create a default .env file with the appropriate configuration
RUN if [ "$BUILD_ENV" = "production" ]; then \
      echo "# Production Environment Configuration\nPUBLIC_API_URL=https://api.itsfait.com\nPUBLIC_SITE_URL=https://itsfait.com\nPUBLIC_ENABLE_ANALYTICS=true" > .env; \
    elif [ "$BUILD_ENV" = "staging" ]; then \
      echo "# Staging Environment Configuration\nPUBLIC_API_URL=https://staging-api.itsfait.com\nPUBLIC_SITE_URL=https://staging.itsfait.com\nPUBLIC_ENABLE_ANALYTICS=true" > .env; \
    else \
      echo "# Development Environment Configuration\nPUBLIC_API_URL=http://localhost:8000\nPUBLIC_SITE_URL=http://localhost:5173\nPUBLIC_ENABLE_ANALYTICS=false" > .env; \
    fi

# Build the application
RUN npm run build

# Production stage - create the final image
FROM --platform=linux/amd64 node:20.12.1-alpine3.19 AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy only the built files and package.json from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
# Set ownership of the application files
RUN chown -R appuser:nodejs /app
USER appuser

# Expose the port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O - http://localhost:8080/health || exit 1

# Start the server
CMD ["node", "build"]
