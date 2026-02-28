from fastapi import APIRouter, HTTPException, Header
from app.db.supabase import get_client
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(x_admin_secret: str = Header(...)):
    if x_admin_secret != settings.admin_secret:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("/queue")
async def get_queue(x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    try:
        db = await get_client()
        result = await db.table("postmortems").select("*").eq("status", "pending").order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}\n{traceback.format_exc()}")


@router.patch("/{id}/publish")
async def publish_entry(id: str, x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    db = await get_client()
    result = await db.table("postmortems").update({"status": "published"}).eq("id", id).execute()
    return result.data


@router.patch("/{id}/reject")
async def reject_entry(id: str, x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    db = await get_client()
    result = await db.table("postmortems").update({"status": "rejected"}).eq("id", id).execute()
    return result.data


@router.delete("/{id}")
async def delete_entry(id: str, x_admin_secret: str = Header(...)):
    require_admin(x_admin_secret)
    db = await get_client()
    await db.table("postmortems").delete().eq("id", id).execute()
    return {"deleted": id}
