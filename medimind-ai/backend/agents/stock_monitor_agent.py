"""
Stock Monitor Agent — analyzes current inventory levels and raises alerts.
"""
from __future__ import annotations
import json
from typing import Any, Dict, List
from agents.base_agent import BaseAgent


class StockMonitorAgent(BaseAgent):
    system_prompt = """You are the MediMind Stock Monitor Agent.
Your job is to analyze medicine inventory data and identify:
1. Critically low stock (below reorder level)
2. Overstocked items (above max stock)
3. Fast-moving medicines that need immediate attention
4. Slow-moving medicines with excess inventory

Respond with a concise structured analysis. Use plain text with bullet points.
Always end with an "Action Required" section if any critical items are found.
Be specific — mention medicine names, quantities, and urgency levels."""

    async def analyze_inventory(self, medicines: List[Dict[str, Any]]) -> str:
        if not medicines:
            return "No inventory data available for analysis."

        context = json.dumps(
            [
                {
                    "name": m.get("name"),
                    "sku": m.get("sku"),
                    "quantity": m.get("quantity"),
                    "reorder_level": m.get("reorder_level"),
                    "max_stock": m.get("max_stock"),
                    "category": m.get("category"),
                    "expiry_date": str(m.get("expiry_date", "N/A")),
                }
                for m in medicines
            ],
            indent=2,
        )

        return await self.ask(
            "Analyze this inventory. Identify critical stock issues and provide actionable recommendations.",
            extra_context=context,
        )

    async def get_low_stock_summary(self, low_stock_items: List[Dict]) -> str:
        if not low_stock_items:
            return "✅ All medicines are adequately stocked."
        context = json.dumps(low_stock_items, indent=2)
        return await self.ask(
            "Provide a brief, urgent summary of these low-stock medicines. Prioritize by criticality.",
            extra_context=context,
        )
