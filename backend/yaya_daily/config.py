"""Shared LLM configuration for ADK agents (OpenAI via LiteLLM)."""

from __future__ import annotations

import os

from google.adk.models.lite_llm import LiteLlm

# Override with OPENAI_MODEL in .env (e.g. openai/gpt-4o-mini, openai/gpt-4o)
DEFAULT_OPENAI_MODEL = "openai/gpt-4o-mini"


def get_llm_model() -> LiteLlm:
    """Return a LiteLLM-backed model. Requires OPENAI_API_KEY in the environment."""
    model_id = os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL).strip()
    if not model_id.startswith("openai/"):
        model_id = f"openai/{model_id.removeprefix('openai-')}"
    return LiteLlm(model=model_id)


def ensure_api_key() -> None:
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key or key.startswith("YOUR_"):
        raise RuntimeError(
            "OPENAI_API_KEY is missing or placeholder. "
            "Set it in backend/.env or backend/yaya_daily/.env"
        )
