from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, Issue, User
from app.schemas import IssueCreate, IssueUpdate, IssueResponse, TransitionRequest
from app.auth import get_current_user, require_role, require_admin
from app.audit import log_audit
from app.stage_gates import check_stage_gate

router = APIRouter(prefix="/api", tags=["issues"])


def _issue_response(issue: Issue) -> IssueResponse:
    return IssueResponse(
        id=issue.id,
        key=issue.key,
        project_id=issue.project_id,
        type=issue.type,
        summary=issue.summary,
        description=issue.description,
        status=issue.status,
        plc_stage=issue.plc_stage,
        assignee_id=issue.assignee_id,
        reporter_id=issue.reporter_id,
        priority=issue.priority,
        regulatory_impact=issue.regulatory_impact,
        stage_exit_criteria=issue.stage_exit_criteria or [],
        evidence_links=issue.evidence_links or [],
        created_at=issue.created_at,
        updated_at=issue.updated_at,
        assignee=issue.assignee,
        reporter=issue.reporter,
    )


@router.get("/projects/{key}/issues", response_model=list[IssueResponse])
def list_issues(
    key: str,
    stage: str | None = Query(None),
    type: str | None = Query(None),
    q: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.key == key.upper()).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    query = db.query(Issue).filter(Issue.project_id == project.id)
    if stage:
        query = query.filter(Issue.plc_stage == stage)
    if type:
        query = query.filter(Issue.type == type)
    if q:
        query = query.filter(
            Issue.summary.ilike(f"%{q}%") | Issue.description.ilike(f"%{q}%")
        )
    issues = query.all()
    return [_issue_response(i) for i in issues]


@router.post("/projects/{key}/issues", response_model=IssueResponse)
def create_issue(
    key: str,
    body: IssueCreate,
    db: Session = Depends(get_db),
      current_user: User = Depends(require_role("admin", "pm")),
):
    project = db.query(Project).filter(Project.key == key.upper()).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Generate key: PROJECT-1, PROJECT-2, ...
    max_num = (
        db.query(Issue)
        .filter(Issue.project_id == project.id)
        .count()
    )
    issue_key = f"{project.key}-{max_num + 1}"
    issue = Issue(
        key=issue_key,
        project_id=project.id,
        type=body.type,
        summary=body.summary,
        description=body.description,
        priority=body.priority,
        regulatory_impact=body.regulatory_impact,
        reporter_id=current_user.id,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    log_audit(
        db,
        current_user.id,
        "issue_created",
        "issue",
        issue.key,
        {"summary": issue.summary},
    )
    return _issue_response(issue)


@router.get("/issues/{issue_key}", response_model=IssueResponse)
def get_issue(
    issue_key: str,
      db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    issue = db.query(Issue).filter(Issue.key == issue_key.upper()).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return _issue_response(issue)


@router.patch("/issues/{issue_key}", response_model=IssueResponse)
def update_issue(
    issue_key: str,
    body: IssueUpdate,
      db: Session = Depends(get_db),
      current_user: User = Depends(require_role("admin", "pm")),
):
    issue = db.query(Issue).filter(Issue.key == issue_key.upper()).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    before = {
        "summary": issue.summary,
        "status": issue.status,
        "assignee_id": issue.assignee_id,
    }
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(issue, k, v)
    db.commit()
    db.refresh(issue)
    log_audit(
        db,
        current_user.id,
        "issue_updated",
        "issue",
        issue.key,
        {"before": before, "after": body.model_dump(exclude_unset=True)},
    )
    return _issue_response(issue)


@router.post("/issues/{issue_key}/transition")
def transition_issue(
    issue_key: str,
    body: TransitionRequest,
      db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "pm")),
):
    issue = db.query(Issue).filter(Issue.key == issue_key.upper()).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    allowed, missing = check_stage_gate(
        db, issue, body.target_stage, body.override_reason, current_user.role == "admin"
    )
    if not allowed:
        return {
            "blocked": True,
            "message": "Stage gate not satisfied",
            "missing_requirements": missing,
        }
    old_stage = issue.plc_stage
    issue.plc_stage = body.target_stage
    db.commit()
    db.refresh(issue)
    log_audit(
        db,
        current_user.id,
        "issue_transitioned",
        "issue",
        issue.key,
        {"from": old_stage, "to": body.target_stage, "override_reason": body.override_reason},
    )
    return {"ok": True, "issue": _issue_response(issue)}


@router.get("/issues/{issue_key}/audit")
def get_issue_audit(
    issue_key: str,
      db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    issue = db.query(Issue).filter(Issue.key == issue_key.upper()).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    from app.models import AuditEvent
    events = (
        db.query(AuditEvent)
        .filter(AuditEvent.object_type == "issue", AuditEvent.object_id == issue_key.upper())
        .order_by(AuditEvent.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": e.id,
            "actor_user_id": e.actor_user_id,
            "action_type": e.action_type,
            "object_type": e.object_type,
            "object_id": e.object_id,
            "payload": e.payload,
            "created_at": e.created_at.isoformat(),
        }
        for e in events
    ]
