# Run the app and verify it works

Use two terminals: one for the backend, one for the frontend.

---

## Terminal 1 – Backend

```bash
cd plc-jira-copilot/backend
source .venv/bin/activate   # or: .venv\Scripts\activate on Windows
```

Set the database URL (use either **local** or **Azure**):

**Option A – Local PostgreSQL**

```bash
export DATABASE_URL=postgresql://plc:plc_secret@localhost:5432/plc_jira
```

**Option B – Azure Database for PostgreSQL**

```bash
# Replace with your server, user, password, and database name.
# User is often: youruser@yourserver
export DATABASE_URL="postgresql://YOUR_USER%40YOUR_SERVER:YOUR_PASSWORD@YOUR_SERVER.postgres.database.azure.com:5432/plc_jira?sslmode=require"
```

Create tables and seed data:

```bash
alembic upgrade head
python scripts/seed.py
```

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

Leave this running. You should see: `Uvicorn running on http://0.0.0.0:8000`.

---

## Terminal 2 – Frontend

```bash
cd plc-jira-copilot/frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Leave this running. You should see: `Ready on http://localhost:3000`.

---

## Verify

1. **Health check:** Open http://localhost:8000/health — you should see `{"status":"ok"}`.
2. **API docs:** Open http://localhost:8000/docs — you should see Swagger UI.
3. **App:** Open http://localhost:3000 — you should see the login page.
4. **Login:** Use **pm@example.com** (password can be empty for the seed user).
5. **Board:** After login, select project **PLC** — you should see 5 columns (PLC stages) with sample issues.
6. **Copilot:** Type e.g. “Create a new task” in the right panel → Send → you should get an Action Plan; click **Confirm** to run it.

If all of the above work, the app is running and connected correctly.
