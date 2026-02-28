from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.core.config import settings
from app.db.supabase import get_client

router = APIRouter(prefix="/admin/sources", tags=["sources"])


def require_admin(x_admin_secret: str):
    if x_admin_secret != settings.admin_secret:
        raise HTTPException(status_code=403, detail="Forbidden")


class SourceCreate(BaseModel):
    company: str
    slug: str
    method: str = "github_json"
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


@router.post("/{id}/sync")
async def sync_source(id: str, x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    db = await get_client()

    src_result = await db.table("sources").select("*").eq("id", id).execute()
    if not src_result.data:
        raise HTTPException(status_code=404, detail="Source not found")
    source = src_result.data[0]

    if source["method"] != "github_json":
        return {"message": "not yet implemented"}

    config = source.get("config") or {}
    repo = config.get("repo", "")
    file = config.get("file", "")
    if not repo or not file:
        raise HTTPException(status_code=400, detail="github_json source requires config.repo and config.file")

    params: dict = {"path": file, "per_page": 30}
    last_synced = source.get("last_synced_at")
    if last_synced:
        params["since"] = last_synced

    headers = {"Accept": "application/vnd.github+json"}
    github_token = getattr(settings, "github_token", None)
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/repos/{repo}/commits",
            params=params,
            headers=headers,
            timeout=15,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"GitHub API error: {resp.status_code} {resp.text}")
        commits = resp.json()

    slug = source["slug"]
    company = source["company"]
    created = 0

    for commit in commits:
        sha = commit["sha"]
        short_sha = sha[:12]
        entry_id = f"{slug}-{short_sha}"
        message = commit["commit"]["message"].split("\n")[0]
        html_url = commit["html_url"]
        author_date = commit["commit"]["author"]["date"]

        row = {
            "id": entry_id,
            "title": message,
            "company": company,
            "url": html_url,
            "published_at": author_date,
            "tags": ["github", "outage", slug],
            "status": "pending",
        }

        existing = await db.table("postmortems").select("id").eq("id", entry_id).execute()
        if not existing.data:
            await db.table("postmortems").insert(row).execute()
            created += 1

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.table("sources").update({"last_synced_at": now_iso}).eq("id", id).execute()

    return {"created": created}
