<div align="center">
  <img src="https://raw.githubusercontent.com/HarshithaSaravanan10/Wildlife-Population-Intelligence-System/main/frontend/public/vite.svg" alt="Project Logo" width="120" />
  <h1>🐾 Wildlife Population Intelligence System (WPIS)</h1>
  <p><em>AI-powered Wildlife Population Intelligence System for species recognition, bioacoustic analysis, biodiversity analytics, monitoring reports, and conservation insights.</em></p>
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)](https://www.tensorflow.org/)
  [![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/)
  [![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## 📋 Project Overview
The **Wildlife Population Intelligence System (WPIS)** is a production-ready, monorepo-structured platform engineered to assist researchers, rangers, and conservation officers. WPIS enables real-time device tracking, automated species recognition from camera traps, bioacoustic sensor monitoring, map visualizations, advanced reporting, and strict role-based audit logging.

## ✨ Project Highlights
- **Unified AI Pipeline**: Fully integrated image and audio predictions tied automatically to MongoDB.
- **Enterprise-Grade Security**: JWT authentication and role-based access control protecting sensitive endpoints.
- **Dynamic Analytics Dashboard**: Automated biodiversity calculations and real-time statistics updating.
- **Export & Reporting Engine**: Generates comprehensive PDF and Excel reports with live filters.

## 🚀 Complete Feature List
- **JWT Authentication & RBAC**: Advanced Role-Based Access Control protecting routes across roles (Administrator, Wildlife Researcher, Conservation Officer, Forest Department Officer).
- **Interactive Wildlife Map**: Spatial mapping of monitoring sites and device coordinates using mapping libraries.
- **AI Species Recognition**: Multi-label classifier interface for automatic species detection from field camera trap uploads.
- **Bioacoustic Analysis**: Real-time sound analysis utilizing deep learning to identify species calls.
- **Sensor Devices Management**: Full tracking of field equipment (Camera Traps, Acoustic Sensors, GPS Collars, Weather Stations) with active battery and network monitoring.
- **Monitoring Sites Control**: Manage core and buffer conservation zones, area sizes, and habitat types.
- **Reports & Data Export**:
  - **Excel**: Multi-tab workbook containing auto-filters, frozen headers, autosized columns, and a separate summary statistics sheet.
  - **PDF**: Landscape orientation reports complete with header banners, active filters details, tabular records, and running page numbers in footers.
- **System Audit Logging**: Comprehensive, admin-only audit trail tracking logins, updates, AI predictions, and device states.
- **Notifications Hub**: System alerts and priority-based notifications (Critical, Warning, Success, Info) reflecting hardware failures and research approvals.

## 🏗️ System Architecture & Tech Stack
**Frontend:**
- ⚛️ **React & Vite**: Fast development environment and component-based UI.
- 🎨 **Tailwind CSS**: Utility-first CSS framework for rapid and modern design.

**Backend:**
- ⚡ **FastAPI (Python)**: High-performance asynchronous API web framework.
- 🍃 **MongoDB & Beanie (Motor)**: NoSQL database with asynchronous ODM modeling.
- 🧠 **TensorFlow / Keras**: Deep learning models for image and audio recognition.

## 📁 Folder Structure

\\\	ext
WPIS/
├── backend/                  # FastAPI Backend Code
│   ├── app/
│   │   ├── api/              # Route controllers
│   │   ├── core/             # Configuration & security middleware
│   │   ├── database/         # Beanie ODM & Motor MongoDB connection
│   │   ├── models/           # Beanie Document ODM schemas
│   │   ├── schemas/          # Pydantic validation models
│   │   └── main.py           # FastAPI Application entrypoint
│   ├── requirements.txt      # Python dependencies
│   ├── run_migration.py      # Database setup & data seed
│   └── .env.example          # Backend env configuration template
│
├── frontend/                 # Vite + React Frontend Code
│   ├── src/
│   │   ├── assets/           # Static asset styles & icons
│   │   ├── components/       # Custom reusable components
│   │   ├── config/           # Route permissions
│   │   ├── pages/            # Core views (Dashboard, AuditLogs, etc.)
│   │   ├── services/         # Axios API clients
│   │   └── App.jsx           # App layout & routing structure
│   ├── package.json          # Node dependencies
│   └── .env.example          # Frontend env configuration template
│
└── docker-compose.yml        # Orchestration configuration
\\\

---

## ⚙️ Environment Variables

### Backend Configuration (\ackend/.env\)
Copy \ackend/.env.example\ to \ackend/.env\ and adjust the variables:
- \MONGO_URI\: The MongoDB connection string.
- \JWT_SECRET\: Random hash key used to sign authorization tokens.
- \JWT_ALGORITHM\: Signature method (default: \HS256\).
- \ACCESS_TOKEN_EXPIRE_MINUTES\: JWT token lifespan.

### Frontend Configuration (\rontend/.env\)
Copy \rontend/.env.example\ to \rontend/.env\:
- \VITE_API_URL\: Root path to the running FastAPI server.
- \VITE_GOOGLE_CLIENT_ID\: OAuth client id (Optional).

---

## 🚀 Installation & Running Locally

### 1. Database Requirement
Ensure MongoDB is running locally on port \27017\ or supply a remote string via \MONGO_URI\.

### 2. Backend Setup
From the \ackend/\ directory:
\\\ash
python -m venv venv
# Windows: venv\Scripts\activate  |  macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python run_migration.py
uvicorn app.main:app --reload --port 8000
\\\
- **API Server**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs

### 3. Frontend Setup
From the \rontend/\ directory:
\\\ash
npm install
npm run dev
\\\
- **Web App**: http://localhost:5173

---

## 🐳 Docker Deployment Guide
For instant setup:
\\\ash
docker-compose up -d --build
\\\

## 📚 Module Overview
- **Milestone 1 Completed**: Core RBAC, device management, site tracking, and audit logging successfully integrated.
- **Milestone 2 Completed**: Complete AI intelligence hub built! Unified predictions, bioacoustics, computer vision, automated reporting, and advanced analytics caching integrated perfectly.

## 🔭 Future Scope
- Drone image integration and aerial tracking.
- IoT live streaming from field edge-devices.
- Advanced predictive modeling for species migration patterns.

## 🤝 Contributors
- **Harshitha Saravanan** - *Initial Work / Lead Engineer*

## 📜 License
This project is licensed under the MIT License.

## 🙏 Acknowledgements
- [TensorFlow](https://www.tensorflow.org/) for making AI accessible.
- The open-source community for amazing libraries (FastAPI, React, Tailwind).
- All wildlife researchers working actively toward global conservation!