"""
AI Agent routes — all agent endpoints with full council orchestration.
"""
import asyncio
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents import (
    AICouncilOrchestrator,
    ComplianceAgent,
    CopilotAgent,
    DemandForecastAgent,
    ExpiryWatchAgent,
    PurchaseGuideAgent,
    StockMonitorAgent,
)
from database import get_db
from models.medicine import Medicine
from routes.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/agents", tags=["agents"])


def _medicines_to_dicts(medicines):
    return [
        {
            "id": m.id,
            "name": m.name,
            "category": m.category,
            "quantity": m.quantity,
            "reorder_level": m.reorder_level,
            "max_stock": m.max_stock,
            "cost_price": m.cost_price,
            "selling_price": m.selling_price,
            "expiry_date": str(m.expiry_date) if m.expiry_date else None,
            "sku": m.sku,
            "supplier": m.supplier,
            "is_controlled": m.is_controlled,
            "unit": m.unit,
        }
        for m in medicines
    ]


# ─── Copilot Chat ─────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    message: str
    history: Optional[List[dict]] = []


@router.post("/copilot/chat")
async def copilot_chat(
    payload: ChatMessage,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    medicines = db.query(Medicine).all()
    agent = CopilotAgent()
    response = await agent.chat(
        payload.message,
        _medicines_to_dicts(medicines),
        payload.history,
    )
    return {"response": response, "agent": "copilot"}


# ─── Stock Analysis ───────────────────────────────────────────────────────────
@router.get("/stock/analyze")
async def analyze_stock(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    medicines = db.query(Medicine).all()
    agent = StockMonitorAgent()
    result = await agent.analyze_inventory(_medicines_to_dicts(medicines))
    return {"analysis": result, "agent": "stock_monitor"}


# ─── Demand Forecast ─────────────────────────────────────────────────────────
@router.get("/demand/forecast")
async def demand_forecast(
    season: str = "current (May - pre-monsoon India)",
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    medicines = db.query(Medicine).all()
    agent = DemandForecastAgent()
    result = await agent.forecast(_medicines_to_dicts(medicines), season)
    return {"forecast": result, "agent": "demand_forecast"}


# ─── Purchase Recommendations ─────────────────────────────────────────────────
@router.get("/purchase/recommend")
async def purchase_recommend(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    medicines = db.query(Medicine).all()
    med_dicts = _medicines_to_dicts(medicines)
    today = date.today()

    low_stock = [m for m in med_dicts if m["quantity"] <= m["reorder_level"]]
    expiring = [
        m for m in med_dicts
        if m["expiry_date"] and m["expiry_date"] <= str(today.replace(day=today.day + 30))
    ]

    forecast_agent = DemandForecastAgent()
    forecast = await forecast_agent.forecast(med_dicts)

    purchase_agent = PurchaseGuideAgent()
    result = await purchase_agent.generate_purchase_list(low_stock, expiring, forecast)
    return {"recommendation": result, "agent": "purchase_guide", "low_stock_count": len(low_stock)}


# ─── Expiry Report ────────────────────────────────────────────────────────────
@router.get("/expiry/report")
async def expiry_report(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    medicines = db.query(Medicine).all()
    agent = ExpiryWatchAgent()
    result = await agent.check_expiry(_medicines_to_dicts(medicines), str(date.today()))
    return {"report": result, "agent": "expiry_watch"}


# ─── Compliance Check ─────────────────────────────────────────────────────────
@router.get("/compliance/check")
async def compliance_check(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    medicines = db.query(Medicine).all()
    agent = ComplianceAgent()
    result = await agent.check_compliance(_medicines_to_dicts(medicines))
    return {"report": result, "agent": "compliance"}


# ─── AI Council — Full Intelligence Report ────────────────────────────────────
@router.get("/council/report")
async def council_report(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    medicines = db.query(Medicine).all()
    med_dicts = _medicines_to_dicts(medicines)
    today = str(date.today())

    # Run all agents in parallel
    stock_agent = StockMonitorAgent()
    demand_agent = DemandForecastAgent()
    expiry_agent = ExpiryWatchAgent()
    compliance_agent = ComplianceAgent()

    stock_task = stock_agent.analyze_inventory(med_dicts)
    demand_task = demand_agent.forecast(med_dicts)
    expiry_task = expiry_agent.check_expiry(med_dicts, today)
    compliance_task = compliance_agent.check_compliance(med_dicts)

    stock_r, demand_r, expiry_r, compliance_r = await asyncio.gather(
        stock_task, demand_task, expiry_task, compliance_task
    )

    low_stock = [m for m in med_dicts if m["quantity"] <= m["reorder_level"]]
    expiring = [m for m in med_dicts if m.get("expiry_date")]
    purchase_agent = PurchaseGuideAgent()
    purchase_r = await purchase_agent.generate_purchase_list(low_stock, expiring, demand_r)

    orchestrator = AICouncilOrchestrator()
    council_r = await orchestrator.synthesize(stock_r, demand_r, expiry_r, compliance_r, purchase_r)

    return {
        "council_report": council_r,
        "stock_analysis": stock_r,
        "demand_forecast": demand_r,
        "expiry_report": expiry_r,
        "compliance_report": compliance_r,
        "purchase_recommendation": purchase_r,
        "agent": "ai_council",
    }
