from __future__ import annotations
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from core.config import get_next_groq_key, get_settings

settings = get_settings()

class BaseAgent:
    system_prompt: str = "You are a helpful medical inventory AI agent."

    def _build_llm(self) -> ChatGroq:
        return ChatGroq(
            api_key=get_next_groq_key(),
            model_name=settings.LLM_MODEL,
            temperature=0.2,
            max_tokens=1024,
        )

    async def ask(self, user_message: str, extra_context: str = "") -> str:
        llm = self._build_llm()
        messages = [SystemMessage(content=self.system_prompt)]
        if extra_context:
            messages.append(HumanMessage(content=f"Context:\n{extra_context}"))
        messages.append(HumanMessage(content=user_message))
        response = await llm.ainvoke(messages)
        return response.content.strip()
