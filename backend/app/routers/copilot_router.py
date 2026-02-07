"""
Copilot: message -> ActionPlan; execute -> run tools and audit.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import Issue, Project, Artifact, User
from app.auth import get_current_user, require_role
from app.audit import log_audit
from app.stage_gates import check_stage_gate
from app.copilot import (
    parse_intent,
    build_action_plan,
    render_launch_checklist_template,
    render_decision_memo_template,
)
from app.schemas import CopilotMessageRequest, CopilotActionPlan, CopilotAction

router = APIRouter(prefix="/api/copilot", tags=["copilot"])


@router.post("/message")
def copilot_message(
    body: CopilotMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Parse NL message and return ActionPlan (no execution)."""
    context = body.context or {}
    if body.context and body.context.get("projectKey"):
        context["projectKey"] = body.context["projectKey"]
    if body.context and body.context.get("issueKey"):
        context["issueKey"] = body.context["issueKey"]
    intent, params = parse_intent(body.message, context)
    # Check stage gate for transition_issue
    missing = []
    if intent == "transition_issue" and context.get("issueKey"):
        issue = db.query(Issue).filter(Issue.key == context["issueKey"].upper()).first()
        if issue:
            target = params.get("target_stage") or "introduction"
            allowed, miss = check_stage_gate(db, issue, target, None, current_user.role == "admin")
            if not allowed:
                missing = miss
    plan = build_action_plan(intent, params, missing)
    return {"action_plan": plan.model_dump()}


class ExecuteRequest(BaseModel):
    action_plan: dict  # CopilotActionPlan as dict


@router.post("/execute")
def copilot_execute(
    body: ExecuteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "pm")),
):
    """Execute a confirmed ActionPlan: run tools and write audit events."""
    plan_dict = body.action_plan
    intent = plan_dict.get("intent", "")
    actions = plan_dict.get("actions", [])
    results = []

    for action in actions:
        tool = action.get("tool", "")
        args = action.get("args", {})
        try:
            if tool == "create_issue":
                out = _tool_create_issue(db, current_user, args)
                results.append({"tool": tool, "ok": True, "result": out})
                log_audit(
                    db, current_user.id, "copilot_tool_call", "issue", out.get("key"),
                    {"tool": tool, "args": args, "result": out},
                )
            elif tool == "update_issue":
                out = _tool_update_issue(db, current_user, args)
                results.append({"tool": tool, "ok": True, "result": out})
                log_audit(
                    db, current_user.id, "copilot_tool_call", "issue", args.get("issue_key"),
                    {"tool": tool, "args": args, "result": out},
                )
            elif tool == "assign_issue":
                out = _tool_assign_issue(db, current_user, args)
                results.append({"tool": tool, "ok": True, "result": out})
                log_audit(
                    db, current_user.id, "copilot_tool_call", "issue", args.get("issue_key"),
                    {"tool": tool, "args": args, "result": out},
                )
            elif tool == "transition_issue":
                out = _tool_transition_issue(db, current_user, args)
                if out.get("blocked"):
                    results.append({"tool": tool, "ok": False, "blocked": True, "result": out})
                else:
                    results.append({"tool": tool, "ok": True, "result": out})
                    log_audit(
                        db, current_user.id, "copilot_tool_call", "issue", args.get("issue_key"),
                        {"tool": tool, "args": args, "result": out},
                    )
            elif tool == "search_issues":
                out = _tool_search_issues(db, current_user, args)
                results.append({"tool": tool, "ok": True, "result": out})
                log_audit(
                    db, current_user.id, "copilot_tool_call", "issue", args.get("issue_key"),
                    {"tool": tool, "result_summary": out.get("summary", "")[:200]},
                )
            elif tool == "generate_artifact":
                out = _tool_generate_artifact(db, current_user, args)
                results.append({"tool": tool, "ok": True, "result": out})
                log_audit(
                    db, current_user.id, "copilot_tool_call", "artifact", str(out.get("id")),
                    {"tool": tool, "args": args, "result": out},
                )
            else:
                results.append({"tool": tool, "ok": False, "error": "Unknown tool"})
        except Exception as e:
            results.append({"tool": tool, "ok": False, "error": str(e)})

    return {"results": results}


def _tool_create_issue(db: Session, user: User, args: dict) -> dict:
    project_key = (args.get("projectKey") or args.get("project_key")).upper()
    project = db.query(Project).filter(Project.key == project_key).first()
    if not project:
        raise ValueError(f"Project not found: {project_key}")
    from app.models import Issue
    count = db.query(Issue).filter(Issue.project_id == project.id).count()
    key = f"{project.key}-{count + 1}"
    issue = Issue(
        key=key,
        project_id=project.id,
        type=args.get("type", "Task"),
        summary=args.get("summary", "New issue"),
        description=args.get("description"),
        reporter_id=user.id,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    log_audit(db, user.id, "issue_created", "issue", issue.key, {"summary": issue.summary})
    return {"key": issue.key, "id": issue.id}


def _tool_update_issue(db: Session, user: User, args: dict) -> dict:
    key = (args.get("issue_key") or args.get("issueKey")).upper()
    issue = db.query(Issue).filter(Issue.key == key).first()
    if not issue:
        raise ValueError(f"Issue not found: {key}")
    for f in ["summary", "description", "priority", "status"]:
        if f in args and args[f] is not None:
            setattr(issue, f, args[f])
    db.commit()
    db.refresh(issue)
    log_audit(db, user.id, "issue_updated", "issue", issue.key, {"args": args})
    return {"key": issue.key}


def _tool_assign_issue(db: Session, user: User, args: dict) -> dict:
    key = (args.get("issue_key") or args.get("issueKey")).upper()
    assignee_id = args.get("assignee_id") or args.get("assignee_id")
    issue = db.query(Issue).filter(Issue.key == key).first()
    if not issue:
        raise ValueError(f"Issue not found: {key}")
    if assignee_id is not None:
        issue.assignee_id = int(assignee_id)
    db.commit()
    db.refresh(issue)
    log_audit(db, user.id, "issue_updated", "issue", issue.key, {"assignee_id": assignee_id})
    return {"key": issue.key, "assignee_id": issue.assignee_id}


def _tool_transition_issue(db: Session, user: User, args: dict) -> dict:
    key = (args.get("issue_key") or args.get("issueKey")).upper()
    target_stage = args.get("target_stage", "introduction")
    issue = db.query(Issue).filter(Issue.key == key).first()
    if not issue:
        raise ValueError(f"Issue not found: {key}")
    allowed, missing = check_stage_gate(db, issue, target_stage, None, user.role == "admin")
    if not allowed:
        return {"blocked": True, "missing_requirements": missing}
    issue.plc_stage = target_stage
    db.commit()
    db.refresh(issue)
    log_audit(db, user.id, "issue_transitioned", "issue", issue.key, {"to": target_stage})
    return {"key": issue.key, "plc_stage": issue.plc_stage}


def _tool_search_issues(db: Session, user: User, args: dict) -> dict:
    issue_key = args.get("issue_key") or args.get("issueKey")
    if issue_key:
        issue = db.query(Issue).filter(Issue.key == issue_key.upper()).first()
        if not issue:
            return {"summary": "Issue not found.", "key": issue_key}
        return {
            "key": issue.key,
            "summary": issue.summary,
            "description": (issue.description or "")[:500],
            "plc_stage": issue.plc_stage,
            "status": issue.status,
        }
    return {"summary": "No issue key provided."}


def _tool_generate_artifact(db: Session, user: User, args: dict) -> dict:
    kind = args.get("kind", "launch_checklist")
    issue_key = args.get("issue_key") or args.get("issueKey")
    issue = None
    project_id = None
    if issue_key:
        issue = db.query(Issue).filter(Issue.key == issue_key.upper()).first()
        if issue:
            project_id = issue.project_id
    if not project_id:
        project_key = args.get("projectKey") or args.get("project_key")
        if project_key:
            proj = db.query(Project).filter(Project.key == project_key.upper()).first()
            if proj:
                project_id = proj.id
    if not project_id:
        raise ValueError("issue_key or project_id required")
    title = f"{kind.replace('_', ' ').title()}"
    content = ""
    if kind == "launch_checklist" and issue:
        content = render_launch_checklist_template(issue)
    elif kind == "decision_memo" and issue:
        content = render_decision_memo_template(issue)
    artifact = Artifact(
        issue_id=issue.id if issue else None,
        project_id=project_id,
        kind=kind,
        title=title,
        content=content,
        status="draft",
        created_by=user.id,
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    log_audit(db, user.id, "artifact_generated", "artifact", str(artifact.id), {"kind": kind})
    return {"id": artifact.id, "kind": kind, "title": artifact.title}
