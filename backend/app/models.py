from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, JSON, Boolean
)
from sqlalchemy.orm import relationship

from app.database import Base

import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    pm = "pm"
    viewer = "viewer"


class IssueType(str, enum.Enum):
    epic = "Epic"
    story = "Story"
    task = "Task"
    bug = "Bug"
    decision = "Decision"
    risk = "Risk"
    experiment = "Experiment"


class IssueStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    done = "done"


class PLCStage(str, enum.Enum):
    introduction = "Introduction"
    growth = "Growth"
    maturity = "Maturity"
    decline = "Decline"
    new_development = "New Development"


class Priority(str, enum.Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"


class RegulatoryImpact(str, enum.Enum):
    low = "low"
    med = "med"
    high = "high"


class ArtifactKind(str, enum.Enum):
    launch_checklist = "launch_checklist"
    decision_memo = "decision_memo"


class ArtifactStatus(str, enum.Enum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    published = "published"


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(50), default=UserRole.pm.value)
    hashed_password = Column(String(255), nullable=True)  # nullable for seed users

    def __repr__(self):
        return f"<User {self.email}>"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    key = Column(String(10), unique=True, nullable=False, index=True)

    issues = relationship("Issue", back_populates="project")

    def __repr__(self):
        return f"<Project {self.key}>"


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    type = Column(String(50), nullable=False)  # Epic|Story|Task|Bug|Decision|Risk|Experiment
    summary = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default=IssueStatus.open.value)
    plc_stage = Column(String(50), default=PLCStage.introduction.value)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    priority = Column(String(10), default=Priority.P2.value)
    regulatory_impact = Column(String(20), default=RegulatoryImpact.low.value)
    stage_exit_criteria = Column(JSON, default=list)  # [{text, done: bool}, ...]
    evidence_links = Column(JSON, default=list)  # [{title, url}, ...]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="issues")
    assignee = relationship("User", foreign_keys=[assignee_id])
    reporter = relationship("User", foreign_keys=[reporter_id])
    artifacts = relationship("Artifact", back_populates="issue")

    def __repr__(self):
        return f"<Issue {self.key}>"


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    kind = Column(String(50), nullable=False)  # launch_checklist | decision_memo
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    sources = Column(JSON, default=list)  # citations/evidence
    status = Column(String(50), default=ArtifactStatus.draft.value)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    issue = relationship("Issue", back_populates="artifacts")
    approvals = relationship("Approval", back_populates="artifact")

    def __repr__(self):
        return f"<Artifact {self.id} {self.kind}>"


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    artifact_id = Column(Integer, ForeignKey("artifacts.id"), nullable=False)
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default=ApprovalStatus.pending.value)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)

    artifact = relationship("Artifact", back_populates="approvals")

    def __repr__(self):
        return f"<Approval {self.id} {self.status}>"


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action_type = Column(String(100), nullable=False)
    object_type = Column(String(50), nullable=False)
    object_id = Column(String(100), nullable=True)
    payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AuditEvent {self.action_type} {self.object_type}>"
