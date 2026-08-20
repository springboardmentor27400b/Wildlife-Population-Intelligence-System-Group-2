# Wildlife Population & Ecosystem Intelligence System

A commercial-grade, multi-modal **AI Wildlife Population & Ecosystem Intelligence Platform** designed for real-time biodiversity monitoring, computer vision species detection, bioacoustic signal analysis, population analytics, habitat quality modeling, GIS spatial mapping, and predictive conservation management.

---

## Deployment & System Status

> [!NOTE]
> **PRODUCTION DEPLOYMENT (Render Cloud & Local Environments)**  
> - **Live Frontend Web App**: [https://wildlife-frontend-kjbn.onrender.com/](https://wildlife-frontend-kjbn.onrender.com/)
> - **Live Backend REST API**: [https://wildlife-backend-vdvt.onrender.com/](https://wildlife-backend-vdvt.onrender.com/)
> - **API Health Check**: [https://wildlife-backend-vdvt.onrender.com/api/health](https://wildlife-backend-vdvt.onrender.com/api/health)
> - **Local Development**: Fully automated via `start_system.bat` for Windows environments.

---

## Executive Overview

The **Wildlife Population Intelligence System** provides an end-to-end intelligence pipeline that transforms unstructured field data (camera trap imagery, bioacoustic audio recordings, and spatial telemetry) into actionable biodiversity analytics. Built with high-performance computer vision, bioacoustic signal processing, and deterministic ecological algorithms, the platform equips wildlife researchers, conservationists, and decision-makers with automated monitoring tools.

---

## Project Objectives

1. **Automated Multimodal Species Identification**: Real-time detection and classification of wildlife using lightweight computer vision (YOLOv8n + Taxonomy Mapping) and bioacoustic audio signal processing (Librosa Mel-Spectrograms & MFCCs).
2. **Deterministic Ecological Analytics**: Automated calculation of mathematical ecological indicators, including Shannon's Diversity Index ($H'$), Pielou's Evenness ($J'$), species richness, and habitat suitability scores.
3. **Population & Habitat Intelligence**: Per-species estimated population density ($/km^2$), growth velocity, sex/age ratio modeling, and migration corridor risk assessment.
4. **Proactive Conservation Action**: Automated rule-based recommendation engine prioritizing intervention urgency (Critical, High, Medium, Low).
5. **Interactive GIS & Executive Dashboards**: Leaflet spatial mapping, interactive Recharts visualizers, dynamic hardware telemetry, and publication-ready multi-format exporting (PDF, CSV, Excel, JSON).

---

## Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **GIS Mapping**: Leaflet & React-Leaflet
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.11 / 3.13)
- **Database ORM**: SQLAlchemy (Dual driver support: SQLite local dev & PostgreSQL production)
- **PDF Engine**: ReportLab
- **Hardware Telemetry**: `psutil`
- **Authentication**: JWT tokens (`python-jose`) with PBKDF2/bcrypt password hashing

### AI & Signal Processing
- **Computer Vision**: Ultralytics YOLOv8 (yolov8n lightweight CPU detector) + IUCN Taxonomy Classification
- **Bioacoustics**: Librosa (Mel-frequency cepstral coefficients, Mel-spectrogram & spectral centroid analysis)
- **Image Processing**: OpenCV & Pillow

### Deployment & Orchestration
- **Cloud PaaS**: Render Blueprint (`render.yaml`)
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`, `docker-compose.prod.yml`)

---

## System Architecture

```mermaid
graph TD
    User([Field Researcher / Admin]) -->|HTTP / Port 80| Frontend[React 18 SPA Frontend]
    Frontend -->|REST API Requests| Backend[FastAPI Backend Web Service]
    
    subgraph AI & Analytics Engines
        Backend --> YOLO[YOLOv8 + Wildlife Taxonomy Mapping]
        Backend --> Audio[Librosa Bioacoustic Signal Processor]
        Backend --> Eco[Shannon Index & Ecosystem Health Calculator]
        Backend --> Pop[Population Density & Trend Engine]
        Backend --> Rec[Conservation Recommendation Engine]
    end
    
    subgraph Data & Telemetry Layer
        Backend --> ORM[SQLAlchemy ORM]
        ORM --> SQLite[SQLite Local Development DB]
        ORM --> Postgres[Render Managed PostgreSQL DB]
        Backend --> Telemetry[psutil Hardware Telemetry]
    end
```

---

## System Sitemap & Module Matrix

| Module | Route | Description |
| :--- | :--- | :--- |
| **Main Dashboard** | `/` | Field monitoring sites summary & real-time sampling stats |
| **Executive Dashboard** | `/executive-dashboard` | 8 summary KPI cards & 12 interactive analytics graphs |
| **AI Intelligence Workspace** | `/intelligence` | Unified AI workspace for population, habitat, & bioacoustics |
| **GIS Map** | `/gis` | Interactive Leaflet spatial map with layer filters |
| **AI Predictions** | `/predictions` | 6-month & 1-year population forecasts & threat probability |
| **System Health** | `/system-health` | Live dynamic psutil CPU, RAM, & Disk telemetry |
| **Species Recognition** | `/species` | YOLOv8 image upload & bounding box annotation |
| **Audio Recognition** | `/audio` | Waveform & spectrogram bioacoustic call analysis |
| **Biodiversity Analytics**| `/biodiversity` | Shannon Index ($H'$) & detection velocity trends |
| **Population Intelligence**| `/population` | Per-species estimates, density ($/km^2$), & demographic ratios |
| **Habitat Intelligence** | `/habitat` | Suitability scores, risk badges, & migration corridors |
| **Conservation Engine** | `/conservation` | Automated priority interventions & recommendation cards |
| **Ecosystem Health** | `/ecosystem` | Ecosystem health grade & radar metric breakdown |
| **Reports Exporter** | `/reports` | Native export center for PDF, CSV, Excel (XLSX), & JSON |
| **Sites Management** | `/sites` | Habitat sites, GPS coordinates, & regional tracking |
| **Surveys** | `/surveys` | Field sensor survey events & observer logs |
| **Observations** | `/observations` | Direct species observation logs & encounter counts |
| **Datasets** | `/datasets` | Multi-dataset ingestion catalog & metadata stats |
| **User Profile** | `/profile` | User role details, access permissions, & account metadata |

---

## Installation & Local Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Docker & Docker Compose (Optional for containerized setup)

### 1. Windows Local Development (`start_system.bat`)
For local Windows development, a dedicated startup script is provided:
```cmd
start_system.bat
```
> *Note: `start_system.bat` is for local Windows development only. It automatically discovers Python (virtualenv or system PATH), verifies npm, and launches both frontend (`http://localhost:5173`) and backend (`http://localhost:8000`). It is NOT used in cloud production.*

### 2. Manual Local Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Run FastAPI development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The local frontend will be accessible at `http://localhost:5173` and backend at `http://localhost:8000`.

---

## Environment Configuration

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

```env
# APPLICATION ENVIRONMENT
ENVIRONMENT=development
DEBUG=true

# SERVER CONFIGURATION
PORT=8000
HOST=127.0.0.1

# DATABASE CONFIGURATION
# SQLite (Development Default):
DATABASE_URL=sqlite:///./wildlife.db
# PostgreSQL (Production):
# DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# SECURITY (Placeholders for local dev)
SECRET_KEY=your_secret_key_here_min_32_chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## Production Deployment (Render Cloud)

The application is deployed on Render Cloud with separate frontend and backend services utilizing a native Render Blueprint (`render.yaml`) with environment-variable-based secret management.

### Production URLs
- **Frontend Web Service**: `https://wildlife-frontend-kjbn.onrender.com/`
- **Backend API Service**: `https://wildlife-backend-vdvt.onrender.com/`
- **Health Check**: `https://wildlife-backend-vdvt.onrender.com/api/health`

### Render Service Specifications
- **Backend Web Service (`wildlife-backend`)**:
  - Runtime: Python 3.11
  - Root Directory: `backend`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
  - Health Check: `/api/health`
  - Environment Variables:
    - `DATABASE_URL`: `<Render PostgreSQL connection string>`
    - `SECRET_KEY`: `<secure secret minimum 32 characters>`
    - `CORS_ORIGINS`: `https://wildlife-frontend-kjbn.onrender.com,http://localhost:5173`
- **Frontend Static Site (`wildlife-frontend`)**:
  - Runtime: Static
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
  - Rewrite Rules: `/*` -> `/index.html` (Rewrite)
  - Environment Variables:
    - `VITE_API_URL`: `https://wildlife-backend-vdvt.onrender.com`

---

## Docker Production Deployment

Production Docker configurations are containerized:

```bash
# Build and start all production containers
docker compose -f docker-compose.prod.yml up -d --build

# Verify container status
docker compose -f docker-compose.prod.yml ps

# Check backend health endpoint
curl -f http://localhost:8000/api/health
```

---

## Automated Test Suite

Comprehensive automated unit and pipeline integration tests covering AI inference, bioacoustic extraction, database ORM, timezone conversion, and report export endpoints.

```bash
# Run pytest test suite from project root
python -m pytest -v

# Or run from backend directory
cd backend
python -m pytest tests/ -v
```

### Test Verification Status
- **Backend Test Suite**: **27 passed / 0 failed / 0 skipped**
- **System Integration Test Suite**: **2 passed / 0 failed / 0 skipped**
- **Total Tests**: **29 passed**
- **Local End-to-End Workflow Verification**: **17/17 operational workflow modules verified**

---

## Security & Compliance Notice

This repository strictly adheres to open-source security best practices:
- Zero committed passwords, API tokens, JWT secrets, `.pem` private keys, or cloud credentials.
- All configuration parameters consume environment variables with safe placeholder defaults via `.env.example`.
- Sensitive local files (`.env`, local database binaries `wildlife.db`, model weights `*.pt`, and uploaded media files) are excluded via `.gitignore`.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
