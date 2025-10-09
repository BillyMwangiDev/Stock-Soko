@echo off
cd /d %~dp0
call venv\Scripts\activate
cd backend
echo Starting Stock Soko Backend Server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
