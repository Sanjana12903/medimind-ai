"""
Demand Forecast Agent — predicts medicine demand based on seasonality and trends.
"""
from __future__ import annotations
import json
from typing import Any, Dict, List
from agents.base_agent import BaseAgent


class DemandForecastAgent(BaseAgent):
    system_prompt = """You are the MediMind Demand Forecast Agent for India.
You analyze medical inventory trends and predict future demand based on:
- Current stock levels and historical movement
- Indian seasonal disease patterns (monsoon diseases, winter ailments, summer conditions)
- Category-based demand cycles
- Regional health trends

Provide specific quantity forecasts and confidence levels.
Format: Medicine name → Predicted demand → Reason → Recommended stock level."""

    async def forecast(self, medicines: List[Dict[str, Any]], season: str = "current") -> str:
        context = json.dumps(
            [{"name": m.get("name"), "category": m.get("category"),
              "quantity": m.get("quantity"), "reorder_level": m.get("reorder_level")} for m in medicines],
            indent=2,
        )
        return await self.ask(
            f"Forecast demand for the next 30 days. Current season context: {season}. "
            "Provide medicine-wise predictions with specific quantities.",
            extra_context=context,
        )


class PurchaseGuideAgent(BaseAgent):
    system_prompt = """You are the MediMind Purchase Guide Agent.
Your role is to generate optimized purchase recommendations for a medical store/pharmacy.
Consider:
- Current stock vs reorder levels
- Expiry dates of existing stock
- Demand forecasts
- Cost optimization (avoid overstocking)
- Supplier reliability

Output a structured purchase order with:
- Medicine name
- Recommended quantity to order
- Urgency (Immediate / This Week / This Month)
- Estimated cost consideration
- Supplier suggestion if known"""

    async def generate_purchase_list(
        self, low_stock: List[Dict], expiring: List[Dict], forecast: str
    ) -> str:
        context = json.dumps(
            {"low_stock_items": low_stock, "expiring_soon": expiring, "demand_forecast": forecast},
            indent=2,
        )
        return await self.ask(
            "Generate a comprehensive purchase order recommendation. "
            "Prioritize by urgency and include specific quantities.",
            extra_context=context,
        )

    async def optimize_order(self, draft_order: Dict) -> str:
        context = json.dumps(draft_order, indent=2)
        return await self.ask(
            "Review this draft purchase order. Suggest optimizations for cost and timing.",
            extra_context=context,
        )


class ExpiryWatchAgent(BaseAgent):
    system_prompt = """You are the MediMind Expiry Watch Agent.
Monitor medicine expiry dates and provide:
- Medicines expiring within 30 days (CRITICAL)
- Medicines expiring within 90 days (WARNING)
- Disposal recommendations for expired stock
- Strategies to sell near-expiry stock first (FIFO recommendations)
- Financial impact of potential losses

Be precise with dates and quantities."""

    async def check_expiry(self, medicines: List[Dict[str, Any]], today: str) -> str:
        context = json.dumps(
            [{"name": m.get("name"), "quantity": m.get("quantity"),
              "expiry_date": str(m.get("expiry_date")), "cost_price": m.get("cost_price"),
              "selling_price": m.get("selling_price")} for m in medicines],
            indent=2,
        )
        return await self.ask(
            f"Today's date: {today}. Analyze expiry status. Calculate potential financial loss "
            "from near-expiry stock. Provide FIFO recommendations.",
            extra_context=context,
        )


class ComplianceAgent(BaseAgent):
    system_prompt = """You are the MediMind Compliance Agent for Indian pharmacy regulations.
Monitor and advise on:
- Controlled substance inventory limits (Schedule H, H1, X drugs)
- Proper storage temperature requirements
- Documentation requirements (batch numbers, expiry tracking)
- GST compliance for medicine categories
- Narcotics and psychotropic substance regulations
- License renewal reminders

Provide clear, actionable compliance guidance. Flag any violations immediately."""

    async def check_compliance(self, medicines: List[Dict[str, Any]]) -> str:
        controlled = [m for m in medicines if m.get("is_controlled")]
        context = json.dumps(
            {"all_medicines_count": len(medicines), "controlled_substances": controlled},
            indent=2,
        )
        return await self.ask(
            "Perform a compliance check. Identify any regulatory concerns and provide guidance.",
            extra_context=context,
        )
