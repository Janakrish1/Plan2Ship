# Plan2Ship

AI-powered Product Lifecycle Management for Product Managers. Stage 1 implements **Product Strategy & Ideation**: upload a PDF, get AI analysis and brainstorming.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, TypeScript
- **AI**: Azure OpenAI (GPT deployment)
- **Storage**: Local filesystem (PDFs in `server/uploads/`, project data in `server/data/projects/`)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set your Azure OpenAI values:

   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT` (e.g. `gpt-5.1-chat`)
   - `AZURE_OPENAI_API_VERSION` (e.g. `2024-12-01-preview`)

3. **Metrics charts (optional)**

   Stage metrics (graphs, pie charts) are generated with Python (matplotlib + seaborn). To enable them:

   ```bash
   cd server/scripts
   pip install -r requirements-metrics.txt
   ```

   Ensure `python3` is on your PATH. Charts are generated automatically when you create a project (Stage 1) or run Stage 2, 3, or 5 analysis, and appear in the relevant stage sections.

4. **Run**

   From the project root:

   ```bash
   npm run dev
   ```

   This starts:

   - **API**: http://localhost:3001  
   - **Client**: http://localhost:5173 (proxies `/api` to the server)

   Or run separately:

   ```bash
   npm run dev:server   # backend only
   npm run dev:client   # frontend only
   ```

## Usage

1. **Home** – List projects and open “Add Project”.
2. **Create project** – Upload a product PDF (max 15 MB). The server parses the PDF and calls Azure OpenAI for Stage 1 analysis. If Python metrics are set up, Stage 1 charts (market sizing, customer segments, scenarios) are generated.
3. **Project detail** – View/edit title, summary, and Stage 1 sections (ideas, market sizing, segments, goals, scenarios, needs, competitive insights). Use **Brainstorm more** for extra ideas and **Save** to persist.
4. **Stages 2–5** – Generate analysis per stage. Stages 2, 3, and 5 get metrics charts (backlog priority/effort, feedback themes/competitors/trends, personas/GTM metrics) when Python is configured.

## API

- `GET /api/projects` – List projects
- `GET /api/projects/:id` – Get project
- `POST /api/projects/create` – Create project (multipart PDF as `document`)
- `PATCH /api/projects/:id` – Update title / stage1Analysis
- `POST /api/projects/:id/brainstorm` – Body: `{ stage: 1, additionalContext?: string }`

## Next steps

- Stage 2: Requirements & Development  
- Stage 3: Customer & Market Research  
- Stage 4: Prototyping & Testing  
- Stage 5: Go-to-Market Execution  
