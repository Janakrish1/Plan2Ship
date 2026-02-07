from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, User
from app.schemas import ProjectCreate, ProjectResponse
from app.auth import get_current_user, require_role
from app.audit import log_audit

router = APIRouter(prefix="/api", tags=["projects"])


@router.get("/projects", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Project).all()


@router.post("/projects", response_model=ProjectResponse)
def create_project(
    body: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "pm")),
):
    if db.query(Project).filter(Project.key == body.key).first():
        raise HTTPException(status_code=400, detail="Project key already exists")
    project = Project(name=body.name, key=body.key.upper())
    db.add(project)
    db.commit()
    db.refresh(project)
    log_audit(
        db, current_user.id, "project_created", "project", str(project.id), {"key": project.key}
    )
    return project
