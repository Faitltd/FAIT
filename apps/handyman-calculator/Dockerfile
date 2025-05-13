FROM node:20-alpine

WORKDIR /app

# Copy application files
COPY apps/handyman-calculator/ ./

# Install dependencies
RUN npm ci

# Expose port
EXPOSE 8083

# Start the application
CMD ["npm", "start"]
