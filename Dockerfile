# Build stage
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies (including devDependencies for Prisma)
RUN yarn install --frozen-lockfile

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN yarn build

# Production stage
FROM node:18-bullseye-slim AS production

# Install OpenSSL for Prisma (Debian 11/bullseye includes OpenSSL 1.1)
RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy Prisma files and generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copy Prisma CLI from builder (to use the same version as package.json)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Create startup script that runs migrations then starts the app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Running database migrations..."' >> /app/start.sh && \
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'exec node dist/main' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application (runs migrations first, then starts app)
CMD ["/app/start.sh"]

