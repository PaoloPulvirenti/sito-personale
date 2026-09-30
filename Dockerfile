# Immagine dell'API per Cloud Run. Build dalla radice del monorepo:
#   docker build -t sito-api .

# --- build: dipendenze complete e compilazione TypeScript ---
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci --workspace api --include-workspace-root=false
COPY api/tsconfig.json api/tsconfig.build.json api/
COPY api/src api/src
RUN npm run build --workspace api

# --- deps: solo dipendenze di produzione ---
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
# Con i workspace le dipendenze finiscono quasi tutte in /app/node_modules;
# api/node_modules esiste solo in caso di conflitti di versione, lo creiamo per il COPY.
RUN npm ci --workspace api --include-workspace-root=false --omit=dev \
  && mkdir -p api/node_modules

# --- runtime: niente toolchain, utente non root ---
FROM node:24-slim AS runtime
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/api/node_modules ./api/node_modules
COPY --from=build /app/api/dist ./api/dist
COPY api/package.json ./api/
USER node
EXPOSE 8080
CMD ["node", "api/dist/server.js"]
