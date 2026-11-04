FROM node:22-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Instala el grafo completo porque la compilación necesita herramientas de desarrollo.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Los artefactos se generan siempre dentro de la imagen, no se reutilizan del host.
COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN pnpm run build:api
RUN pnpm --filter mindlog-api deploy --legacy --prod /release

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /release ./

EXPOSE 8080

CMD ["node", "build/server.js"]
