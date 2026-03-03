# Stage 1: Build execution
FROM node:18 AS builder

# node:18 already contains python3, make, and g++ (build-essential)
WORKDIR /app

# Copy package configurations
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy the entire backend
COPY . .

# Build TypeScript to Javascript
RUN npm run build

# Prune dev dependencies before moving to production image
RUN npm prune --production

# Stage 2: Production execution
FROM node:18-slim

WORKDIR /app

# Copy dependencies and build context
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000

# Start server using the compiled js
CMD ["node", "dist/server.js"]
