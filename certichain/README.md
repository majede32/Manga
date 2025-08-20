## CertiChain MVP

A minimal full-stack setup:
- Next.js 14 + Tailwind frontend with a basic 3D certificate viewer and upload flow
- FastAPI backend with a file upload endpoint returning placeholder analysis
- Docker Compose to run both services locally

### Quick start (Docker)
1. Copy env examples if needed
2. Run: `docker compose up --pull always`
3. Frontend: http://localhost:3000  Backend: http://localhost:8000

### Run locally (without Docker)
- Backend:
  - `cd backend`
  - `python -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt`
  - `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

- Frontend:
  - `cd frontend`
  - `npm install`
  - `npm run dev`

Set `NEXT_PUBLIC_BACKEND_URL` (frontend) to the backend address (defaults to `http://localhost:8000`).

