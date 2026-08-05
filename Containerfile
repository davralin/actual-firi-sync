FROM node:24-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN npm prune --omit=dev

FROM node:24-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03

LABEL org.opencontainers.image.title="actual-firi-sync"
LABEL org.opencontainers.image.description="Sync Firi wallet value into an Actual Budget off-budget account"

ENV NODE_ENV=production
WORKDIR /app
RUN rm -rf \
    /usr/local/bin/corepack \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/pnpm \
    /usr/local/bin/pnpx \
    /usr/local/bin/yarn \
    /usr/local/bin/yarnpkg \
    /opt/yarn* \
    /usr/local/lib/node_modules/corepack \
    /usr/local/lib/node_modules/npm \
  && mkdir -p /app/cache \
  && chown node:node /app/cache

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

HEALTHCHECK NONE

USER node

CMD ["node", "dist/src/index.js"]
