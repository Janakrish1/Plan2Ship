#!/usr/bin/env python3
"""
Seed script: create sample project + issues + users.
Run from backend dir: python scripts/seed.py
Uses the same DATABASE_URL as the app (from .env or default SQLite).
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models import User, Project, Issue

# Same logic as app.database so we use SQLite or Postgres consistently
db_url = settings.database_url.replace("postgresql+asyncpg", "postgresql")
if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url, connect_args={"connect_timeout": 10})
Session = sessionmaker(bind=engine)


def seed():
    db = Session()

    # Users
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(name="Admin", email="admin@example.com", role="admin")
        db.add(admin)
        db.flush()
    pm = db.query(User).filter(User.email == "pm@example.com").first()
    if not pm:
        pm = User(name="PM Jane", email="pm@example.com", role="pm")
        db.add(pm)
        db.flush()
    viewer = db.query(User).filter(User.email == "viewer@example.com").first()
    if not viewer:
        viewer = User(name="Viewer", email="viewer@example.com", role="viewer")
        db.add(viewer)
        db.flush()

    # Project
    project = db.query(Project).filter(Project.key == "PLC").first()
    if not project:
        project = Project(name="PLC Demo", key="PLC")
        db.add(project)
        db.flush()

    # Issues across stages
    stages = ["Introduction", "Growth", "Maturity", "Decline", "New Development"]
    summaries = [
        "Launch new onboarding flow",
        "Scale referral program",
        "Maintain core API stability",
        "Sunset legacy dashboard",
        "Rebuild search with new stack",
    ]
    existing = db.query(Issue).filter(Issue.project_id == project.id).count()
    for i, (stage, summary) in enumerate(zip(stages, summaries)):
        key = f"{project.key}-{existing + i + 1}"
        if db.query(Issue).filter(Issue.key == key).first():
            continue
        issue = Issue(
            key=key,
            project_id=project.id,
            type="Story" if i % 2 == 0 else "Task",
            summary=summary,
            description=f"Description for {summary}",
            status="open" if i < 2 else "in_progress",
            plc_stage=stage,
            reporter_id=pm.id,
            assignee_id=pm.id if i < 3 else None,
            priority="P1" if i == 0 else "P2",
            regulatory_impact="low",
            evidence_links=[{"title": "Doc 1", "url": "https://example.com/1"}] * (3 if stage == "Growth" else 0),
        )
        db.add(issue)

    db.commit()
    print("Seed done. Users: admin@example.com, pm@example.com, viewer@example.com. Project: PLC.")
    db.close()


if __name__ == "__main__":
    seed()
