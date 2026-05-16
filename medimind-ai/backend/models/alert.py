from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=True)
    alert_type = Column(String(50))   # low_stock | expiry | demand_spike | compliance
    severity = Column(String(20))     # critical | warning | info
    title = Column(String(300))
    message = Column(Text)
    is_read = Column(Integer, default=0)
    is_resolved = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True)
    status = Column(String(50), default="pending")  # pending | approved | ordered | received
    items = Column(JSON)            # [{medicine_id, name, qty, unit_cost}]
    total_cost = Column(Float, default=0.0)
    supplier = Column(String(200))
    ai_recommendation = Column(Text)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
