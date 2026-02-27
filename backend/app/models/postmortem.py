from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Postmortem(BaseModel):
    id: Optional[str] = None
    company: str
    title: str
    url: str
    published_at: Optional[datetime] = None
    severity: Optional[str] = None
    affected_services: Optional[list[str]] = []
    root_cause_category: Optional[str] = None
    ai_summary: Optional[str] = None
    tags: Optional[list[str]] = []
    status: str = "pending"  # pending | published
    created_at: Optional[datetime] = None
