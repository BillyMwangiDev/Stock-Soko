# ADR 0001: Architecture Overview

This ADR aligns with `tasks/0001-prd-stock-soko.md` and PROCESS-RULES.

- App: FastAPI + (PostgreSQL later) + Redis; Celery for async tasks.
- MVP scope: NSE only, English UI; market orders only; mocked KYC, broker, Daraja.
- AI: rules + SMA crossover now; predictive models and sentiment in Phase 2.
- Compliance: KYC/AML via sandbox vendor; PII storage aligned with Kenya DPA (`https://kenyalaw.org/kl/`).
- Payments: Daraja STK sandbox (`https://developer.safaricom.co.ke`).
- Data: Pluggable adapter for NSE data; delayed feed acceptable for MVP.