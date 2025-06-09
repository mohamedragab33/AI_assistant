# Multi-stage build for Bitcoin Trading AI
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy package files
COPY btc_assistant/frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY btc_assistant/frontend/ ./

# Build frontend
RUN npm run build

# Python backend stage
FROM python:3.11-slim AS backend

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY btc_assistant/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY btc_assistant/ ./

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose ports
EXPOSE 8000 8001 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start script
COPY docker-entrypoint.sh /docker-entrypoint.sh
USER root
RUN chmod +x /docker-entrypoint.sh
USER appuser

ENTRYPOINT ["/docker-entrypoint.sh"] 