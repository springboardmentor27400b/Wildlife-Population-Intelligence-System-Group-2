# Installation & Setup Guide

## Local Prerequisites
- Node.js v18.0 or higher
- Python 3.10+
- Git

## Step-by-Step Local Setup

1. **Clone the Repository**:
```bash
git clone https://github.com/wildlife-intelligence/system.git
cd Wildlife-Population-Intelligence-System
```

2. **Backend Setup**:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

3. **Frontend Setup**:
```bash
cd ../frontend
npm install
npm run dev
```

4. Open browser at `http://localhost:5173`.
