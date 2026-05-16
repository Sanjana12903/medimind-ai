"""
Medicine routes: CRUD + dashboard KPIs.
"""
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.medicine import Medicine
from models.alert import Alert
from routes.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/medicines", tags=["medicines"])


# ─── Schemas ──────────────────────────────────────────────────────────────────
class MedicineCreate(BaseModel):
    name: str
    generic_name: Optional[str] = None
    category: str
    manufacturer: Optional[str] = None
    sku: str
    batch_number: Optional[str] = None
    quantity: int = 0
    unit: str = "strips"
    reorder_level: int = 50
    max_stock: int = 500
    cost_price: float = 0.0
    selling_price: float = 0.0
    supplier: Optional[str] = None
    expiry_date: Optional[date] = None
    location: Optional[str] = None
    description: Optional[str] = None
    is_controlled: int = 0


class MedicineUpdate(MedicineCreate):
    pass


class MedicineOut(MedicineCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── CRUD ─────────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[MedicineOut])
def list_medicines(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    low_stock: bool = Query(False),
    expiring_soon: bool = Query(False),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Medicine)
    if search:
        q = q.filter(Medicine.name.ilike(f"%{search}%"))
    if category:
        q = q.filter(Medicine.category == category)
    if low_stock:
        q = q.filter(Medicine.quantity <= Medicine.reorder_level)
    if expiring_soon:
        threshold = date.today() + timedelta(days=90)
        q = q.filter(Medicine.expiry_date <= threshold, Medicine.expiry_date >= date.today())
    return q.offset(skip).limit(limit).all()


@router.post("/", response_model=MedicineOut, status_code=status.HTTP_201_CREATED)
def create_medicine(
    payload: MedicineCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if db.query(Medicine).filter(Medicine.sku == payload.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    med = Medicine(**payload.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    _auto_alerts(med, db)
    return med


@router.get("/{med_id}", response_model=MedicineOut)
def get_medicine(med_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    med = db.query(Medicine).filter(Medicine.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med


@router.put("/{med_id}", response_model=MedicineOut)
def update_medicine(
    med_id: int,
    payload: MedicineUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    med = db.query(Medicine).filter(Medicine.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    for k, v in payload.model_dump().items():
        setattr(med, k, v)
    med.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(med)
    _auto_alerts(med, db)
    return med


@router.delete("/{med_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(
    med_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    med = db.query(Medicine).filter(Medicine.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(med)
    db.commit()


# ─── Dashboard KPIs ───────────────────────────────────────────────────────────
@router.get("/dashboard/kpis")
def get_kpis(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    today = date.today()
    medicines = db.query(Medicine).all()

    total_medicines = len(medicines)
    total_stock_value = sum(m.quantity * m.cost_price for m in medicines)
    total_selling_value = sum(m.quantity * m.selling_price for m in medicines)
    potential_profit = total_selling_value - total_stock_value

    low_stock_items = [m for m in medicines if m.quantity <= m.reorder_level]
    critical_items = [m for m in medicines if m.quantity == 0]
    expiring_30 = [
        m for m in medicines
        if m.expiry_date and today <= m.expiry_date <= today + timedelta(days=30)
    ]
    expiring_90 = [
        m for m in medicines
        if m.expiry_date and today <= m.expiry_date <= today + timedelta(days=90)
    ]
    expired = [m for m in medicines if m.expiry_date and m.expiry_date < today]

    categories = db.query(Medicine.category, func.count(Medicine.id)).group_by(Medicine.category).all()
    unread_alerts = db.query(Alert).filter(Alert.is_read == 0).count()

    # Stock health score (0-100)
    health_score = 100
    if total_medicines > 0:
        health_score -= (len(low_stock_items) / total_medicines) * 30
        health_score -= (len(expiring_30) / total_medicines) * 25
        health_score -= (len(expired) / total_medicines) * 45
    health_score = max(0, round(health_score))

    return {
        "total_medicines": total_medicines,
        "total_stock_value": round(total_stock_value, 2),
        "total_selling_value": round(total_selling_value, 2),
        "potential_profit": round(potential_profit, 2),
        "low_stock_count": len(low_stock_items),
        "critical_count": len(critical_items),
        "expiring_30_days": len(expiring_30),
        "expiring_90_days": len(expiring_90),
        "expired_count": len(expired),
        "unread_alerts": unread_alerts,
        "health_score": health_score,
        "categories": [{"name": c[0] or "Unknown", "count": c[1]} for c in categories],
        "low_stock_items": [
            {"id": m.id, "name": m.name, "quantity": m.quantity, "reorder_level": m.reorder_level}
            for m in low_stock_items[:10]
        ],
        "expiring_soon_items": [
            {"id": m.id, "name": m.name, "expiry_date": str(m.expiry_date), "quantity": m.quantity}
            for m in expiring_30[:10]
        ],
    }


# ─── Categories helper ────────────────────────────────────────────────────────
@router.get("/meta/categories")
def get_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(Medicine.category).distinct().all()
    return [r[0] for r in rows if r[0]]


# ─── Internal: auto-create alerts ─────────────────────────────────────────────
def _auto_alerts(med: Medicine, db: Session):
    today = date.today()
    # Low stock alert
    if med.quantity <= med.reorder_level:
        existing = (
            db.query(Alert)
            .filter(Alert.medicine_id == med.id, Alert.alert_type == "low_stock", Alert.is_resolved == 0)
            .first()
        )
        if not existing:
            db.add(Alert(
                medicine_id=med.id,
                alert_type="low_stock",
                severity="critical" if med.quantity == 0 else "warning",
                title=f"Low Stock: {med.name}",
                message=f"{med.name} has only {med.quantity} {med.unit} remaining (reorder at {med.reorder_level}).",
            ))
    # Expiry alert
    if med.expiry_date and med.expiry_date <= today + timedelta(days=30):
        existing = (
            db.query(Alert)
            .filter(Alert.medicine_id == med.id, Alert.alert_type == "expiry", Alert.is_resolved == 0)
            .first()
        )
        if not existing:
            days_left = (med.expiry_date - today).days
            db.add(Alert(
                medicine_id=med.id,
                alert_type="expiry",
                severity="critical" if days_left <= 7 else "warning",
                title=f"Expiry Alert: {med.name}",
                message=f"{med.name} expires on {med.expiry_date} ({days_left} days left). Qty: {med.quantity}.",
            ))
    db.commit()
