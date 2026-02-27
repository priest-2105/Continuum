"""
Etsy "Code as Craft" Incident Handler
--------------------------------------
Source: https://www.etsy.com/codeascraft
RSS:    https://www.etsy.com/codeascraft/feed

Legal: Etsy blog content is under copyright.
Strategy: metadata + link only — no full content mirroring.

Stores: title, url, published_at, excerpt, tags → Supabase (status=pending)
Admin must review and publish each entry.
"""

import os
import sys
import hashlib
import feedparser
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

FEED_URL = "https://www.etsy.com/codeascraft/feed"
COMPANY = "etsy"

# Tags that suggest this is an incident/postmortem post
INCIDENT_KEYWORDS = [
    "incident", "outage", "postmortem", "post-mortem",
    "reliability", "downtime", "degradation", "failure",
    "root cause", "retrospective", "resilience",
]


def is_incident_post(entry: dict) -> bool:
    """Heuristic filter — only collect posts likely to be postmortems."""
    text = (
        entry.get("title", "") + " " +
        entry.get("summary", "") + " " +
        " ".join(t.get("term", "") for t in entry.get("tags", []))
    ).lower()
    return any(kw in text for kw in INCIDENT_KEYWORDS)


def make_id(url: str) -> str:
    """Stable ID from URL so re-runs don't create duplicates."""
    return hashlib.sha256(url.encode()).hexdigest()[:16]


def parse_date(entry: dict) -> str | None:
    if entry.get("published_parsed"):
        dt = datetime(*entry["published_parsed"][:6], tzinfo=timezone.utc)
        return dt.isoformat()
    return None


def extract_tags(entry: dict) -> list[str]:
    return [t.get("term", "") for t in entry.get("tags", []) if t.get("term")]


def run():
    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_KEY"]
    db = create_client(supabase_url, supabase_key)

    print(f"[etsy-handler] Fetching feed: {FEED_URL}")
    feed = feedparser.parse(FEED_URL)

    if feed.bozo:
        print(f"[etsy-handler] Feed parse warning: {feed.bozo_exception}")

    new_count = 0

    for entry in feed.entries:
        if not is_incident_post(entry):
            continue

        entry_id = make_id(entry.get("link", entry.get("id", "")))

        # Skip if already stored
        existing = db.table("postmortems").select("id").eq("id", entry_id).execute()
        if existing.data:
            continue

        record = {
            "id": entry_id,
            "company": COMPANY,
            "title": entry.get("title", "Untitled"),
            "url": entry.get("link", ""),
            "published_at": parse_date(entry),
            "tags": extract_tags(entry),
            "ai_summary": None,
            "root_cause_category": None,
            "severity": None,
            "affected_services": [],
            "status": "pending",
        }

        db.table("postmortems").insert(record).execute()
        print(f"[etsy-handler] Queued: {record['title']}")
        new_count += 1

    print(f"[etsy-handler] Done. {new_count} new entries queued.")


if __name__ == "__main__":
    run()
