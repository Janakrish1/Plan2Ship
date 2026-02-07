"""
Stage gate rules for PLC transitions.
Introduction -> Growth: Launch Checklist approved or admin override
Growth -> Maturity: >= 3 evidence links or override
Maturity -> Decline: Decision Memo approved or override
Decline -> New Development: Decision Memo approved
New Development -> Introduction: Launch Checklist in draft (at least created)
"""
from sqlalchemy.orm import Session
from app.models import Issue, Artifact, Approval
from app.models import PLCStage, ArtifactKind, ArtifactStatus, ApprovalStatus


STAGE_ORDER = [
    PLCStage.introduction.value,
    PLCStage.growth.value,
    PLCStage.maturity.value,
    PLCStage.decline.value,
    PLCStage.new_development.value,
]


def _index(stage: str) -> int:
    try:
        return STAGE_ORDER.index(stage)
    except ValueError:
        return -1


def _has_approved_launch_checklist(db: Session, issue: Issue) -> bool:
    for a in db.query(Artifact).filter(
        Artifact.issue_id == issue.id,
        Artifact.kind == ArtifactKind.launch_checklist.value,
    ):
        for appr in db.query(Approval).filter(Approval.artifact_id == a.id):
            if appr.status == ApprovalStatus.approved.value:
                return True
    return False


def _has_approved_decision_memo(db: Session, issue: Issue) -> bool:
    for a in db.query(Artifact).filter(
        Artifact.issue_id == issue.id,
        Artifact.kind == ArtifactKind.decision_memo.value,
    ):
        for appr in db.query(Approval).filter(Approval.artifact_id == a.id):
            if appr.status == ApprovalStatus.approved.value:
                return True
    return False


def _launch_checklist_draft_exists(db: Session, issue: Issue) -> bool:
    return db.query(Artifact).filter(
        Artifact.issue_id == issue.id,
        Artifact.kind == ArtifactKind.launch_checklist.value,
    ).first() is not None


def _evidence_count(issue: Issue) -> int:
    links = issue.evidence_links or []
    return len(links)


def check_stage_gate(
    db: Session,
    issue: Issue,
    target_stage: str,
    override_reason: str | None,
    is_admin: bool,
) -> tuple[bool, list[dict]]:
    """
    Returns (allowed, list of missing_requirements).
    If override_reason and is_admin, allow despite missing.
    """
    missing = []
    current = issue.plc_stage
    if _index(target_stage) < 0:
        missing.append({"type": "data", "message": f"Unknown stage: {target_stage}"})
        return (False, missing)

    # Introduction -> Growth
    if current == PLCStage.introduction.value and target_stage == PLCStage.growth.value:
        if not _has_approved_launch_checklist(db, issue):
            missing.append({
                "type": "stage_gate",
                "message": "Introduction → Growth requires an approved Launch Checklist artifact.",
            })
        if missing and override_reason and is_admin:
            return (True, [])
        return (len(missing) == 0, missing)

    # Growth -> Maturity
    if current == PLCStage.growth.value and target_stage == PLCStage.maturity.value:
        if _evidence_count(issue) < 3:
            missing.append({
                "type": "stage_gate",
                "message": "Growth → Maturity requires at least 3 evidence links.",
            })
        if missing and override_reason and is_admin:
            return (True, [])
        return (len(missing) == 0, missing)

    # Maturity -> Decline
    if current == PLCStage.maturity.value and target_stage == PLCStage.decline.value:
        if not _has_approved_decision_memo(db, issue):
            missing.append({
                "type": "stage_gate",
                "message": "Maturity → Decline requires an approved Decision Memo.",
            })
        if missing and override_reason and is_admin:
            return (True, [])
        return (len(missing) == 0, missing)

    # Decline -> New Development
    if current == PLCStage.decline.value and target_stage == PLCStage.new_development.value:
        if not _has_approved_decision_memo(db, issue):
            missing.append({
                "type": "stage_gate",
                "message": "Decline → New Development requires an approved Decision Memo.",
            })
        # No override for this transition per spec
        return (len(missing) == 0, missing)

    # New Development -> Introduction
    if current == PLCStage.new_development.value and target_stage == PLCStage.introduction.value:
        if not _launch_checklist_draft_exists(db, issue):
            missing.append({
                "type": "stage_gate",
                "message": "New Development → Introduction requires a Launch Checklist (at least in draft).",
            })
        return (len(missing) == 0, missing)

    # Any other transition: allow if adjacent in order (simplified)
    ci = _index(current)
    ti = _index(target_stage)
    if ci >= 0 and ti >= 0 and abs(ci - ti) == 1:
        return (True, [])
    if ci >= 0 and ti >= 0:
        missing.append({"type": "data", "message": "Can only transition to adjacent stage."})
        return (False, missing)

    return (True, [])
