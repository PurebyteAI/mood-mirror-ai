# Mood Mirror AI

Mood Mirror AI is a full-stack app that lets users express emotions through text, drawing, or voice, then returns AI-powered emotional analysis and a creative response.

This repository includes:
- React frontend (`frontend/`)
- FastAPI backend (`backend/`)
- SQLite storage
- Docker + Docker Compose setup for local run and deployment portability

## Quick Start (Docker Compose)

### 1. Prerequisites
- Docker Engine 24+
- Docker Compose v2+

### 2. Configure environment
From repo root:

```bash
cp .env.example .env
```

Set at least:
- `OPENROUTER_API_KEY`

Optional features (speech/image/livekit) use:
- `GROQ_API_KEY`
- `RIME_API_KEY`
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `IMAGE_API_URL`, `IMAGE_API_BEARER_TOKEN`

### 3. Build and run
From repo root:

```bash
docker compose up --build -d
```

### 4. Access services
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8001`

### 5. Stop
```bash
docker compose down
```

To also remove persistent database volume:
```bash
docker compose down -v
```

## Docker Files Added

- `backend/Dockerfile`
	- Python 3.11 slim image
	- Installs backend dependencies
	- Runs `uvicorn server:app --host 0.0.0.0 --port 8001`

- `frontend/Dockerfile`
	- Multi-stage build (Node build + Nginx runtime)
	- Serves React build output from Nginx

- `frontend/nginx/default.conf`
	- SPA fallback to `index.html`
	- Reverse proxy `/api/*` to backend container (`backend:8001`)

- `docker-compose.yml`
	- `frontend` service on port `3000`
	- `backend` service on port `8001`
	- Named volume `backend_data` for SQLite persistence

- `.env.example`
	- Template environment variables for local and deployment runs

## Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
```

Backend default URL: `http://localhost:8001`

### Frontend
```bash
cd frontend
yarn install
yarn start
```

Frontend default URL: `http://localhost:3000`

## Deploy Anywhere with Docker

You can deploy this app on any container platform (VM, ECS, AKS, GKE, Render, Fly.io, Railway, DigitalOcean, etc.).

### Option A: Deploy using Compose directly
1. Copy repo to server
2. Install Docker + Compose
3. Configure `.env`
4. Run:

```bash
docker compose up --build -d
```

### Option B: Build and push images

Build images:
```bash
docker build -t <your-registry>/mood-mirror-backend:latest ./backend
docker build -t <your-registry>/mood-mirror-frontend:latest ./frontend
```

Push images:
```bash
docker push <your-registry>/mood-mirror-backend:latest
docker push <your-registry>/mood-mirror-frontend:latest
```

Then deploy with your platform using the same env vars from `.env.example`.

## Ports and Networking

- Frontend container exposes `80`, mapped to host `3000`
- Backend container exposes `8001`, mapped to host `8001`
- Frontend uses Nginx proxy so browser calls `/api/*` on same origin

## Data Persistence

- SQLite DB is persisted in Docker named volume: `backend_data`
- In container, DB path is `/data/mood_mirror.db`

## Troubleshooting

- `OPENROUTER_API_KEY` missing:
	- backend analysis calls fail; set it in `.env`

- Frontend cannot reach backend:
	- verify containers are up: `docker compose ps`
	- check logs: `docker compose logs -f backend frontend`

- Clean rebuild:
```bash
docker compose down -v
docker compose up --build -d
```

## Project Structure

```text
mood-mirror-ai/
├── backend/
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── nginx/
│   │   └── default.conf
│   └── ...
├── docker-compose.yml
├── .env.example
└── README.md
```
