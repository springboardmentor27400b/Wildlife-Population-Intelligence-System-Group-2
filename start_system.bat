@echo off
echo Starting Wildlife Population Intelligence System...

echo Starting FastAPI Backend on port 8000...
start /B "Wildlife Backend" "D:\python download version\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000

timeout /t 3 /nobreak > NUL

echo Starting React Frontend on port 5173...
cd frontend
start /B "Wildlife Frontend" npm run dev -- --host 0.0.0.0 --port 5173

echo.
echo ===================================================
echo Wildlife Population Intelligence System Started!
echo Local URL:   http://localhost:5173
echo Network URL: http://192.168.1.12:5173
echo Backend API: http://localhost:8000/api/health
echo API Docs:    http://localhost:8000/docs
echo ===================================================
