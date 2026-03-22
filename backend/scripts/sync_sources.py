"""
sync_sources.py — Standalone Statuspage sync script
----------------------------------------------------
Reads all active statuspage_api sources from Supabase, paginates through
the full incident history, and inserts any new incidents as published.

Run:
    python backend/scripts/sync_sources.py

Env vars required:
    SUPABASE_URL
    SUPABASE_KEY
"""

import os
import sys
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

_SEVERITY_MAP = {
    "minor":    "medium",
    "major":    "high",
    "critical": "critical",
}

PER_PAGE = 100


def fetch_all_incidents(page_url: str, last_synced: str | None) -> list[dict]:
    """Paginate through /api/v2/incidents.json, stop when we hit already-seen dates."""
    all_incidents: list[dict] = []
    page = 1

    while True:
        resp = requests.get(
            f"{page_url}/api/v2/incidents.json",
            params={"page": page, "per_page": PER_PAGE},
            headers={"Accept": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        batch = resp.json().get("incidents", [])

        if not batch:
            break

        stop_early = False
        for inc in batch:
            created_at = inc.get("created_at", "")
            if last_synced and created_at and created_at <= last_synced:
                stop_early = True
                break
            all_incidents.append(inc)

        if stop_early or len(batch) < PER_PAGE:
            break

        page += 1

    return all_incidents


def sync_source(db, source: dict) -> int:
    config      = source.get("config") or {}
    page_url    = config.get("statuspage_url", "").strip().rstrip("/")
    slug        = source["slug"]
    company     = source["company"]
    last_synced = source.get("last_synced_at")
    source_id   = source["id"]

    if not page_url:
        print(f"  [skip] {slug}: no statuspage_url configured")
        return 0
    if not page_url.startswith("http"):
        page_url = f"https://{page_url}"

    print(f"  Fetching {page_url} ...")
    try:
        incidents = fetch_all_incidents(page_url, last_synced)
    except Exception as e:
        print(f"  [error] {slug}: {e}")
        return 0

    print(f"  Found {len(incidents)} new incident(s)")

    created = 0
    for incident in incidents:
        impact = incident.get("impact", "none")
        if impact in ("none", "maintenance"):
            continue

        incident_id = incident.get("id", "")
        if not incident_id:
            continue

        entry_id   = f"{slug}-{incident_id[:12]}"
        title      = incident.get("name") or f"{company}: Service Disruption"
        severity   = _SEVERITY_MAP.get(impact, "medium")
        shortlink  = incident.get("shortlink") or f"{page_url}/incidents/{incident_id}"
        created_at = incident.get("created_at", "")

        existing = db.table("postmortems").select("id").eq("id", entry_id).execute()
        if not existing.data:
            db.table("postmortems").insert({
                "id":           entry_id,
                "title":        title,
                "company":      company,
                "url":          shortlink,
                "source_url":   page_url,
                "published_at": created_at,
                "severity":     severity,
                "tags":         ["statuspage", slug, impact],
                "status":       "published",
            }).execute()
            created += 1
            print(f"    + {title[:80]}")

    # Update last_synced_at
    db.table("sources").update(
        {"last_synced_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", source_id).execute()

    return created


def main():
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL and SUPABASE_KEY must be set")
        sys.exit(1)

    db = create_client(supabase_url, supabase_key)

    result = db.table("sources").select("*").eq("method", "statuspage_api").eq("active", True).execute()
    sources = result.data

    if not sources:
        print("No active statuspage_api sources found.")
        return

    print(f"Syncing {len(sources)} source(s)...\n")
    total_created = 0

    for source in sources:
        print(f"[{source['company']}] {source['slug']}")
        created = sync_source(db, source)
        total_created += created
        print(f"  Done — {created} new\n")

    print(f"Sync complete. {total_created} total new incidents published.")


if __name__ == "__main__":
    main()
