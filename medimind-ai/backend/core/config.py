"""
Core configuration — loads from .env, provides Groq key rotation.
"""
from __future__ import annotations

import itertools
import os
from functools import lru_cache
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    APP_NAME: str = "MediMind AI"
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./medimind.db"
    SECRET_KEY: str = "change-me-in-production-32-chars!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    LLM_MODEL: str = "llama3-70b-8192"

    # Groq keys — read all numbered variants
    GROQ_API_KEY_1: str = ""
    GROQ_API_KEY_2: str = ""
    GROQ_API_KEY_3: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def groq_keys(self) -> List[str]:
        keys = [self.GROQ_API_KEY_1, self.GROQ_API_KEY_2, self.GROQ_API_KEY_3]
        return [k for k in keys if k]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


# ─── Groq Key Rotation ────────────────────────────────────────────────────────
_key_cycle: itertools.cycle | None = None


def get_next_groq_key() -> str:
    """Round-robin over available Groq API keys."""
    global _key_cycle
    settings = get_settings()
    keys = settings.groq_keys
    if not keys:
        raise ValueError(
            "No GROQ_API_KEY found. Set GROQ_API_KEY_1 (and optionally _2, _3) in .env"
        )
    if _key_cycle is None:
        _key_cycle = itertools.cycle(keys)
    return next(_key_cycle)
