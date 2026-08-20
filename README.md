# Wildlife Population Intelligence System (WPIS)

## 1. Project Overview
The Wildlife Population Intelligence System (WPIS) is a comprehensive, full-stack application designed to aggregate, analyze, and visualize ecological data. By combining machine learning (audio classification) with robust data visualization and geographic mapping, WPIS provides ecologists and conservationists with actionable insights into wildlife populations, ecosystem health, and habitat conditions.

## 2. Problem Statement
Monitoring wildlife populations manually is labor-intensive, error-prone, and slow. Existing solutions often lack integrated dashboards that combine raw field observations with AI-assisted species identification and automated conservation recommendations. WPIS bridges this gap by offering a centralized platform that processes observations and bioacoustics, translating them into real-time intelligence.

## 3. Project Objectives
- To automate species identification using bioacoustic AI models.
- To provide real-time dashboards for monitoring population estimates and ecosystem health.
- To generate actionable conservation recommendations based on predictive analytics.
- To establish a scalable, secure, and production-ready architecture.

## 4. Key Features
- **Role-based Access Control**: Secure login and route protection for administrators and field researchers.
- **AI Species Recognition**: Upload audio files for automated species identification via librosa/ML models.
- **Geospatial Mapping**: Interactive Leaflet maps displaying monitoring sites and observations.
- **Comprehensive Dashboards**: Executive analytics combining data from across the platform.
- **Dynamic Reporting**: Generate and export reports (PDF, CSV, Excel, JSON).
- **Live Validation**: Built-in system health and data integrity checks.

## 5. System Architecture
```text
User
 ↓
React Frontend (Vite, Tailwind)
 ↓
Protected Routes / Main Layout
 ↓
Frontend Services (Axios)
 ↓
FastAPI Backend (Python, Uvicorn)
 ↓
Business Logic / APIs (JWT Auth)
 ↓
MongoDB (Motor / Async)
 ↓
AI / Intelligence Modules (Librosa, Scikit-learn)
```

## 6. Technology Stack
**Frontend:**
- React (v19)
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- React-Leaflet
- React Hook Form
- Zod

**Backend:**
- Python (FastAPI)
- MongoDB (Motor/Async)
- PyJWT (Authentication)
- Librosa & Soundfile (Audio Processing)
- Pydantic
- Uvicorn

**Deployment:**
- Docker & Docker Compose
- Nginx (Frontend serving)

## 7. Milestone 3 – Intelligence Modules
### Population Intelligence
- **Purpose**: Estimates wildlife populations and analyzes temporal trends.
- **Inputs**: Aggregated observation data.
- **Outputs**: Population heatmaps and trend charts.

### Habitat Intelligence
- **Purpose**: Assesses the quality and risk factors of monitored habitats.
- **Inputs**: Environmental data linked to monitoring sites.
- **Outputs**: Habitat quality index and risk assessments.

### Conservation Recommendation Engine
- **Purpose**: Provides AI-supported interventions to mitigate ecological risks.
- **Inputs**: Ecosystem health and population decline metrics.
- **Outputs**: Actionable task lists and priority alerts.

### Ecosystem Health Analytics
- **Purpose**: Monitors the overall stability of the ecosystem.
- **Inputs**: Biodiversity indices and environmental stressors.
- **Outputs**: Unified health score and vulnerability indicators.

### Wildlife Intelligence Dashboard
- **Purpose**: A centralized overview of all field data.
- **Outputs**: High-level KPIs and interactive mapping.

## 8. Milestone 4 – Analytics, Testing & Deployment
### Executive Analytics Dashboard
- Provides a unified overview integrating metrics from Population, Habitat, and Ecosystem modules.

### Reports & Export System
- Dynamic report previews using live backend data.
- Supports PDF, CSV, JSON, and Excel exports based on backend availability.

### Testing & Validation
- **Status**: Implemented via live-polling of existing APIs. 
- Performs system health checks, module validation, and data integrity scans on real database records.

### Docker & Cloud Deployment
- **Status**: Docker configuration prepared (`Dockerfile`, `docker-compose.yml`, Nginx config). 
- *Note: Local Docker builds were not verified due to the Docker daemon being unavailable in the development environment.*

## 9. Installation & Setup

### Prerequisites
- Node.js (v20+)
- Python (v3.11+)
- MongoDB Atlas cluster (or local instance)

### Step 1 – Clone Project
```bash
git clone <repository-url>
cd wpis
```

### Step 2 – Configure Environment
Create `.env` files based on the provided examples.
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### Step 3 – Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Step 4 – Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Step 5 – Optional Docker Setup
```bash
docker-compose up -d --build
```
*Frontend accessible at http://localhost:80, Backend at http://localhost:8000.*

## 10. Environment Variables
**Do not commit actual secrets.**
- `MONGO_URI`: Connection string to MongoDB.
- `JWT_SECRET`: Secret key for signing authentication tokens.
- `VITE_API_URL`: Base URL for backend API requests.

## 11. Security Considerations
- **Authentication**: JWT-based stateless authentication.
- **Authorization**: Role-based access control protecting frontend routes and API endpoints.
- **CORS**: Configurable allowed origins via `BACKEND_CORS_ORIGINS`.
- **Environment**: Sensitive credentials (DB passwords, secrets) are isolated in ignored `.env` files.

## 12. Project Limitations
- **Deployment Verification**: Docker configuration is prepared, but local execution via `docker build` could not be verified due to environment constraints.
- **Historical Testing Data**: Because the backend does not implement automated CI/CD logging, the Testing & Validation module relies strictly on live-polling rather than historical test suites.
- **Cloud Deployment**: Cloud deployment to AWS/GCP was not performed as no cloud credentials were provided.

## 13. Future Enhancements
- **Cloud Deployment**: Deploying orchestrated containers to AWS ECS or Google Cloud Run.
- **Automated CI/CD Pipeline**: Github Actions for automated testing and deployment.
- **Advanced GIS Visualization**: Integration with Mapbox or advanced spatial databases (PostGIS).
- **Real-time Streaming Analytics**: Implementing WebSockets for live sensor data ingestion.
- **Mobile Application**: Developing a React Native app for field researchers.

## 14. Final Project Structure
```text
wpis/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## 15. Presentation Guide
**Demonstration Flow (3-5 mins):**
1. **Login**: Demonstrate secure access control.
2. **Executive Dashboard**: Highlight the unified KPIs and interactive charts.
3. **Intelligence Modules**: Briefly click through Population Intelligence, Habitat Intelligence, Conservation Recommendations, and Ecosystem Health.
4. **Reports & Exports**: Generate a report preview and demonstrate the export functionality.
5. **Testing & Validation**: Click "Run Validation" to show the live-polling of backend services and data integrity checks.
6. **Deployment Readiness**: Conclude by showing the Docker configuration and `docker-compose.yml` file, emphasizing production readiness.