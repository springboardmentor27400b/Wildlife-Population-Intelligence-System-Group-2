# Wildlife Population Intelligence System (WPIS)

A modern, scalable, full-stack web application designed for wildlife monitoring, bioacoustic tracking, AI-assisted species recognition, and conservation analytics.

---

## 📋 Project Overview
The Wildlife Population Intelligence System (WPIS) is a production-ready, monorepo-structured platform engineered to assist researchers, rangers, and conservation officers. WPIS enables real-time device tracking, automated species recognition from camera traps, bioacoustic sensor monitoring, map visualizations, advanced reporting, and strict role-based audit logging.

---

## ✨ Features

- **JWT Authentication & RBAC**: Advanced Role-Based Access Control protecting routes across roles (Administrator, Wildlife Researcher, Conservation Officer, Forest Department Officer).
- **Interactive Wildlife Map**: Spatial mapping of monitoring sites and device coordinates using mapping libraries.
- **AI Species Recognition**: Multi-label classifier interface for automatic species detection from field camera trap uploads.
- **Sensor Devices Management**: Full tracking of field equipment (Camera Traps, Acoustic Sensors, GPS Collars, Weather Stations) with active battery and network monitoring.
- **Monitoring Sites Control**: Manage core and buffer conservation zones, area sizes, and habitat types.
- **Reports & Data Export**:
  - **Excel**: Multi-tab workbook containing auto-filters, frozen headers, autosized columns, and a separate summary statistics sheet.
  - **PDF**: Landscape orientation reports complete with header banners, active filters details, tabular records, and running page numbers in footers.
- **System Audit Logging**: Comprehensive, admin-only audit trail tracking logins, updates, AI predictions, and device states.
- **Notifications Hub**: System alerts and priority-based notifications (Critical, Warning, Success, Info) reflecting hardware failures and research approvals.

---

## 📁 Folder Structure

```text
WPIS/
├── backend/                  # FastAPI Backend Code
│   ├── app/
│   │   ├── api/              # Route controllers (auth, devices, audit_logs, observations, predictions, etc.)
│   │   ├── core/             # Configuration, security middleware, data seed scripts
│   │   ├── database/         # Beanie ODM & Motor MongoDB connection initialization
│   │   ├── models/           # Beanie Document ODM database schemas
│   │   ├── schemas/          # Pydantic validation request/response models
│   │   ├── utils/            # Shared helpers (structlog setup, async audit helper)
│   │   └── main.py           # FastAPI Application entrypoint ( lifespan, exception handlers, middlewares )
│   ├── requirements.txt      # Python dependencies
│   ├── run_migration.py      # Database setup & data seed command script
│   └── .env.example          # Backend env configuration template
│
├── frontend/                 # Vite + React Frontend Code
│   ├── src/
│   │   ├── assets/           # Static asset styles, branding vectors, icons
│   │   ├── components/       # Custom reusable components (UI cards, buttons, notification bell)
│   │   ├── config/           # Route permissions & allowed actions mapping
│   │   ├── context/          # React Context providers (AuthContext.jsx)
│   │   ├── layouts/          # Main navigation layouts (sidebar, mobile overlays)
│   │   ├── pages/            # Core views (Dashboard, AuditLogs, Surveys, Map, Predictions, etc.)
│   │   ├── services/         # Axios API clients (authService, auditLogService, etc.)
│   │   ├── index.css         # Tailwind directives & theme colors
│   │   └── App.jsx           # App layout & routing structure
│   ├── package.json          # Node dependencies & package scripts
│   ├── vite.config.js        # Vite bundling preferences
│   └── .env.example          # Frontend env configuration template
│
└── docker-compose.yml        # Orchestration configuration for local development
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and adjust the variables:
- `MONGO_URI`: The MongoDB connection string (Local or MongoDB Atlas).
- `JWT_SECRET`: Random hash key used to sign authorization tokens.
- `JWT_ALGORITHM`: Signature method (default: `HS256`).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token validity lifespan (default: `1440` minutes).
- `BACKEND_CORS_ORIGINS`: Comma-separated list of allowed CORS origins.

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
- `VITE_API_URL`: Root path to the running FastAPI server (default: `http://localhost:8000`).
- `VITE_GOOGLE_CLIENT_ID`: OAuth client id for Predictions or Google auth integrations.

---

## 🚀 Installation & Running Locally

### 1. Database Requirement
Ensure MongoDB is running locally on port `27017` or supply a remote MongoDB connection string via the `MONGO_URI` variable.

### 2. Backend Installation & Setup
From the `backend/` directory:
```bash
# Create python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and seed default data
python run_migration.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- **API Server**: http://localhost:8000
- **Interactive Swagger Docs**: http://localhost:8000/docs
- **Health Endpoint**: http://localhost:8000/health

### 3. Frontend Installation & Setup
From the `frontend/` directory:
```bash
# Install Node dependencies
npm install

# Run the development server
npm run dev
```
- **Web App URL**: http://localhost:5173

---

## 📡 API Routes Overview

- **Auth & Settings**:
  - `POST /api/v1/auth/register`: Create user accounts.
  - `POST /api/v1/auth/login`: Authenticate and obtain JWT.
  - `PUT /api/v1/settings/profile`: Modify profile info.
  - `PUT /api/v1/settings/password`: Update security password.
- **Audit Logs (Admin-Only)**:
  - `GET /api/v1/audit-logs`: Search and filter paginated audit trail records.
  - `GET /api/v1/audit-logs/export/excel`: Download spreadsheet with summary metrics.
  - `GET /api/v1/audit-logs/export/pdf`: Download formatted landscape PDF.
  - `GET /api/v1/audit-logs/{id}`: Detailed metadata view of a log entry.
- **Observations & Sites**:
  - `GET /api/v1/observations`: Paginated list of wildlife observation records.
  - `POST /api/v1/observations`: Submit observation sightings.
  - `PUT /api/v1/observations/{id}/verify`: Approve/Reject records.
  - `GET /api/v1/sites`: List conservation monitoring zones.

---

## 🐳 Docker Deployment Guide

For instant setup across all services including a local database, run the following from the root directory:
```bash
docker-compose up -d --build
```
This launches:
1. **MongoDB Container**: Bound to port `27017`.
2. **FastAPI backend**: Accessible on port `8000`.
3. **Vite Frontend**: Serving web app on port `5173`.
