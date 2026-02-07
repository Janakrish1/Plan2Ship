from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


# ----- User -----
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "pm"


class UserCreate(UserBase):
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    hashed_password: Optional[str] = None

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# ----- Auth -----
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# ----- Project -----
class ProjectBase(BaseModel):
    name: str
    key: str = Field(..., min_length=2, max_length=10)


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int

    class Config:
        from_attributes = True


# ----- Issue -----
class IssueBase(BaseModel):
    type: str  # Epic|Story|Task|Bug|Decision|Risk|Experiment
    summary: str
    description: Optional[str] = None
    priority: str = "P2"
    regulatory_impact: str = "low"


class IssueCreate(IssueBase):
    pass


class IssueUpdate(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    regulatory_impact: Optional[str] = None
    assignee_id: Optional[int] = None
    stage_exit_criteria: Optional[list[dict]] = None
    evidence_links: Optional[list[dict]] = None


class IssueResponse(BaseModel):
    id: int
    key: str
    project_id: int
    type: str
    summary: str
    description: Optional[str] = None
    status: str
    plc_stage: str
    assignee_id: Optional[int] = None
    reporter_id: Optional[int] = None
    priority: str
    regulatory_impact: str
    stage_exit_criteria: list = []
    evidence_links: list = []
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserBrief] = None
    reporter: Optional[UserBrief] = None

    class Config:
        from_attributes = True


class TransitionRequest(BaseModel):
    target_stage: str
    override_reason: Optional[str] = None


# ----- Artifact -----
class ArtifactBase(BaseModel):
    kind: str  # launch_checklist | decision_memo
    title: Optional[str] = None
    issue_key: Optional[str] = None
    project_id: Optional[int] = None


class ArtifactCreate(ArtifactBase):
    pass


class ArtifactResponse(BaseModel):
    id: int
    issue_id: Optional[int] = None
    project_id: int
    kind: str
    title: str
    content: Optional[str] = None
    sources: list = []
    status: str
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Approval -----
class ApprovalRequest(BaseModel):
    pass


class ApprovalDecide(BaseModel):
    decision: str  # approve | reject
    comment: Optional[str] = None


class ApprovalResponse(BaseModel):
    id: int
    artifact_id: int
    requested_by: int
    approver_id: Optional[int] = None
    status: str
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ----- Audit -----
class AuditEventResponse(BaseModel):
    id: int
    actor_user_id: Optional[int] = None
    action_type: str
    object_type: str
    object_id: Optional[str] = None
    payload: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Copilot -----
class CopilotMessageRequest(BaseModel):
    message: str
    context: Optional[dict] = None  # { projectKey?, issueKey? }


class CopilotActionArg(BaseModel):
    pass  # flexible dict in practice


class CopilotAction(BaseModel):
    tool: str
    args: dict = {}


class CopilotMissingRequirement(BaseModel):
    type: str  # stage_gate | permission | data
    message: str


class CopilotActionPlan(BaseModel):
    intent: str
    requires_confirmation: bool = True
    actions: list[CopilotAction] = []
    user_message: str = ""
    missing_requirements: list[CopilotMissingRequirement] = []


class CopilotConfirmRequest(BaseModel):
    message_id: Optional[str] = None
    action_plan: CopilotActionPlan
    confirmed: bool = True
