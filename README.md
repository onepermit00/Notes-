# Noted

Shift operations for residential front desks: concierges log each shift into a Daily Activity Report, managers assign work, manage the team, and review analytics.

- `frontend/` React app (craco). `yarn start` on port 3000.
- `backend/` FastAPI + MongoDB. `uvicorn server:app --port 8001`. Tests: `pytest` in `backend/`.
- `mobile/` mobile client.
- `docs/` gap analyses and auth notes. API reference: `docs/api/API.md` (readable) and `docs/api/openapi.yaml` (OpenAPI 3.1), rebuilt with `python scripts/build_api_spec.py` in `backend/`.

On Windows, `Start Noted.bat` launches both servers.
