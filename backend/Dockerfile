FROM python:3.12-slim

WORKDIR /app

# Install curl for healthcheck monitoring
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files and application code
COPY . .

# Railway dynamic port
ENV PORT=8000
EXPOSE 8000

# Start Uvicorn listening on all network interfaces
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
