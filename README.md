# PLC Jira + Copilot

AI-powered PM productivity system: Jira-like issue tracking structured around **5 PLC stages** (Introduction, Growth, Maturity, Decline, New Development) with an **AI Copilot** that turns natural language into validated actions, stage gates, approvals, and audit logging.

## Stack

- **Frontend:** Next.js (Node) + React + Tailwind CSS
- **Backend:** FastAPI (Python) + SQLAlchemy + Pydantic
- **Database:** **SQLite** by default (free, no server, great for hackathons). PostgreSQL optional for production.

## Prerequisites

- **Node.js** 18+ (for Next.js frontend)
- **Python** 3.11+ (for FastAPI backend)
- **No database server required** – the app uses SQLite by default (a single file, zero cost).

---

## 1. Get it up and running

Use **two terminals**. No Azure or PostgreSQL needed.

### Terminal 1 – Backend

```bash
cd plc-jira-copilot/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .
cp .env.example .env        # optional; defaults to SQLite
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

The default `.env` uses **SQLite** (`sqlite:///./plc_jira.db`), so nothing else to install. Keep this terminal running.

You should see: `Uvicorn running on http://0.0.0.0:8000`.

### Terminal 2 – Frontend

**Run from the `frontend` folder** (that’s where `package.json` is):

```bash
cd plc-jira-copilot/frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Keep this running. You should see: `Ready on http://localhost:3000`.

---

## 2. Verify it’s working

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Open http://localhost:8000/health | `{"status":"ok"}` |
| 2 | Open http://localhost:8000/docs | Swagger API docs |
| 3 | Open http://localhost:3000 | Login page |
| 4 | Log in with **pm@example.com** (password optional) | Redirect to app |
| 5 | Select project **PLC** | Board with 5 stage columns and sample issues |
| 6 | Click an issue | Issue detail modal with audit timeline |
| 7 | In Copilot (right panel), type “Create a new task” → Send | Action plan appears; click **Confirm** to run |

If all of the above work, the app is running correctly.

Detailed steps are also in **[scripts/run-and-verify.md](scripts/run-and-verify.md)**.

---

## 3. Optional: PostgreSQL or Azure

**You can skip this for a hackathon** – SQLite is enough.

If you want PostgreSQL (local or Azure) later:

- **Local:** Install Postgres, create a DB, then set in `backend/.env`:  
  `DATABASE_URL=postgresql://user:pass@localhost:5432/plc_jira`
- **Azure Database for PostgreSQL:** See **[docs/AZURE-SETUP.md](docs/AZURE-SETUP.md)** (paid; use only if you need a shared/cloud DB).

---

## PLC workflow

- **Stages:** Introduction → Growth → Maturity → Decline → New Development (then back to Introduction).
- **Stage gates (MVP):**
  - Introduction → Growth: approved **Launch Checklist** (or admin override).
  - Growth → Maturity: at least **3 evidence links** (or admin override).
  - Maturity → Decline: approved **Decision Memo** (or admin override).
  - Decline → New Development: approved **Decision Memo**.
  - New Development → Introduction: **Launch Checklist** in draft (at least created).

## Copilot

Use the right-hand **Copilot** panel to type natural language (e.g. “Create a new task”, “Move to Growth”, “Generate launch checklist”). The backend returns an **ActionPlan**; click **Confirm** to execute. Every tool call is written to the **audit log**.

## API

- `GET/POST /api/projects`
- `GET/POST /api/projects/:key/issues?stage=&type=&q=`
- `GET/PATCH /api/issues/:issueKey`
- `POST /api/issues/:issueKey/transition` (body: `target_stage`, `override_reason?`)
- `GET /api/issues/:issueKey/audit`
- `POST /api/artifacts`, `GET /api/artifacts/:id`
- `GET /api/projects/:key/artifacts`
- `POST /api/artifacts/:id/request-approval`
- `POST /api/approvals/:id/decide`
- `POST /api/copilot/message` (body: `message`, `context { projectKey?, issueKey? }`)
- `POST /api/copilot/execute` (body: `action_plan`)

## Tests

```bash
cd backend
pip install pytest httpx
pytest tests/ -v
```

## License

MIT.
