# Stock Soko

Intelligent stock trading platform for Kenyan retail investors.

## Setup (Python 3.11)

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Run Backend

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

API Documentation: http://localhost:8000/docs

## Lint and Test

```bash
flake8
pytest -q
```

## Git Workflow

```bash
git init
git checkout -b main
git checkout -b feature/mvp-backend
git add -A
git commit -m "feat(backend): scaffold FastAPI with mock markets and AI"
```

## Docker

```bash
docker compose up --build
```

## Project Notes

- MVP: NSE only, English UI
- Orders: market orders only; broker integration later
- AI: rules + SMA crossover now; predictive models later
- Payments: Daraja sandbox STK flow; production requires onboarding at https://developer.safaricom.co.ke
