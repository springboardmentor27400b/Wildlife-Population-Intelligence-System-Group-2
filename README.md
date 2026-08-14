# Wildlife Population Intelligence System

The Wildlife Population Intelligence System is an enterprise-grade full-stack application designed for wildlife researchers, conservation officers, forest departments, and administrators to manage wildlife monitoring operations.

This implementation covers **Milestone 1**: User Authentication, Role Based Access Control (RBAC), and CRUD operations for surveys, monitoring sites, camera traps, audio sensors, observations, and cloud storage media uploads.

## Tech Stack
- **Backend:** Python + FastAPI + SQLAlchemy 2.0 + Alembic + Pydantic V2 + PostgreSQL + JWT + Cloudinary SDK
- **Frontend:** React + Vite + Javascript + Tailwind CSS + Axios + React Router + React Hook Form + Context API

## Project Setup & Running

### Prerequisites
- PostgreSQL running locally (default: port 5432, user: `postgres`, password: `postgres`, db: `wildlife_db`)
- Cloudinary account credentials (optional, falls back to local storage if not provided)

### Backend Setup
1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file (copy from `.env.example` in the root or backend folder).
5. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the API server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Move to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file (copy from `.env.example`).
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
