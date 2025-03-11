# Use Node.js LTS as the base image (full version with build tools)
FROM node:20 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json, prisma schema, and related files
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Generate Prisma client
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client
RUN npx prisma generate

# Rebuild bcrypt and build the application
RUN npm rebuild bcrypt --build-from-source && pnpm build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules ./node_modules

# Set the correct permissions
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
