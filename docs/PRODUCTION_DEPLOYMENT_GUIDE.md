# Wildlife Population Intelligence System
## Production Deployment Guide

### Overview
This guide provides step-by-step instructions for deploying the **Wildlife Population Intelligence System** to a production cloud environment (AWS, Azure, GCP, DigitalOcean, or Render) using Docker, PostgreSQL, Nginx, and SSL/TLS HTTPS encryption.

---

### Architecture Components
1. **Frontend**: React 18 + Vite SPA built to static HTML/JS/CSS served via Nginx.
2. **Backend**: FastAPI + SQLAlchemy application running on Uvicorn/Gunicorn.
3. **Database**: Managed PostgreSQL 15 database instance (or Docker container).
4. **Reverse Proxy / TLS**: Nginx with Let's Encrypt SSL/TLS certificates (HTTP → HTTPS redirection).
5. **AI Pipelines**: OpenCV, YOLOv8, ResNet50 classifier, Librosa bioacoustic signal processor with CPU fallback support.

---

### Step 1: Environment Configuration
Copy `.env.example` to `.env` on your production server:
```bash
cp .env.example .env
```
Update the production variables:
```env
ENVIRONMENT=production
DATABASE_URL=postgresql://wildlife_admin:YOUR_SECURE_PASSWORD@db:5432/wildlife_prod
SECRET_KEY=YOUR_GENERATED_64_CHAR_JWT_SECRET
CORS_ORIGINS=https://wildlife.yourdomain.com
DOMAIN_NAME=wildlife.yourdomain.com
```

---

### Step 2: Deployment Options

#### Option A: Docker Compose Deployment (DigitalOcean / EC2 / Compute Engine)
1. Install Docker & Docker Compose on your cloud server.
2. Clone repository and navigate to root directory.
3. Run container stack:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
4. Verify running containers:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

#### Option B: Render / Railway Deployment
1. Connect GitHub repository to Render / Railway.
2. Create a Managed PostgreSQL Database and copy `DATABASE_URL`.
3. Create Web Service for Backend:
   - Root Directory: `./backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add Environment Variables (`DATABASE_URL`, `SECRET_KEY`).
4. Create Static Site / Web Service for Frontend:
   - Root Directory: `./frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

---

### Step 3: SSL / TLS Certificate Setup (Certbot / Let's Encrypt)
On your cloud Linux host:
```bash
sudo apt update && sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wildlife.yourdomain.com
```

---

### Step 4: Health Check & Verification
- Health Endpoint: `GET https://wildlife.yourdomain.com/api/health`
- Executive Dashboard: `https://wildlife.yourdomain.com/executive-dashboard`
- System Health & Telemetry: `https://wildlife.yourdomain.com/system-health`
