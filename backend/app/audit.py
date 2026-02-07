from sqlalchemy.orm import Session
from app.models import AuditEvent


def log_audit(
    db: Session,
    actor_user_id: int | None,
    action_type: str,
    object_type: str,
    object_id: str | None = None,
    payload: dict | None = None,
) -> AuditEvent:
    event = AuditEvent(
        actor_user_id=actor_user_id,
        action_type=action_type,
        object_type=object_type,
        object_id=object_id,
        payload=payload or {},
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
