from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, Issue, Artifact, Approval, User
from app.schemas import ArtifactCreate, ArtifactResponse, ApprovalDecide
from app.auth import get_current_user, require_role
from app.audit import log_audit

router = APIRouter(prefix="/api", tags=["artifacts"])


@router.get("/projects/{key}/artifacts", response_model=list[ArtifactResponse])
def list_artifacts(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.key == key.upper()).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    artifacts = db.query(Artifact).filter(Artifact.project_id == project.id).all()
    return list(artifacts)


@router.post("/artifacts", response_model=ArtifactResponse)
def create_artifact(
    body: ArtifactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "pm")),
):
    project_id = body.project_id
    issue_id = None
    if body.issue_key:
        issue = db.query(Issue).filter(Issue.key == body.issue_key.upper()).first()
        if issue:
            issue_id = issue.id
            project_id = issue.project_id
    if not project_id and body.issue_key:
        raise HTTPException(status_code=404, detail="Issue not found for issue_key")
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id or issue_key required")
    title = body.title or f"{body.kind.replace('_', ' ').title()}"
    artifact = Artifact(
        issue_id=issue_id,
        project_id=project_id,
        kind=body.kind,
        title=title,
        content="",
        status="draft",
        created_by=current_user.id,
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    log_audit(
        db,
        current_user.id,
        "artifact_generated",
        "artifact",
        str(artifact.id),
        {"kind": artifact.kind},
    )
    return artifact


@router.get("/artifacts/{artifact_id}", response_model=ArtifactResponse)
def get_artifact(
    artifact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return artifact


@router.post("/artifacts/{artifact_id}/request-approval")
def request_approval(
    artifact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "pm")),
):
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    approval = Approval(
        artifact_id=artifact.id,
        requested_by=current_user.id,
        status="pending",
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    log_audit(
        db,
        current_user.id,
        "approval_requested",
        "approval",
        str(approval.id),
        {"artifact_id": artifact_id},
    )
    return {"ok": True, "approval_id": approval.id}


@router.post("/approvals/{approval_id}/decide")
def decide_approval(
    approval_id: int,
    body: ApprovalDecide,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "pm")),
):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail="Approval already decided")
    from datetime import datetime
    approval.approver_id = current_user.id
    approval.status = "approved" if body.decision.lower() == "approve" else "rejected"
    approval.comment = body.comment
    approval.decided_at = datetime.utcnow()
    db.commit()
    db.refresh(approval)
    if approval.status == "approved":
        art = db.query(Artifact).filter(Artifact.id == approval.artifact_id).first()
        if art:
            art.status = "approved"
            db.commit()
    log_audit(
        db,
        current_user.id,
        "approval_decided",
        "approval",
        str(approval.id),
        {"decision": approval.status},
    )
    return {"ok": True, "approval": approval}
