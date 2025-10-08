# Stock Soko

Intelligent stock trading platform for Kenyan retail investors (MVP: NSE only).

Wireframes: [Stitch project](https://stitch.withgoogle.com/projects/2721751293655150395)

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
Docs: `http://localhost:8000/docs`

## Lint & Test
```bash
flake8
pytest -q
pip-audit
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

## Notes
- MVP: NSE only, English UI.
- Orders: market orders only; broker integration later.
- AI: rules + SMA crossover now; predictive models later.
- Payments: Daraja sandbox STK flow; production requires onboarding at `https://developer.safaricom.co.ke`.
