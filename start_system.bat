@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Starting Wildlife Population Intelligence System
echo ===================================================

:: 1. Check Python executable
set PYTHON_CMD=python
if exist "%~dp0backend\venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0backend\venv\Scripts\python.exe"
) else if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0venv\Scripts\python.exe"
)

:: Test Python availability
%PYTHON_CMD% --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not found in PATH or venv.
    echo Please install Python 3.10+ or configure your virtual environment.
    pause
    exit /b 1
)

:: 2. Check Node.js / NPM availability
call npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not found in PATH.
    echo Please install Node.js (v18+) to run the frontend.
    pause
    exit /b 1
)

:: 3. Check required directories
if not exist "%~dp0backend" (
    echo [ERROR] Directory 'backend' not found. Please run this script from the project root.
    pause
    exit /b 1
)
if not exist "%~dp0frontend" (
    echo [ERROR] Directory 'frontend' not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo [OK] Environment verified.
echo.

:: 4. Start FastAPI Backend
echo [1/2] Launching FastAPI Backend on http://localhost:8000...
start "Wildlife Backend API" cmd /k "cd /d %~dp0backend && "%PYTHON_CMD%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: 5. Start React Frontend
echo [2/2] Launching React Frontend on http://localhost:5173...
start "Wildlife React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo ===================================================
echo Wildlife Population Intelligence System Running!
echo.
echo Frontend UI:     http://localhost:5173
echo Backend API:     http://localhost:8000/api/health
echo API Interactive: http://localhost:8000/docs
echo ===================================================
echo Keep the terminal windows open while using the application.
echo.
