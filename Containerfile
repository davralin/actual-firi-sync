FROM node:24-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN npm prune --omit=dev

FROM node:24-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df

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
