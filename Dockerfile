FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
COPY . .
RUN npm ci
RUN npm run build

FROM base AS runner
COPY --from=builder /app/.output ./.output
EXPOSE 3030
ENV HOST=0.0.0.0
ENV PORT=3030
CMD ["node", ".output/server/index.mjs"]
