FROM node:22-slim@sha256:f32b81066cde10a75dbac96646099533316d94bac4150c55da1636e1f0ffdc46 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN npm prune --omit=dev

FROM node:22-slim@sha256:f32b81066cde10a75dbac96646099533316d94bac4150c55da1636e1f0ffdc46

LABEL org.opencontainers.image.title="actual-firi-sync"
LABEL org.opencontainers.image.description="Sync Firi wallet value into an Actual Budget off-budget account"

ENV NODE_ENV=production
WORKDIR /app
RUN mkdir -p /app/cache && chown node:node /app/cache

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

HEALTHCHECK NONE

USER node

CMD ["node", "dist/src/index.js"]
