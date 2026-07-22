from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.worker.router import router as worker_router

app = FastAPI(title="Koboworth Worker API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(worker_router, prefix="/workers", tags=["Workers"])

@app.get("/health")
def health(): return {"status": "ok"}
