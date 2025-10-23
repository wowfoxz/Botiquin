# Dockerfile para Botilyx - Optimizado para producción
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

FROM base AS builder
WORKDIR /app

# Argumentos de build para variables NEXT_PUBLIC_*
ARG NEXT_PUBLIC_BASE_PATH=""
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_AUTH_USER=""
ARG NEXT_PUBLIC_AUTH_PASS=""
ARG NEXT_PUBLIC_APP_VERSION=""
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=""

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AUTH_USER=${NEXT_PUBLIC_AUTH_USER}
ENV NEXT_PUBLIC_AUTH_PASS=${NEXT_PUBLIC_AUTH_PASS}
ENV NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY}

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Argumentos para el runtime
ARG NEXT_PUBLIC_BASE_PATH=""

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN mkdir -p /app/logs && chown -R nextjs:nodejs /app/logs
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check dinámico con basePath
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000${NEXT_PUBLIC_BASE_PATH}/api/health || exit 1

CMD ["node", "server.js"]