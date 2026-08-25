@echo off
title ADLTrack Startup
color 0A
echo.
echo  =========================================
echo   ADLTrack Care OS -- Starting up...
echo  =========================================
echo.

:: Kill any existing processes on ports 8001 and 3000
echo  [1/3] Clearing old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001" 2^>nul') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" 2^>nul') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start backend
echo  [2/3] Starting backend (FastAPI)...
start "ADLTrack Backend" cmd /k "cd /d "%~dp0backend" && C:\Users\Property\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn server:app --reload --port 8001"

:: Wait for backend to be ready
echo         Waiting for backend...
timeout /t 8 /nobreak >nul

:: Start frontend
echo  [3/3] Starting frontend (React)...
start "ADLTrack Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

:: Wait for frontend to compile then open browser
echo.
echo  Both servers are starting.
echo  Browser will open in ~15 seconds...
echo.
timeout /t 15 /nobreak >nul
start "" "http://localhost:3000"

echo  ADLTrack is running!
echo  - Backend:  http://localhost:8001
echo  - Frontend: http://localhost:3000
echo.
echo  Close the Backend and Frontend windows to shut down.
pause
