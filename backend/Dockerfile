# =================================
# Multi-stage build for smaller image
# =================================

# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt


# Stage 2: Production image
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application code
# Cache bust: 2026-01-24-v16-food-tracking-added
COPY . .

# Compile Python bytecode for faster startup
RUN python -m compileall -q .

# Expose Cloud Run port
EXPOSE 8080

# Environment variables for production
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Run with uvicorn directly for simplicity and to avoid gunicorn timeout issues
# Cloud Run manages process lifecycle, so gunicorn process manager is less critical
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
