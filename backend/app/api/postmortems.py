from fastapi import APIRouter, HTTPException, Query
from app.db.supabase import get_client
from app.services.gemini import generate_summary

router = APIRouter(prefix="/postmortems", tags=["postmortems"])

_ALLOWED_SORT = {"published_at", "company", "created_at"}


@router.get("/")
async def list_postmortems(
    company: str | None = None,
    severity: str | None = None,
    sort_by: str = "published_at",
    sort_dir: str = "desc",
    limit: int = Query(default=20, le=100),
    offset: int = 0,
):
    if sort_by not in _ALLOWED_SORT:
        sort_by = "published_at"

    db = await get_client()
    query = db.table("postmortems").select("*", count="exact").eq("status", "published")
    if company:
        query = query.eq("company", company)
    if severity:
        query = query.eq("severity", severity)

    result = await query.order(sort_by, desc=(sort_dir != "asc")).range(offset, offset + limit - 1).execute()
    return {"data": result.data, "total": result.count or 0}


@router.get("/{id}")
async def get_postmortem(id: str):
    db = await get_client()
    try:
        result = await db.table("postmortems").select("*").eq("id", id).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")
    if not result.data:
        raise HTTPException(status_code=404, detail="Not found")
    return result.data


@router.post("/{id}/summary")
async def get_or_generate_summary(id: str):
    db = await get_client()

    try:
        result = await db.table("postmortems").select("*").eq("id", id).single().execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")

    post = result.data
    if not post:
        raise HTTPException(status_code=404, detail="Not found")

    # Return cached summary if it exists
    if post.get("ai_summary"):
        return {"summary": post["ai_summary"], "cached": True}

    try:
        summary = await generate_summary(post)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")

    await db.table("postmortems").update({"ai_summary": summary}).eq("id", id).execute()

    return {"summary": summary, "cached": False}
