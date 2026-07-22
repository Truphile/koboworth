from app.core.middleware import AuditLogMiddleware, RateLimitMiddleware
import sentry_sdk
sentry_sdk.init(
    dsn="https://dummy@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)
from fastapi import FastAPI

from app.core.config import settings
from app.modules.ussd.router import router as ussd_router
from app.modules.consent.router import router as consent_router
from app.modules.passport.router import router as passport_router
from app.modules.lender.router import router as lender_router
from app.modules.admin.router import router as admin_router
from app.modules.worker.router import router as worker_router
from app.modules.collector.router import router as collector_router
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuditLogMiddleware)
app.add_middleware(RateLimitMiddleware)

app.include_router(ussd_router, prefix="/ussd", tags=["USSD"])
app.include_router(consent_router, prefix="/consent", tags=["Consent"])
app.include_router(passport_router, prefix="/passport", tags=["Passport"])
app.include_router(lender_router, prefix="/v1", tags=["Lender API"])
app.include_router(admin_router, prefix="/admin", tags=["Admin API"])
app.include_router(worker_router, prefix="/workers", tags=["Workers"])
app.include_router(collector_router, prefix="/collectors", tags=["Collectors"])
from app.shared.db.session import AsyncSessionLocal
from sqlalchemy import text

@app.get("/health")
async def health_check():
    health = {"status": "ok", "db": "ok", "redis": "ok", "celery": "ok", "s3": "ok"}
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
    except Exception:
        health["db"] = "error"
        health["status"] = "degraded"
    return health

Instrumentator().instrument(app).expose(app)