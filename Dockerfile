# ---------- Build React ----------
FROM node:20-alpine AS client-build
WORKDIR /client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---------- Build server ----------
FROM node:20-alpine AS server-deps
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
# copy built React into server’s static dir
COPY --from=client-build /client/build ./client/build

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=server-deps /app ./
EXPOSE 8080
CMD ["node", "Server.js"]
