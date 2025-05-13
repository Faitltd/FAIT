FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json files for all workspaces
COPY package.json ./
COPY turbo.json ./
COPY apps/fait-hub-sveltekit/package.json ./apps/fait-hub-sveltekit/
COPY packages/sveltekit-ui/package.json ./packages/sveltekit-ui/

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build --filter=fait-hub-sveltekit

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built app
COPY --from=builder /app/apps/fait-hub-sveltekit/build ./build
COPY --from=builder /app/apps/fait-hub-sveltekit/package.json ./package.json

# Install production dependencies
RUN npm install --production

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["node", "build/index.js"]
