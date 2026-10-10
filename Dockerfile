# Use official Node.js LTS slim image for security and compatibility with native modules like bcrypt
FROM node:20-slim AS base

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

# Install dependencies (utilizing layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose backend port (Coolify routes to this port)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api || exit 1

# Start server directly with node
CMD ["node", "app.js"]
