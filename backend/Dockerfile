FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps for common Python wheels and runtime compatibility.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /data

COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . .

# Persist SQLite database in mounted volume path by default.
ENV BACKEND_HOST=0.0.0.0 \
    BACKEND_PORT=8080 \
    BACKEND_RELOAD=false \
    SQLITE_DB_PATH=/data/mood_mirror.db

EXPOSE 8080

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8080}"]
