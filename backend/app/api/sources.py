import json as json_lib
from datetime import datetime, timezone
from typing import AsyncGenerator

import httpx
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.core.config import settings
from app.db.supabase import get_client

router = APIRouter(prefix="/admin/sources", tags=["sources"])

# Statuspage indicator → severity
_SEVERITY_MAP = {
    "minor":    "medium",
    "major":    "high",
    "critical": "critical",
}


def require_admin(x_admin_secret: str):
    if x_admin_secret != settings.admin_secret:
        raise HTTPException(status_code=403, detail="Forbidden")


class SourceCreate(BaseModel):
    company: str
    slug: str
    method: str = "statuspage_api"
    config: dict = {}
    active: bool = True


@router.get("")
async def list_sources(x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    db = await get_client()
    result = await db.table("sources").select("*").order("created_at", desc=True).execute()
    return result.data


@router.post("")
async def create_source(body: SourceCreate, x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    db = await get_client()
    result = await db.table("sources").insert({
        "company": body.company,
        "slug": body.slug,
        "method": body.method,
        "config": body.config,
        "active": body.active,
    }).execute()
    return result.data[0]


@router.delete("/{id}")
async def delete_source(id: str, x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    db = await get_client()
    await db.table("sources").delete().eq("id", id).execute()
    return {"deleted": id}


async def _sync_statuspage_api(source: dict, db) -> AsyncGenerator[dict, None]:
    config   = source.get("config") or {}
    page_url = config.get("statuspage_url", "").strip().rstrip("/")
    if not page_url:
        yield {"type": "error", "message": "statuspage_api source requires config.statuspage_url"}
        return
    if not page_url.startswith("http"):
        page_url = f"https://{page_url}"

    slug        = source["slug"]
    company     = source["company"]
    last_synced = source.get("last_synced_at")

    yield {"type": "start", "message": f"Fetching incidents from {page_url}..."}

    # Paginate through all incidents (100 per page, newest first)
    # Stop early once we've passed last_synced_at (incremental runs)
    all_incidents: list[dict] = []
    page = 1
    per_page = 100
    stop_early = False

    async with httpx.AsyncClient(follow_redirects=True) as paginator:
        while True:
            try:
                r = await paginator.get(
                    f"{page_url}/api/v2/incidents.json",
                    params={"page": page, "per_page": per_page},
                    headers={"Accept": "application/json"},
                    timeout=15,
                )
            except httpx.RequestError as e:
                yield {"type": "error", "message": f"Request failed: {e}"}
                return

            if r.status_code != 200:
                yield {"type": "error", "message": f"Statuspage API error {r.status_code} on page {page}: {r.text[:300]}"}
                return

            try:
                batch = r.json().get("incidents", [])
            except Exception:
                yield {"type": "error", "message": f"Non-JSON response from {page_url}/api/v2/incidents.json — check the URL"}
                return
            if not batch:
                break

            for inc in batch:
                created_at = inc.get("created_at", "")
                if last_synced and created_at and created_at <= last_synced:
                    stop_early = True
                    break
                all_incidents.append(inc)

            if stop_early or len(batch) < per_page:
                break

            page += 1

    yield {
        "type": "commits_done",
        "total": len(all_incidents),
        "sampling": len(all_incidents),
        "step": 1,
        "message": f"Found {len(all_incidents)} incidents across {page} page(s)",
    }

    created = 0
    for incident in all_incidents:
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

        existing = await db.table("postmortems").select("id").eq("id", entry_id).execute()
        if not existing.data:
            await db.table("postmortems").insert({
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
            yield {"type": "incident", "title": title, "id": entry_id, "severity": severity}

    yield {"type": "done", "created": created}


@router.post("/{id}/sync")
async def sync_source(id: str, x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    db = await get_client()

    src_result = await db.table("sources").select("*").eq("id", id).execute()
    if not src_result.data:
        raise HTTPException(status_code=404, detail="Source not found")
    source = src_result.data[0]

    async def generate():
        try:
            gen = _sync_statuspage_api(source, db)

            completed = False
            async for event in gen:
                yield f"data: {json_lib.dumps(event)}\n\n"
                if event.get("type") == "done":
                    completed = True

            if completed:
                await db.table("sources").update(
                    {"last_synced_at": datetime.now(timezone.utc).isoformat()}
                ).eq("id", id).execute()

        except Exception as e:
            yield f"data: {json_lib.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
