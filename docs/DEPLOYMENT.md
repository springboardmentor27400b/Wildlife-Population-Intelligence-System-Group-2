# Deployment Guide

This document contains instructions for deploying the **Wildlife Population Intelligence System** backend and frontend services.

## Production Builds

### 1. PostgreSQL Configuration
Ensure you have a production-ready PostgreSQL instance. Set the following environment variables:
```bash
POSTGRES_SERVER=prod-db-host
POSTGRES_USER=db-user
POSTGRES_PASSWORD=secure-password
POSTGRES_DB=wildlife_prod
POSTGRES_PORT=5432
```

### 2. FastAPI Backend
The backend can be built and run using a Docker container:
```bash
docker build -t wildlife-backend -f Dockerfile --target backend-base .
docker run -d -p 80:8000 --env-file .env wildlife-backend
```

Make sure to adjust the standard Uvicorn worker settings for production (e.g. multi-process worker counts):
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### 3. React Frontend
The frontend app compiles into static files (HTML, CSS, JS) that can be served via Nginx or a Static Hosting service:
```bash
cd frontend
npm install
npm run build
```
This produces a `dist` directory. Serve `dist` using Nginx with routing fallbacks:
```nginx
server {
    listen 80;
    server_name wildlife-monitoring.example.com;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```
