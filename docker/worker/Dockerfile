FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY worker/package.json worker/package-lock.json ./
RUN npm ci

# Copy source code
COPY worker/ ./

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Start the worker
CMD ["npm", "run", "start"]
