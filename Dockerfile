
ARG NODE_VERSION=20-alpine


FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./


RUN npm ci --ignore-scripts


#
FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARG NEXT_PUBLIC_MAPTILER_API_KEY
ARG NEXT_PUBLIC_MAPTILER_GEO_KEY

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_SIGN_IN_URL}
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_SIGN_UP_URL}
ENV NEXT_PUBLIC_MAPTILER_API_KEY=${NEXT_PUBLIC_MAPTILER_API_KEY}
ENV NEXT_PUBLIC_MAPTILER_GEO_KEY=${NEXT_PUBLIC_MAPTILER_GEO_KEY}


ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
ENV DATABASE_URL=${DATABASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

RUN npm prune --omit=dev


FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next            ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules     ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json     ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts   ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json    ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma           ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --spider http://localhost:3005/ || exit 1

CMD ["npm", "start"]
