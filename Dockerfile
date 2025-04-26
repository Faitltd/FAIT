FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage for Cloud Run
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Modify nginx config to use PORT environment variable
RUN sed -i.bak 's/listen 3000/listen $PORT/g' /etc/nginx/conf.d/default.conf && \
    # Remove the server_name directive as it's not needed
    sed -i.bak 's/server_name localhost;//g' /etc/nginx/conf.d/default.conf

# Create a startup script to handle environment variables and start nginx
RUN echo '#!/bin/sh\n\
sed -i.bak "s/\$PORT/${PORT:-8080}/g" /etc/nginx/conf.d/default.conf\n\
exec nginx -g "daemon off;"\n\
' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# Expose the port the app runs on
EXPOSE 8080

# Use ENTRYPOINT with JSON format for better signal handling
ENTRYPOINT ["/docker-entrypoint.sh"]
