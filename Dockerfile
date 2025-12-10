# Build stage
FROM node:18-alpine AS builder

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
FROM node:18-alpine AS production

# Install OpenSSL for Prisma (required for query engine)
RUN apk add --no-cache openssl libssl1.1-compat

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy Prisma files and generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Install Prisma CLI for migrations
RUN yarn add -D prisma

# Run migrations during build
# Railway provides DATABASE_URL during build, so migrations will run here
RUN npx prisma migrate deploy

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]

