FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY apps/fait-coop/package.json ./apps/fait-coop/
COPY packages/ui/package.json ./packages/ui/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/utils/package.json ./packages/utils/

RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project
RUN npm run build --workspace=fait-coop

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
USER appuser

# Copy necessary files
COPY --from=builder /app/apps/fait-coop/dist ./dist
COPY --from=builder /app/apps/fait-coop/package.json ./

# Install a simple HTTP server to serve static content
RUN npm install -g http-server

EXPOSE 8080

CMD ["http-server", "dist", "-p", "8080"]
