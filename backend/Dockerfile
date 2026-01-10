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
COPY . .

# Compile Python bytecode for faster startup
RUN python -m compileall -q .

# Expose Cloud Run port
EXPOSE 8080

# Environment variables for production
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Run with gunicorn + uvicorn workers for production
# - 2 workers (Cloud Run recommends 1-4)
# - 30s timeout (matches Gemini API)
# - Graceful shutdown
CMD ["gunicorn", "main:app", \
    "--bind", "0.0.0.0:8080", \
    "--workers", "2", \
    "--worker-class", "uvicorn.workers.UvicornWorker", \
    "--timeout", "30", \
    "--graceful-timeout", "10", \
    "--keep-alive", "5", \
    "--access-logfile", "-", \
    "--error-logfile", "-"]
