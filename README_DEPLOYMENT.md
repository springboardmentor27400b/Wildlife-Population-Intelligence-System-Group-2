# Wildlife Population Intelligence System - Deployment Guide

## Production Docker Deployment

### Prerequisites
- Docker Engine 24.0+
- Docker Compose v2.0+

### Quick Start Deployment

1. Clone or navigate to the repository root directory:
```bash
cd Wildlife-Population-Intelligence-System
```

2. Start the application stack using Docker Compose:
```bash
docker compose up -d --build
```

3. Access the services:
- **Frontend Dashboard**: `http://localhost`
- **FastAPI Backend API**: `http://localhost:8000`
- **Interactive Swagger API Docs**: `http://localhost:8000/docs`

---

## Local Development Deployment (Without Docker)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Access local dev frontend at `http://localhost:5173`.
