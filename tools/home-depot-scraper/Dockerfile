FROM node:20-alpine

WORKDIR /app

# Copy application files
COPY tools/home-depot-scraper/ ./

# Install dependencies
RUN npm ci

# Set the entrypoint
ENTRYPOINT ["node", "index.js"]
