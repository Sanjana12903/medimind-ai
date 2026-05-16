"""
Copilot Agent — natural language interface that orchestrates all other agents.
"""
from __future__ import annotations
import json
from typing import Any, Dict, List, Optional
from agents.base_agent import BaseAgent


class CopilotAgent(BaseAgent):
    system_prompt = """You are MediMind, an intelligent AI assistant for pharmacy and medical store management.
You help pharmacists and store managers with:
- Inventory queries ("How many Paracetamol strips do we have?")
- Purchase guidance ("What should I order this week?")
- Expiry alerts ("What medicines are expiring soon?")
- Demand insights ("Which medicines sell most in monsoon?")
- Financial analysis ("What's our stock value?")
- Compliance questions ("Is our Schedule H documentation complete?")

You have access to the current inventory context. Be conversational but precise.
Always provide specific numbers when available. If unsure, say so clearly.
Suggest follow-up actions when appropriate.
You are optimized for Indian pharmacy operations."""

    async def chat(
        self,
        user_message: str,
        inventory_snapshot: List[Dict[str, Any]],
        conversation_history: Optional[List[Dict]] = None,
    ) -> str:
        # Build context from inventory
        total_value = sum(
            (m.get("quantity", 0) * m.get("cost_price", 0)) for m in inventory_snapshot
        )
        low_stock = [m for m in inventory_snapshot if m.get("quantity", 0) <= m.get("reorder_level", 50)]
        categories = list({m.get("category", "Unknown") for m in inventory_snapshot})

        context = json.dumps(
            {
                "total_medicines": len(inventory_snapshot),
                "total_inventory_value": round(total_value, 2),
                "low_stock_count": len(low_stock),
                "categories": categories,
                "inventory_sample": inventory_snapshot[:20],  # top 20 for context window
                "recent_conversation": conversation_history[-4:] if conversation_history else [],
            },
            indent=2,
            default=str,
        )
        return await self.ask(user_message, extra_context=context)


class AICouncilOrchestrator(BaseAgent):
    system_prompt = """You are the MediMind AI Council Orchestrator.
You synthesize insights from multiple specialist agents into a unified decision report.
Format your response as a structured intelligence briefing with sections:
1. 🔴 Critical Actions Required
2. 🟡 Warnings & Recommendations  
3. 🟢 Positive Indicators
4. 📊 Summary Metrics
5. 🎯 Top 3 Priority Actions for Today

Be concise, actionable, and data-driven."""

    async def synthesize(
        self,
        stock_analysis: str,
        demand_forecast: str,
        expiry_report: str,
        compliance_report: str,
        purchase_recommendation: str,
    ) -> str:
        context = json.dumps(
            {
                "stock_analysis": stock_analysis,
                "demand_forecast": demand_forecast,
                "expiry_report": expiry_report,
                "compliance_report": compliance_report,
                "purchase_recommendation": purchase_recommendation,
            },
            indent=2,
        )
        return await self.ask(
            "Synthesize all agent reports into a unified intelligence briefing for today.",
            extra_context=context,
        )
