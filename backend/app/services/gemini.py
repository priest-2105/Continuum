import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

PROMPT_TEMPLATE = """You are a site reliability engineering analyst reviewing public software incidents.

Based on the metadata below, write a concise 120-140 word technical summary of this incident. Cover: what likely happened, which systems were affected, the business impact, and the typical resolution approach for this type of incident. Write in clear, technical language. Third person, past tense. No bullet points.

Incident: {title}
Company: {company}
Severity: {severity}
Date: {date}
Tags: {tags}"""


async def generate_summary(post: dict) -> str:
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment")

    prompt = PROMPT_TEMPLATE.format(
        title=post.get("title", "Unknown incident"),
        company=post.get("company", "Unknown"),
        severity=post.get("severity", "unknown"),
        date=(post.get("published_at") or "")[:10],
        tags=", ".join(post.get("tags") or []),
    )

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            _API_URL,
            params={"key": settings.gemini_api_key},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 300, "temperature": 0.4},
            },
        )
        if not resp.is_success:
            logger.error("Gemini API error %s: %s", resp.status_code, resp.text)
            resp.raise_for_status()
        data = resp.json()

    candidates = data.get("candidates", [])
    if not candidates:
        logger.error("Gemini returned no candidates. Response: %s", data)
        raise ValueError("Gemini returned no candidates")

    return candidates[0]["content"]["parts"][0]["text"].strip()
