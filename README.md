🦁 Wildlife Population Intelligence System (WPIS)
🌍 Project Overview

Wildlife Population Intelligence System (WPIS) is an AI-enabled
platform designed to support wildlife researchers, conservation
officers, forest departments, and administrators in monitoring wildlife
and making data-driven conservation decisions.

WPIS brings together wildlife observation management, AI image
detection, audio intelligence, bird intelligence, population analytics,
biodiversity analysis, GIS mapping, habitat intelligence, alerts,
reports, and role-based dashboards in one integrated platform.

Instead of treating wildlife observations as isolated records, WPIS
transforms them into a connected intelligence workflow:

Observe → Detect → Analyze → Store → Visualize → Interpret → Act

✨ Why WPIS?

Traditional wildlife monitoring can involve scattered observations,
manual analysis, disconnected datasets, and delayed decision-making.

WPIS provides a unified intelligence layer that helps answer questions
such as:

🐾 What species are being observed?

📊 How are populations changing?

🗺️ Where are wildlife observations concentrated?

🐦 Which bird species are being detected?

🔊 What can wildlife audio tell us?

🌿 Which habitats require attention?

🚨 Are there population or conservation alerts?

🎯 Which species or locations should receive conservation priority?

🚀 Core Capabilities

Capability                          What WPIS Provides

🐾 Wildlife Monitoring              Create, view, update, search and
analyze wildlife observations

🤖 AI Image Intelligence            Detect animals and estimate
detected animal counts from images

🔊 Audio Intelligence               Wildlife sound analysis and
audio-based intelligence

🐦 Bird Intelligence                Bird identification and audio-based
bird intelligence

📊 Population Intelligence          Population overview, trends,
rankings and biodiversity metrics

🗺️ GIS Intelligence                 Map wildlife observation and
monitoring locations

🌿 Habitat Intelligence             Habitat-related monitoring and
conservation analysis

🚨 Alerts                           Population, wildlife and
conservation alerts

📑 Reports                          Present wildlife and intelligence
information for decision support

👥 RBAC                             Role-specific access for
researchers, officers and
administrators

🧠 AI & Intelligence Pipeline

flowchart LR
    A[Wildlife Observation] --> B{Input Type}

    B --> C[Image]
    B --> D[Audio]
    B --> E[Location / Monitoring Data]

    C --> F[AI Image Detection]
    D --> G[Audio Intelligence]
    E --> H[GIS & Monitoring Analysis]

    F --> I[Wildlife Intelligence]
    G --> I
    H --> I

    I --> J[Population Analytics]
    I --> K[Biodiversity Analysis]
    I --> L[Conservation Intelligence]

    J --> M[Dashboards]
    K --> M
    L --> N[Alerts & Decisions]

🏗️ System Architecture

flowchart TB
    U[👤 WPIS Users]

    U --> FE[🌐 Frontend<br/>HTML • CSS • JavaScript]

    FE --> API[⚡ FastAPI REST API]

    API --> AUTH[🔐 Authentication & RBAC]
    API --> W[🐾 Wildlife APIs]
    API --> P[📊 Population APIs]
    API --> A[🔊 Audio APIs]
    API --> I[🖼️ Image APIs]
    API --> H[🌿 Habitat APIs]
    API --> C[🛡️ Conservation APIs]
    API --> D[📈 Dashboard APIs]
    API --> AL[🚨 Alert APIs]

    W --> DB1[(PostgreSQL / PostGIS)]
    P --> DB1
    H --> DB1
    C --> DB1

    W --> DB2[(MongoDB)]
    A --> DB2
    I --> DB2

    I --> ML[🤖 AI / ML Models]
    A --> ML

    DB1 --> INT[🧠 Intelligence Layer]
    DB2 --> INT
    ML --> INT

    INT --> FE

🧩 Major Modules

1. 🐾 Wildlife Monitoring

The Wildlife module provides the core observation management
functionality.

Features:

Wildlife observation records

Species information

Health status

Conservation status

Location information

Search and filtering

Record management

AI-assisted wildlife analysis

2. 🤖 AI Wildlife Detection

WPIS integrates AI-based image analysis into wildlife monitoring.

Upload Image
     ↓
Image Preprocessing
     ↓
AI Detection
     ↓
Species / Animal Detection
     ↓
Animal Count
     ↓
Wildlife Intelligence

The result can be connected to wildlife records and displayed through
the intelligence dashboards.

3. 🔊 YAMNet Audio Intelligence

The platform includes an audio intelligence workflow for analyzing
wildlife-related sounds.

Audio analysis can be used to provide additional intelligence alongside
visual wildlife observations.

4. 🐦 BirdNET Bird Intelligence

WPIS includes bird intelligence capabilities based on audio analysis,
allowing bird observations to complement image-based wildlife
monitoring.

5. 📊 Population Intelligence

The Population Intelligence module is designed to transform wildlife
observations into population-level insights.

Indicators

Total Population

Species Richness

Biodiversity Index

Monitoring Locations

Analytics

Population Overview

Population by Species

Species Ranking

Population Alerts

Migration Analysis

Species Distribution

Conservation Priority Intelligence

6. 🗺️ GIS Intelligence

GIS functionality allows wildlife observations and monitoring locations
to be interpreted geographically.

This supports:

Observation mapping

Monitoring-site visualization

Location-based analysis

Spatial conservation intelligence

7. 🌿 Habitat Intelligence

Habitat-related information can be integrated with wildlife and
conservation analysis to provide a broader ecological perspective.

8. 🚨 Alerts & Notifications

The system provides an alert layer for surfacing important wildlife and
conservation information.

Examples include:

Population alerts

Conservation alerts

Wildlife-related notifications

👥 Role-Based Dashboards

WPIS is designed around role-specific workflows.

Role                                Primary Focus

🔬 Wildlife Researcher              Research, wildlife observations,
population and species intelligence

🛡️ Conservation Officer             Conservation priorities, alerts,
habitat and population intelligence

🌲 Forest Department Officer        Monitoring, GIS, wildlife activity
and operational intelligence

Dashboard Experience

The project includes role-oriented dashboard pages such as:

System Dashboard

Researcher Dashboard

Conservation Officer Dashboard

Forest Department Dashboard

Administrator Dashboard

Population Intelligence Dashboard

🖥️ Dashboard Showcase

📸 Add your actual dashboard screenshots to docs/screenshots/ using
the filenames below.
The README is intentionally structured so the screenshots can be added
without redesigning the documentation.

🌐 System Overview



🔬 Researcher Dashboard



📊 Population Intelligence



🐾 Wildlife Monitoring



🗺️ GIS Wildlife Map



🤖 AI Intelligence



🚨 Alerts & Notifications



🛠️ Technology Stack

Frontend

HTML5

CSS3

JavaScript

Chart.js

Font Awesome

GIS / map visualization

Backend

Python

FastAPI

Pydantic

Tortoise ORM

Beanie

Uvicorn

JWT Authentication

OAuth2

Role-Based Access Control

Databases

PostgreSQL

PostGIS

MongoDB

AI / ML

YOLO

OpenCV

MediaPipe

YAMNet

BirdNET

Python AI/ML ecosystem

DevOps

Git

GitHub

Docker

Docker Compose

📁 Project Structure

Wildlife-Population-Intelligence-System-Group-2/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   ├── api/
│   │   │   ├── alerts.py
│   │   │   ├── audio.py
│   │   │   ├── conservation.py
│   │   │   ├── dashboard.py
│   │   │   ├── habitat.py
│   │   │   ├── health.py
│   │   │   ├── image.py
│   │   │   ├── monitoring.py
│   │   │   ├── population.py
│   │   │   ├── population_site.py
│   │   │   └── wildlife.py
│   │   ├── core/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── js/
│   │   ├── admin-dashboard.js
│   │   ├── alerts.js
│   │   ├── audio.js
│   │   ├── conservation.js
│   │   ├── dashboard.js
│   │   ├── forest-dashboard.js
│   │   ├── gis.js
│   │   ├── habitat.js
│   │   ├── health.js
│   │   ├── monitoring.js
│   │   ├── population.js
│   │   ├── researcher-dashboard.js
│   │   ├── role-guard.js
│   │   └── wildlife.js
│   │
│   ├── index.html
│   ├── login.html
│   ├── monitoring.html
│   ├── population.html
│   ├── reports.html
│   ├── researcher-dashboard.html
│   └── wildlife.html
│
├── docker-compose.yml
├── .gitignore
└── README.md

🔐 Security

WPIS uses several security mechanisms:

🔑 JWT authentication

🔒 Password hashing

🛡️ Role-Based Access Control

🔐 Protected API endpoints

⚙️ Environment-based configuration

Environment Variables

Sensitive values should be stored in .env or deployment-platform
environment variables.

Example:

POSTGRES_DSN=<your-postgresql-connection>
MONGO_URI=<your-mongodb-connection>
MONGO_DB_NAME=<your-database-name>
JWT_SECRET_KEY=<your-secret-key>
ACCESS_TOKEN_EXPIRE_MINUTES=30

⚠️ Never commit .env or database credentials to GitHub.

🚀 Getting Started

Prerequisites

Make sure you have:

Python 3.12+

Git

Docker Desktop (optional)

PostgreSQL/PostGIS

MongoDB

A modern web browser

1. Clone the Repository

git clone https://github.com/springboardmentor27400b/Wildlife-Population-Intelligence-System-Group-2.git
cd Wildlife-Population-Intelligence-System-Group-2

2. Checkout the Development Branch

git checkout Disha-chapte

3. Backend Setup

cd backend
python -m venv venv

Windows

venv\Scripts\Activate.ps1

Install Dependencies

pip install -r requirements.txt

4. Configure Environment

Create:

backend/.env

and add the required database and authentication variables.

5. Start FastAPI

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

6. Start the Frontend

Serve the frontend directory using a local development server such as
VS Code Live Server.

Example:

http://127.0.0.1:5500

🐳 Docker Deployment

The project includes Docker configuration.

Start services:

docker compose up -d

Stop services:

docker compose down

Check running containers:

docker ps

🔌 API Overview

WPIS provides REST APIs for major platform modules.

/auth
/wildlife
/monitoring
/population
/population-site
/audio
/image
/habitat
/conservation
/dashboard
/alerts
/health

FastAPI's interactive documentation is available through:

/docs

📈 Population Intelligence Flow

flowchart LR
    A[Wildlife Observations] --> B[Population Data]
    B --> C[Species Aggregation]
    C --> D[Population Analytics]

    D --> E[Population Trends]
    D --> F[Species Ranking]
    D --> G[Biodiversity Index]
    D --> H[Species Distribution]
    D --> I[Migration Analysis]

    E --> J[Population Intelligence Dashboard]
    F --> J
    G --> J
    H --> J
    I --> J

    J --> K[Conservation Priorities]
    J --> L[Alerts]

🧪 Example Intelligence Workflow

Input

Wildlife Image
       +
Observation Location
       +
Species Information

Processing

AI Detection
      ↓
Species Identification
      ↓
Observation Storage
      ↓
Population Aggregation
      ↓
Biodiversity Analysis
      ↓
GIS Visualization

Output

┌─────────────────────────────────────┐
│        WILDLIFE INTELLIGENCE        │
├─────────────────────────────────────┤
│ Species        → Detected           │
│ Population     → Estimated          │
│ Location       → Mapped             │
│ Biodiversity   → Calculated         │
│ Migration      → Analyzed           │
│ Priority       → Identified         │
│ Alerts         → Generated          │
└─────────────────────────────────────┘

🎬 Demo

🌐 Live Demo

Live Website: COMING SOON

Once deployment is complete, replace the line above with the public
HTTPS URL.

Example:

https://your-wpis-app.onrender.com

🔗 Project Repository

Wildlife Population Intelligence System --- Group
2

📚 API Documentation

Once the backend is deployed:

https://YOUR-BACKEND-URL/docs

📸 Screenshots

Recommended screenshots for the final project presentation:

Screenshot                      Recommended Content

system-overview.png           Main system dashboard
researcher-dashboard.png      Researcher-specific dashboard
population-intelligence.png   Population analytics
wildlife-monitoring.png       Wildlife records
gis-map.png                   Wildlife observation map
ai-intelligence.png           AI detection results
alerts.png                    Alerts and notifications

🎯 Project Goals

WPIS aims to bridge the gap between wildlife data collection and
conservation decision-making.

The system focuses on:

                RAW WILDLIFE DATA
                       │
                       ▼
              ┌─────────────────┐
              │ AI / ML ANALYSIS│
              └────────┬────────┘
                       ▼
             ┌───────────────────┐
             │ WILDLIFE          │
             │ INTELLIGENCE      │
             └─────────┬─────────┘
                       ▼
             ┌───────────────────┐
             │ POPULATION &      │
             │ BIODIVERSITY      │
             └─────────┬─────────┘
                       ▼
             ┌───────────────────┐
             │ CONSERVATION      │
             │ DECISION SUPPORT  │
             └───────────────────┘

🔮 Future Enhancements

Potential future extensions include:

📷 Real-time camera trap integration

📡 IoT wildlife sensors

🛰️ Satellite imagery analysis

📍 GPS collar integration

📈 Advanced population forecasting

🧭 Wildlife movement prediction

🚨 Real-time anomaly detection

🌿 Habitat suitability prediction

📱 Mobile application

☁️ Large-scale cloud deployment

🧠 Advanced multimodal wildlife intelligence

👨‍💻 Development

The project follows a modular architecture so that new AI models,
dashboards, APIs, and intelligence modules can be integrated
independently.

Contributions and improvements can focus on:

AI model accuracy

Wildlife datasets

Population forecasting

GIS analytics

Conservation intelligence

UI/UX improvements

Cloud deployment

📄 License

This project is developed for educational, research, and conservation
technology purposes.
