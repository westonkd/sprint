FROM node:24-alpine AS base
RUN apk add --no-cache libstdc++
COPY --from=oven/bun:1.2-alpine /usr/local/bin/bun /usr/local/bin/bun
ENV CI=true \
    BUN_INSTALL_CACHE_DIR=/home/node/.bun/install/cache
RUN mkdir -p /app /home/node/.bun && chown -R node:node /app /home/node
WORKDIR /app
USER node

FROM base AS deps
COPY --chown=node:node package.json bun.lock* ./
RUN bun install

FROM deps AS dev
COPY --chown=node:node . .
EXPOSE 5173
CMD ["bun", "run", "dev"]

FROM deps AS ci
COPY --chown=node:node . .
RUN bun run verify

FROM scratch AS artifacts
COPY --from=ci /app/dist ./dist
COPY --from=ci /app/agent-manifest.json ./agent-manifest.json

FROM deps AS docs
COPY --chown=node:node . .
RUN bun run docs

FROM scratch AS docs-site
COPY --from=docs /app/dist-docs ./
