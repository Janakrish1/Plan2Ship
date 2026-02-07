"""Stage gate rules: blocked vs allowed transitions."""
import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session

from app.models import Issue, Artifact, Approval
from app.stage_gates import check_stage_gate

# We don't need a real DB for unit tests if we mock; use in-memory or mock Session
# For simplicity we test the logic with mock issue/artifacts/approvals


def test_intro_to_growth_blocked_without_launch_checklist():
    """Introduction -> Growth should be blocked when no approved launch checklist."""
    db = MagicMock(spec=Session)
    issue = MagicMock(spec=Issue)
    issue.plc_stage = "Introduction"
    issue.id = 1
    issue.evidence_links = []
    # No approved launch checklist
    db.query.return_value.filter.return_value.all.return_value = []
    db.query.return_value.filter.return_value.first.return_value = None
    allowed, missing = check_stage_gate(db, issue, "Growth", None, False)
    assert allowed is False
    assert any("Launch Checklist" in str(m.get("message", "")) for m in missing)


def test_growth_to_maturity_blocked_with_few_evidence_links():
    """Growth -> Maturity requires >= 3 evidence links."""
    db = MagicMock(spec=Session)
    issue = MagicMock(spec=Issue)
    issue.plc_stage = "Growth"
    issue.id = 1
    issue.evidence_links = [{"url": "a"}, {"url": "b"}]  # only 2
    db.query.return_value.filter.return_value.all.return_value = []
    allowed, missing = check_stage_gate(db, issue, "Maturity", None, False)
    assert allowed is False
    assert any("evidence" in str(m.get("message", "")).lower() for m in missing)


def test_growth_to_maturity_allowed_with_three_links():
    """Growth -> Maturity allowed with 3 evidence links."""
    db = MagicMock(spec=Session)
    issue = MagicMock(spec=Issue)
    issue.plc_stage = "Growth"
    issue.id = 1
    issue.evidence_links = [{"url": "a"}, {"url": "b"}, {"url": "c"}]
    db.query.return_value.filter.return_value.all.return_value = []
    allowed, missing = check_stage_gate(db, issue, "Maturity", None, False)
    assert allowed is True
    assert len(missing) == 0
