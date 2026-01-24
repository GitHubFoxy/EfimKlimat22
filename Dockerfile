# syntax=docker/dockerfile:1

# 1. Base image for dependencies and build
FROM docker.io/oven/bun:1 AS base
WORKDIR /app

# 2. Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install

# 3. Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the app (requires NEXT_PUBLIC_CONVEX_URL to be set if used in static pages)
# We accept it as a build argument
ARG NEXT_PUBLIC_CONVEX_URL
ARG CONVEX_SELF_HOSTED_URL
ARG CONVEX_SELF_HOSTED_ADMIN_KEY

ENV NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}
ENV CONVEX_SELF_HOSTED_URL=${CONVEX_SELF_HOSTED_URL}
ENV CONVEX_SELF_HOSTED_ADMIN_KEY=${CONVEX_SELF_HOSTED_ADMIN_KEY}

# Note: convex/_generated should be included in the build context
# Run `bunx convex codegen` locally before building
RUN bun run build

# 4. Production image
FROM docker.io/oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy only necessary files from builder
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["bun", "run", "server.js"]
