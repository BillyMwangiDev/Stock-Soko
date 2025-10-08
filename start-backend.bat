@echo off
echo ========================================
echo Starting Stock Soko Backend Server
echo Port: 5000
echo ========================================
echo.

cd /d "%~dp0"
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 5000

pause

