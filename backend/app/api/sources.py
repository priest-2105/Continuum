import asyncio
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
    method: str = "github_json"
    config: dict = {}
    active: bool = True


def _parse_next_link(link_header: str) -> str | None:
    """Extract the 'next' URL from a GitHub Link header."""
    for part in link_header.split(","):
        segments = part.strip().split(";")
        if len(segments) == 2 and segments[1].strip() == 'rel="next"':
            return segments[0].strip().strip("<>")
    return None


def _github_headers() -> dict:
    h = {"Accept": "application/vnd.github+json"}
    token = getattr(settings, "github_token", None)
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def _parse_statuspage(raw: str) -> dict | None:
    """Return parsed dict if raw looks like a Statuspage JSON snapshot, else None."""
    try:
        d = json_lib.loads(raw)
        if "status" in d and "indicator" in d["status"]:
            return d
    except Exception:
        pass
    return None


async def _fetch_file_at_sha(
    client: httpx.AsyncClient,
    repo: str,
    file: str,
    sha: str,
    headers: dict,
    semaphore: asyncio.Semaphore,
) -> str | None:
    """Fetch raw file content at a specific commit SHA via raw.githubusercontent.com (no 1MB limit)."""
    async with semaphore:
        try:
            r = await client.get(
                f"https://raw.githubusercontent.com/{repo}/{sha}/{file}",
                headers={"Authorization": headers.get("Authorization", "")} if "Authorization" in headers else {},
                timeout=20,
            )
            if r.status_code != 200:
                return None
            return r.text
        except Exception:
            return None


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


async def _sync_github_json(source: dict, db) -> AsyncGenerator[dict, None]:
    config  = source.get("config") or {}
    repo    = config.get("repo", "")
    file    = config.get("file", "")
    branch  = config.get("branch", "main")
    if not repo or not file:
        yield {"type": "error", "message": "github_json source requires config.repo and config.file"}
        return

    slug    = source["slug"]
    company = source["company"]
    headers = _github_headers()

    # Companion summary file: cloudflare_outages.json → cloudflare_summary.json
    summary_file = file.replace("_outages.json", "_summary.json") if "_outages.json" in file else None

    last_synced = source.get("last_synced_at")
    since = last_synced or config.get("since_date", "2022-01-01T00:00:00Z")

    yield {"type": "start", "message": f"Finding commits since {since[:10]}..."}

    # ── 1. Paginate through ALL commits since `since` ─────────────────────────
    all_commits: list[dict] = []
    next_url: str | None = f"https://api.github.com/repos/{repo}/commits"
    page_params: dict = {"path": file, "per_page": 100, "sha": branch, "since": since}

    async with httpx.AsyncClient() as client:
        while next_url:
            resp = await client.get(next_url, params=page_params, headers=headers, timeout=30)
            if resp.status_code != 200:
                yield {"type": "error", "message": f"GitHub API error {resp.status_code}: {resp.text[:200]}"}
                return
            page = resp.json()
            if not page:
                break
            all_commits.extend(page)
            page_params = {}  # next_url already has query params
            next_url = _parse_next_link(resp.headers.get("link", ""))
            yield {"type": "commits_page", "total": len(all_commits)}

        if not all_commits:
            yield {"type": "done", "created": 0, "message": "No new commits found"}
            return

        # ── 2. Sample commits ──────────────────────────────────────────────────
        step = max(1, len(all_commits) // 500)
        commits_to_process = all_commits[::step] if summary_file else all_commits
        total_to_fetch = len(commits_to_process)

        if summary_file:
            yield {
                "type": "commits_done",
                "total": len(all_commits),
                "sampling": total_to_fetch,
                "step": step,
                "message": f"Found {len(all_commits)} commits → sampling {total_to_fetch} snapshots",
            }
        else:
            yield {
                "type": "commits_done",
                "total": len(all_commits),
                "sampling": total_to_fetch,
                "step": 1,
                "message": f"Found {len(all_commits)} commits to process",
            }

        # ── 3. Fetch snapshots in batches so we can stream progress ────────────
        semaphore  = asyncio.Semaphore(5)
        batch_size = 25
        raw_summaries: list[str | None] = []
        raw_outages:   list[str | None] = []

        if summary_file:
            for i in range(0, total_to_fetch, batch_size):
                batch = commits_to_process[i : i + batch_size]
                results = await asyncio.gather(*[
                    _fetch_file_at_sha(client, repo, summary_file, c["sha"], headers, semaphore)
                    for c in batch
                ])
                raw_summaries.extend(results)
                yield {"type": "fetching", "done": min(i + batch_size, total_to_fetch), "total": total_to_fetch}
            raw_outages = [None] * total_to_fetch
        else:
            for i in range(0, total_to_fetch, batch_size):
                batch = commits_to_process[i : i + batch_size]
                results = await asyncio.gather(*[
                    _fetch_file_at_sha(client, repo, file, c["sha"], headers, semaphore)
                    for c in batch
                ])
                raw_outages.extend(results)
                yield {"type": "fetching", "done": min(i + batch_size, total_to_fetch), "total": total_to_fetch}
            raw_summaries = [None] * total_to_fetch

    # ── 4. Parse and insert ───────────────────────────────────────────────────
    created = 0
    seen_incident_ids: set[str] = set()

    for commit, raw_outage, raw_summary in zip(commits_to_process, raw_outages, raw_summaries):
        sha = commit["sha"]

        # Priority: named incidents from summary file
        if raw_summary:
            try:
                summary = json_lib.loads(raw_summary)
                for incident in summary.get("incidents", []):
                    impact = incident.get("impact", "none")
                    if impact in ("none", "maintenance"):
                        continue
                    inc_id = incident.get("id", "")
                    if not inc_id or inc_id in seen_incident_ids:
                        continue
                    seen_incident_ids.add(inc_id)

                    entry_id     = f"{slug}-{inc_id[:12]}"
                    title        = incident.get("name") or f"{company}: Incident"
                    shortlink    = incident.get("shortlink") or f"https://github.com/{repo}/blob/{sha}/{summary_file}"
                    published_at = incident.get("created_at") or commit["commit"]["author"]["date"]
                    severity     = _SEVERITY_MAP.get(impact, "medium")

                    existing = await db.table("postmortems").select("id").eq("id", entry_id).execute()
                    if not existing.data:
                        await db.table("postmortems").insert({
                            "id": entry_id, "title": title, "company": company,
                            "url": shortlink, "published_at": published_at,
                            "severity": severity,
                            "tags": ["github", "outage", slug, impact],
                            "status": "pending",
                        }).execute()
                        created += 1
                        yield {"type": "incident", "title": title, "id": entry_id, "severity": severity}
                continue  # skip outage fallback for this commit
            except Exception:
                pass

        # Fallback: outage snapshot
        entry_id = f"{slug}-{sha[:12]}"
        parsed   = _parse_statuspage(raw_outage) if raw_outage else None

        if parsed:
            indicator   = parsed["status"]["indicator"]
            if indicator == "none":
                continue
            description = parsed["status"].get("description", "Service Disruption")
            page_name   = parsed.get("page", {}).get("name", company)
            updated_at  = parsed.get("page", {}).get("updated_at") or commit["commit"]["author"]["date"]
            severity    = _SEVERITY_MAP.get(indicator, "medium")
            title       = f"{page_name}: {description}"
            url         = f"https://github.com/{repo}/blob/{sha}/{file}"
            tags        = ["github", "outage", slug, indicator]
        else:
            message = commit["commit"]["message"].split("\n")[0]
            if not message:
                continue
            title      = message
            url        = commit["html_url"]
            updated_at = commit["commit"]["author"]["date"]
            severity   = None
            tags       = ["github", "outage", slug]

        existing = await db.table("postmortems").select("id").eq("id", entry_id).execute()
        if not existing.data:
            await db.table("postmortems").insert({
                "id": entry_id, "title": title, "company": company,
                "url": url, "published_at": updated_at,
                "severity": severity, "tags": tags, "status": "pending",
            }).execute()
            created += 1
            yield {"type": "incident", "title": title, "id": entry_id, "severity": severity}

    yield {"type": "done", "created": created}


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

    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            resp = await client.get(
                f"{page_url}/api/v2/incidents.json",
                headers={"Accept": "application/json"},
                timeout=15,
            )
        except httpx.RequestError as e:
            yield {"type": "error", "message": f"Request failed: {e}"}
            return

        if resp.status_code != 200:
            yield {"type": "error", "message": f"Statuspage API error {resp.status_code}: {resp.text[:300]}"}
            return

        try:
            data = resp.json()
        except Exception:
            yield {"type": "error", "message": f"Non-JSON response from {page_url}/api/v2/incidents.json — check the URL"}
            return

    incidents = data.get("incidents", [])
    yield {
        "type": "commits_done",
        "total": len(incidents),
        "sampling": len(incidents),
        "step": 1,
        "message": f"Found {len(incidents)} incidents",
    }

    created = 0
    for incident in incidents:
        impact = incident.get("impact", "none")
        if impact in ("none", "maintenance"):
            continue

        created_at = incident.get("created_at", "")
        if last_synced and created_at and created_at <= last_synced:
            continue

        incident_id = incident.get("id", "")
        if not incident_id:
            continue

        entry_id  = f"{slug}-{incident_id[:12]}"
        title     = incident.get("name") or f"{company}: Service Disruption"
        severity  = _SEVERITY_MAP.get(impact, "medium")
        shortlink = incident.get("shortlink") or f"{page_url}/incidents/{incident_id}"

        existing = await db.table("postmortems").select("id").eq("id", entry_id).execute()
        if not existing.data:
            await db.table("postmortems").insert({
                "id":           entry_id,
                "title":        title,
                "company":      company,
                "url":          shortlink,
                "published_at": created_at,
                "severity":     severity,
                "tags":         ["statuspage", "outage", slug, impact],
                "status":       "pending",
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

    method = source["method"]

    async def generate():
        try:
            if method == "github_json":
                gen = _sync_github_json(source, db)
            elif method == "statuspage_api":
                gen = _sync_statuspage_api(source, db)
            else:
                yield f"data: {json_lib.dumps({'type': 'done', 'created': 0, 'message': f'sync not implemented for {method}'})}\n\n"
                return

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
