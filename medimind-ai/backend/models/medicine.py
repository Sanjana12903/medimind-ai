from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String, Date, Text
from database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    generic_name = Column(String(200))
    category = Column(String(100), index=True)          # Antibiotic, Analgesic, etc.
    manufacturer = Column(String(200))
    sku = Column(String(100), unique=True, index=True)
    batch_number = Column(String(100))
    quantity = Column(Integer, default=0)
    unit = Column(String(50), default="strips")         # strips | bottles | vials
    reorder_level = Column(Integer, default=50)         # trigger alert below this
    max_stock = Column(Integer, default=500)
    cost_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    supplier = Column(String(200))
    expiry_date = Column(Date, nullable=True)
    location = Column(String(100))                      # shelf / rack code
    description = Column(Text, nullable=True)
    is_controlled = Column(Integer, default=0)          # 1 = controlled substance
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
