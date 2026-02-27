from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import postmortems, admin

app = FastAPI(title="Continuum API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(postmortems.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
