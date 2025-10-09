@echo off
echo Starting Stock Soko Backend Server...
cd backend
call .venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
