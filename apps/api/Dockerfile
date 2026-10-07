FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# 1. Copia la configuración del workspace y los package.json necesarios
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# 2. Instala las dependencias de todo el monorepo (incluye devDependencies para pino-pretty, tsx, etc.)
RUN pnpm install

# 3. Copia el código fuente de los paquetes compartidos y la API
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# 4. Si tu paquete de tipos requiere un paso de compilación previa, descomenta esta línea:
# RUN pnpm --filter @mindlog/types build

WORKDIR /app/apps/api

# Mantenemos el entorno explícitamente en desarrollo para los logs de Pino
ENV NODE_ENV=development

EXPOSE 8080

# --- OPCIÓN A: Compilar y ejecutar dist (con NODE_ENV=development activo) ---
RUN pnpm build
CMD ["node", "dist/server.js"]

# --- OPCIÓN B: Ejecutar el script dev directamente (por ejemplo tsx / ts-node-dev si usas recarga en vivo) ---
# CMD ["pnpm", "dev"]