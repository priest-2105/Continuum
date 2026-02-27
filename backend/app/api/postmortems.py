from fastapi import APIRouter, HTTPException, Query
from app.db.supabase import get_client
from app.models.postmortem import Postmortem

router = APIRouter(prefix="/postmortems", tags=["postmortems"])


@router.get("/")
async def list_postmortems(
    company: str | None = None,
    status: str = "published",
    limit: int = Query(default=20, le=100),
    offset: int = 0,
):
    db = get_client()
    query = db.table("postmortems").select("*").eq("status", status)
    if company:
        query = query.eq("company", company)
    result = query.order("published_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data


@router.get("/{id}")
async def get_postmortem(id: str):
    db = get_client()
    result = db.table("postmortems").select("*").eq("id", id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Not found")
    return result.data
