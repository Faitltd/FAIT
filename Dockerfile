# Multi-stage build for optimized production image

# Base stage for shared settings
FROM node:20.12.1-alpine3.19 AS base
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

# Copy the appropriate .env file based on the build environment
COPY .env.${BUILD_ENV} .env

# Build the full version of the application
RUN npm run build:full

# Production stage - create the final image
FROM node:20.12.1-alpine3.19 AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy only the built files and package.json from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install express and compression for a more reliable server
RUN npm install express compression

# Create the server file
RUN echo 'const express = require("express");' > server.js && \
    echo 'const path = require("path");' >> server.js && \
    echo 'const compression = require("compression");' >> server.js && \
    echo 'const app = express();' >> server.js && \
    echo 'const PORT = process.env.PORT || 8080;' >> server.js && \
    echo 'app.use(compression());' >> server.js && \
    echo 'app.use(express.static(path.join(__dirname, "dist")));' >> server.js && \
    echo 'app.get("*", (req, res) => {' >> server.js && \
    echo '  res.sendFile(path.join(__dirname, "dist", "index.html"));' >> server.js && \
    echo '});' >> server.js && \
    echo 'app.listen(PORT, () => {' >> server.js && \
    echo '  console.log(`Server is running on port ${PORT}`);' >> server.js && \
    echo '});' >> server.js

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
