"""
Rule-based intent parsing and ActionPlan generation for Copilot.
No external LLM; templates for artifact generation.
"""
import re
from typing import Any

from app.schemas import CopilotActionPlan, CopilotAction, CopilotMissingRequirement

INTENTS = [
    "create_issue",
    "update_issue",
    "assign_issue",
    "transition_issue",
    "summarize_issue",
    "generate_launch_checklist",
    "generate_decision_memo",
]


def _normalize(s: str) -> str:
    return " ".join(s.lower().split())


def parse_intent(message: str, context: dict | None) -> tuple[str, dict]:
    """
    Returns (intent, extracted_params).
    """
    msg = _normalize(message)
    ctx = context or {}

    # create issue
    if re.search(r"\b(create|add|new)\s+(issue|ticket|story|task|bug|epic)\b", msg):
        return "create_issue", {"message": message}

    # update issue
    if re.search(r"\b(update|edit|change)\s+(issue|ticket)\b", msg) or re.search(
        r"\b(update|edit)\s+(\w+-\d+)\b", msg
    ):
        return "update_issue", {"message": message, "issue_key": ctx.get("issueKey")}

    # assign
    if re.search(r"\bassign\b", msg):
        return "assign_issue", {"message": message, "issue_key": ctx.get("issueKey")}

    # transition
    if re.search(
        r"\b(move|transition|advance|promote)\s+(to\s+)?(introduction|growth|maturity|decline|new development)\b",
        msg,
    ):
        stage = None
        for s in ["introduction", "growth", "maturity", "decline", "new development"]:
            if s in msg:
                stage = s
                break
        return "transition_issue", {
            "message": message,
            "issue_key": ctx.get("issueKey"),
            "target_stage": stage or "introduction",
        }

    # summarize
    if re.search(r"\b(summarize|summary|summarise)\b", msg):
        return "summarize_issue", {"message": message, "issue_key": ctx.get("issueKey")}

    # generate launch checklist
    if re.search(r"\b(launch\s+checklist|generate\s+launch)\b", msg):
        return "generate_launch_checklist", {
            "message": message,
            "issue_key": ctx.get("issueKey"),
        }

    # generate decision memo
    if re.search(r"\b(decision\s+memo|generate\s+decision\s+memo)\b", msg):
        return "generate_decision_memo", {
            "message": message,
            "issue_key": ctx.get("issueKey"),
        }

    # default: summarize
    return "summarize_issue", {"message": message, "issue_key": ctx.get("issueKey")}


def build_action_plan(
    intent: str,
    params: dict,
    missing_requirements: list[dict] | None = None,
) -> CopilotActionPlan:
    missing = missing_requirements or []
    actions = []
    requires_confirmation = intent in (
        "create_issue",
        "update_issue",
        "assign_issue",
        "transition_issue",
        "generate_launch_checklist",
        "generate_decision_memo",
    )
    user_message = ""

    if intent == "create_issue":
        actions = [{"tool": "create_issue", "args": {"summary": "New issue", "type": "Task", **params}}]
        user_message = "Create a new issue with details from your message."
    elif intent == "update_issue":
        actions = [{"tool": "update_issue", "args": {"issue_key": params.get("issue_key"), **params}}]
        user_message = "Update the issue with the requested changes."
    elif intent == "assign_issue":
        actions = [{"tool": "assign_issue", "args": {"issue_key": params.get("issue_key"), **params}}]
        user_message = "Assign the issue to the specified user."
    elif intent == "transition_issue":
        actions = [
            {
                "tool": "transition_issue",
                "args": {
                    "issue_key": params.get("issue_key"),
                    "target_stage": params.get("target_stage"),
                },
            }
        ]
        user_message = f"Transition issue to {params.get('target_stage', 'target')} stage."
    elif intent == "summarize_issue":
        actions = [{"tool": "search_issues", "args": {"issue_key": params.get("issue_key"), **params}}]
        user_message = "Retrieve and summarize the issue or epic."
    elif intent == "generate_launch_checklist":
        actions = [
            {
                "tool": "generate_artifact",
                "args": {
                    "kind": "launch_checklist",
                    "issue_key": params.get("issue_key"),
                    **params,
                },
            }
        ]
        user_message = "Generate a Launch Checklist artifact for the issue."
    elif intent == "generate_decision_memo":
        actions = [
            {
                "tool": "generate_artifact",
                "args": {
                    "kind": "decision_memo",
                    "issue_key": params.get("issue_key"),
                    **params,
                },
            }
        ]
        user_message = "Generate a Decision Memo artifact for the issue."

    return CopilotActionPlan(
        intent=intent,
        requires_confirmation=requires_confirmation,
        actions=[CopilotAction(tool=a["tool"], args=a["args"]) for a in actions],
        user_message=user_message or f"Execute: {intent}",
        missing_requirements=[CopilotMissingRequirement(**m) for m in missing],
    )


def render_launch_checklist_template(issue: Any) -> str:
    return f"""# Launch Checklist: {getattr(issue, 'summary', 'Issue')}

## Pre-launch
- [ ] Requirements signed off
- [ ] Security review completed
- [ ] Compliance checklist completed
- [ ] Rollback plan documented

## Launch
- [ ] Deployment runbook ready
- [ ] Monitoring and alerts configured
- [ ] Stakeholders notified

## Post-launch
- [ ] Success metrics defined
- [ ] Feedback channel established

*Generated for issue {getattr(issue, 'key', 'N/A')}*
"""


def render_decision_memo_template(issue: Any) -> str:
    return f"""# Decision Memo: {getattr(issue, 'summary', 'Issue')}

## Context
- **Issue:** {getattr(issue, 'key', 'N/A')}
- **Summary:** {getattr(issue, 'summary', '')}
- **Stage:** {getattr(issue, 'plc_stage', 'N/A')}

## Decision
[To be completed]

## Rationale
[To be completed]

## Alternatives Considered
[To be completed]

## Approval
- [ ] PM sign-off
- [ ] Compliance sign-off (if required)

*Generated for issue {getattr(issue, 'key', 'N/A')}*
"""
