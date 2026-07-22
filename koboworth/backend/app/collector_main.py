from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.collector.router import router as collector_router

app = FastAPI(title="Koboworth Collector API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(collector_router, prefix="/collectors", tags=["Collectors"])

@app.get("/health")
def health(): return {"status": "ok"}
