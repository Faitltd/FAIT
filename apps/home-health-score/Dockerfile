FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY apps/home-health-score/package.json ./apps/home-health-score/
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
RUN npm run build --workspace=home-health-score

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy necessary files
COPY --from=builder /app/apps/home-health-score/next.config.js ./
COPY --from=builder /app/apps/home-health-score/package.json ./
COPY --from=builder /app/apps/home-health-score/.next/standalone ./
COPY --from=builder /app/apps/home-health-score/.next/static ./.next/static
COPY --from=builder /app/apps/home-health-score/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
