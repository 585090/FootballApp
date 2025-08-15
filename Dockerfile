# Stage 1: Build React client
FROM node:20-alpine AS build-client

WORKDIR /client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Stage 2: Build server with React build
FROM node:20-alpine

WORKDIR /server

# Copy server package files and install
COPY server/package*.json ./
RUN npm install

# Copy server code
COPY server/ .

# Copy React build from previous stage
COPY --from=build-client /client/build ./client-build

EXPOSE 5000

CMD ["node", "server.js"]
