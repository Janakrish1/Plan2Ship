"""Copilot ActionPlan schema validation."""
import pytest
from pydantic import ValidationError

from app.schemas import CopilotActionPlan, CopilotAction, CopilotMissingRequirement


def test_action_plan_valid():
    plan = CopilotActionPlan(
        intent="create_issue",
        requires_confirmation=True,
        actions=[CopilotAction(tool="create_issue", args={"summary": "Test", "type": "Task"})],
        user_message="Create a new issue.",
        missing_requirements=[],
    )
    assert plan.intent == "create_issue"
    assert len(plan.actions) == 1
    assert plan.actions[0].tool == "create_issue"
    assert plan.actions[0].args["summary"] == "Test"


def test_action_plan_with_missing_requirements():
    plan = CopilotActionPlan(
        intent="transition_issue",
        requires_confirmation=True,
        actions=[CopilotAction(tool="transition_issue", args={"target_stage": "Growth"})],
        user_message="Transition to Growth.",
        missing_requirements=[
            CopilotMissingRequirement(type="stage_gate", message="Launch Checklist required."),
        ],
    )
    assert len(plan.missing_requirements) == 1
    assert plan.missing_requirements[0].type == "stage_gate"
    assert "Launch Checklist" in plan.missing_requirements[0].message


def test_action_plan_serialization_roundtrip():
    plan = CopilotActionPlan(
        intent="generate_launch_checklist",
        requires_confirmation=True,
        actions=[CopilotAction(tool="generate_artifact", args={"kind": "launch_checklist"})],
        user_message="Generate Launch Checklist.",
        missing_requirements=[],
    )
    d = plan.model_dump()
    plan2 = CopilotActionPlan.model_validate(d)
    assert plan2.intent == plan.intent
    assert plan2.actions[0].tool == plan.actions[0].tool
