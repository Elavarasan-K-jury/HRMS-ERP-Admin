# `Dockerfile` — Docker Build Configuration

## Purpose

Multi-stage Docker build for the Nuxt 4 application.

## Stages

1. **Builder stage**: Uses Node 18, installs dependencies, runs `npm run build`.
2. **Production stage**: Uses Node 18 (slim), copies built artifacts and `node_modules`, exposes port 3030, starts with `node .output/server/index.mjs`.

## Note

The application can also be run with docker-compose for local development.
