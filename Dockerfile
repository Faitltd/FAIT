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
# Remove any geargrab components, tools, or scrapers before building
# as per project requirements for cloud deployment
RUN rm -rf geargrab tools scrapers

# Set build arguments with defaults
ARG BUILD_ENV=production

# Create a default .env file with the appropriate configuration
RUN if [ "$BUILD_ENV" = "production" ]; then \
      echo "# Production Environment Configuration\nVITE_APP_VERSION=full\nVITE_API_URL=https://api.fait-coop.com\nVITE_SITE_URL=https://fait-coop.com\nVITE_ENABLE_ANALYTICS=true\nVITE_ENABLE_ADVANCED_FEATURES=true\nVITE_ENABLE_PERFORMANCE_MONITORING=true" > .env; \
    elif [ "$BUILD_ENV" = "staging" ]; then \
      echo "# Staging Environment Configuration\nVITE_APP_VERSION=full\nVITE_API_URL=https://staging-api.fait-coop.com\nVITE_SITE_URL=https://staging.fait-coop.com\nVITE_ENABLE_ANALYTICS=true\nVITE_ENABLE_ADVANCED_FEATURES=true\nVITE_ENABLE_PERFORMANCE_MONITORING=true" > .env; \
    else \
      echo "# Development Environment Configuration\nVITE_APP_VERSION=full\nVITE_API_URL=http://localhost:8000\nVITE_SITE_URL=http://localhost:5173\nVITE_ENABLE_ANALYTICS=false\nVITE_ENABLE_ADVANCED_FEATURES=true\nVITE_ENABLE_PERFORMANCE_MONITORING=false" > .env; \
    fi

# Build the full version of the application
RUN npm run build:full

# Production stage - create the final image
FROM --platform=linux/amd64 node:20.12.1-alpine3.19 AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy only the built files, package.json, and server.js from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY server.js ./

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
CMD ["node", "server.js"]
