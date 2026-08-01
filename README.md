# Wildlife Population & Ecosystem Intelligence System

A commercial-grade, multi-modal **AI Wildlife Population & Ecosystem Intelligence Platform** designed for real-time biodiversity monitoring, computer vision species detection, bioacoustic signal analysis, population analytics, habitat quality modeling, GIS spatial mapping, and predictive conservation management.

---

## Key Platform Features

- 🟢 **Executive Analytics Dashboard**: Real-time KPI summary cards and 12 responsive Recharts visualizing species distributions, confidence trends, and population growth velocity.
- 🗺️ **Interactive GIS Spatial Map**: Leaflet-powered GIS mapping plotting sites, sightings, habitat quality boundaries, and hotspots with risk color indicators and popups.
- 🤖 **Multi-Modal AI Engine**:
  - **YOLOv8 & ResNet-50**: Two-stage object detection and fine-grained species classification for camera trap imagery.
  - **Bioacoustic Signal Processing**: Librosa MFCC & spectral feature extraction for animal call identification.
- 📊 **Intelligence Analytics Engines**:
  - Population Intelligence Engine (Species density & growth estimation)
  - Habitat Quality & Suitability Index
  - Automated Conservation Recommendation Engine
  - Shannon Diversity & Ecosystem Health Analytics
- 🔮 **AI Predictive Forecasting**: 6-month and 1-year population trend projections and environmental threat probability modeling.
- 📄 **Multi-Format Exporting**: Native export support for PDF, CSV, Excel, and JSON reports.
- ⚡ **Platform Diagnostics**: Live SQLite database metrics, API latency tracking, and hardware resource utilization.

---

## System Sitemap & Navigation

| Module | Route | Description |
| :--- | :--- | :--- |
| **Main Dashboard** | `/` | Live conservation overview & field sampling stats |
| **Executive Dashboard** | `/executive-dashboard` | 12 KPI cards & 12 interactive analytics charts |
| **GIS Map** | `/gis` | Interactive Leaflet spatial map with multi-filtering |
| **AI Predictions** | `/predictions` | 6m & 1yr population forecasts & recommendation cards |
| **System Health** | `/system-health` | Live database, API latency, CPU & RAM diagnostics |
| **Species Recognition** | `/species` | YOLOv8 image upload & bounding box detection |
| **Audio Recognition** | `/audio` | Waveform & spectrogram bioacoustic call analysis |
| **Biodiversity Analytics**| `/biodiversity` | Multi-month detection velocity & confidence trends |
| **Population Intelligence**| `/population` | Species population counts, density & sex/age ratio |
| **Habitat Intelligence** | `/habitat` | Habitat suitability scores, risk levels & corridors |
| **Conservation** | `/conservation` | Actionable recommendations & priority filter |
| **Ecosystem Health** | `/ecosystem` | Shannon Diversity Index ($H'$) & grade radar charts |
| **Reports** | `/reports` | Multi-format PDF, CSV, Excel & JSON report exporter |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Leaflet, Lucide React
- **Backend**: Python 3.11/3.13, FastAPI, SQLAlchemy ORM, ReportLab, Librosa, OpenCV, PyTorch/Ultralytics YOLOv8
- **Database**: SQLite (100% offline, zero cloud reliance)
- **Deployment**: Docker & Docker Compose
