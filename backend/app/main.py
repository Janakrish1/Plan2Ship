from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth_router, projects_router, issues_router, artifacts_router
from app.routers.copilot_router import router as copilot_router

app = FastAPI(title="PLC Jira + Copilot", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(projects_router.router)
app.include_router(issues_router.router)
app.include_router(artifacts_router.router)
app.include_router(copilot_router)


@app.get("/")
def root():
    return {
        "app": "PLC Jira + Copilot",
        "docs": "/docs",
        "health": "/health",
        "api": "/api",
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    from fastapi.responses import Response
    return Response(status_code=204)


@app.get("/health")
def health():
    return {"status": "ok"}
