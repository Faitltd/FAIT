FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY api/package.json api/package-lock.json ./
RUN npm ci

# Copy source code
COPY api/ ./

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start the application
CMD ["npm", "run", "start"]
