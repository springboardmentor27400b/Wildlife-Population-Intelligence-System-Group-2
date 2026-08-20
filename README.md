# Wildlife Population & Ecosystem Intelligence System

A commercial-grade, multi-modal **AI Wildlife Population & Ecosystem Intelligence Platform** designed for real-time biodiversity monitoring, computer vision species detection, bioacoustic signal analysis, population analytics, habitat quality modeling, GIS spatial mapping, and predictive conservation management.

---

## Executive Overview

The **Wildlife Population Intelligence System** provides an end-to-end intelligence pipeline that transforms unstructured field data (camera trap imagery, bioacoustic audio recordings, and spatial telemetry) into actionable biodiversity analytics. Built with high-performance computer vision, bioacoustic signal processing, and deterministic ecological algorithms, the platform equips wildlife researchers, conservationists, and decision-makers with automated monitoring tools.

---

## Project Objectives

1. **Automated Multimodal Species Identification**: Real-time detection and classification of wildlife using 2-stage vision models (YOLOv8 + ResNet-50) and audio spectral analysis (Librosa MFCCs).
2. **Deterministic Ecological Analytics**: Automated calculation of mathematical ecological indicators, including Shannon's Diversity Index ($H'$), Pielou's Evenness ($J'$), species richness, and habitat suitability scores.
3. **Population & Habitat Intelligence**: Per-species estimated population density ($/km^2$), growth velocity, sex/age ratio modeling, and migration corridor risk assessment.
4. **Proactive Conservation Action**: Automated rule-based recommendation engine prioritizing intervention urgency (Critical, High, Medium, Low).
5. **Interactive GIS & Executive Dashboards**: Leaflet spatial mapping, 12 Recharts visualizers, dynamic hardware telemetry, and publication-ready multi-format exporting (PDF, CSV, Excel, JSON).

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
- **Database ORM**: SQLAlchemy (Dual driver support: SQLite dev & PostgreSQL `psycopg2-binary` prod connection pooling)
- **PDF Engine**: ReportLab
- **Hardware Telemetry**: `psutil`
- **Authentication**: JWT tokens (`python-jose`) with bcrypt password hashing (`passlib`)

### AI & Signal Processing
- **Computer Vision**: Ultralytics YOLOv8 (stage 1 detection) + TorchVision ResNet-50 (stage 2 classification)
- **Bioacoustics**: Librosa (Mel-frequency cepstral coefficients & spectral centroid analysis)
- **Computer Vision Utilities**: OpenCV & Pillow

### Deployment & Orchestration
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`, `docker-compose.prod.yml`)
- **Web Server Proxy**: Nginx (Alpine) with SPA routing fallback

---

## System Architecture

```mermaid
graph TD
    User([Field Researcher / Admin]) -->|HTTPS / Port 80| Frontend[React 18 + Nginx Container]
    Frontend -->|REST API Requests| Backend[FastAPI Backend Container]
    
    subgraph AI & Analytics Engines
        Backend --> YOLO[YOLOv8 + ResNet-50 Computer Vision Engine]
        Backend --> Audio[Librosa Bioacoustic Signal Processor]
        Backend --> Eco[Shannon Index & Ecosystem Health Calculator]
        Backend --> Pop[Population Density & Trend Engine]
        Backend --> Rec[Conservation Recommendation Engine]
    end
    
    subgraph Data & Telemetry Layer
        Backend --> ORM[SQLAlchemy ORM]
        ORM --> SQLite[SQLite Development DB]
        ORM --> Postgres[Amazon RDS / Docker PostgreSQL]
        Backend --> Telemetry[psutil Hardware Telemetry]
    end
```

---

## System Sitemap & Module Matrix

| Module | Route | Description |
| :--- | :--- | :--- |
| **Main Dashboard** | `/` | Field monitoring sites summary & real-time sampling stats |
| **Executive Dashboard** | `/executive-dashboard` | 8 summary KPI cards & 12 interactive analytics graphs |
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

---

## Installation & Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Docker & Docker Compose (Optional for containerized setup)

### 1. Backend Setup
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
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The application will be accessible at `http://localhost:5173`.

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
# DATABASE_URL=postgresql://wildlifeadmin:secret@localhost:5432/wildlife_prod

# SECURITY (Placeholders for local dev)
SECRET_KEY=dev_jwt_secret_key_wildlife_2026_change_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## Docker Production Deployment

To launch the multi-container production stack (React Frontend + FastAPI Backend + PostgreSQL Database):

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

The repository includes comprehensive automated unit and pipeline integration tests covering AI inference, bioacoustic extraction, database ORM, and report export endpoints.

```bash
# Run pytest test suite from backend directory
cd backend
python -m pytest tests/ -v
```

### Test Verification Status
- **Total Automated Tests**: **20 passed / 0 failed / 0 skipped**
- **Execution Time**: ~19.34 seconds
- **End-to-End Workflow Verification**: **17/17 operational workflow modules verified**

---

## Security & Compliance Notice

This repository strictly adheres to open-source security best practices:
- Zero committed passwords, API tokens, JWT secrets, `.pem` private keys, or cloud credentials.
- All configuration parameters consume environment variables with safe placeholder defaults via `.env.example`.
- Sensitive local files (`.env`, local database binaries `wildlife.db`, model weights `*.pt`, and uploaded media files) are excluded via `.gitignore`.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
