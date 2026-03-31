# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY tsconfig.json tsconfig.seed.json ./
COPY prisma ./prisma
COPY src ./src

# Provide a dummy DATABASE_URL so prisma generate can validate the schema
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public" npx prisma generate
RUN npm run build
RUN npx tsc -p tsconfig.seed.json

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Default DATABASE_URL pointing to the postgres Docker service.
# Override this via docker-compose environment or -e flag.
ENV DATABASE_URL=""

# Install openssl for Prisma engine compatibility
RUN apk add --no-cache openssl

# Install production deps only
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built output and prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Create uploads directory for local file storage
RUN mkdir -p uploads/avatars uploads/documents

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "dist/index.js"]
