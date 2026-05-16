"""
Alerts routes: list, mark read, resolve.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models.alert import Alert
from routes.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/alerts", tags=["alerts"])


class AlertOut(BaseModel):
    id: int
    medicine_id: Optional[int]
    alert_type: str
    severity: str
    title: str
    message: str
    is_read: int
    is_resolved: int
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AlertOut])
def list_alerts(
    unread_only: bool = Query(False),
    severity: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Alert)
    if unread_only:
        q = q.filter(Alert.is_read == 0)
    if severity:
        q = q.filter(Alert.severity == severity)
    return q.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/{alert_id}/read")
def mark_read(alert_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.is_read = 1
        db.commit()
    return {"status": "ok"}


@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.is_resolved = 1
        alert.is_read = 1
        db.commit()
    return {"status": "ok"}


@router.patch("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    db.query(Alert).filter(Alert.is_read == 0).update({"is_read": 1})
    db.commit()
    return {"status": "ok"}
