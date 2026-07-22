import os

BASE_DIR = "/home/truphile/Documents/capstone/koboworth/backend"

def write_file(path, content):
    full_path = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\n")

# USSD Router
write_file("app/modules/ussd/router.py", """
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.db.session import get_db
from .service import process_ussd_request
from .schemas import USSDRequest

router = APIRouter()

@router.post("/session")
async def ussd_session(request: Request, db: AsyncSession = Depends(get_db)):
    form_data = await request.form()
    ussd_req = USSDRequest(
        sessionId=form_data.get("sessionId", ""),
        phoneNumber=form_data.get("phoneNumber", ""),
        networkCode=form_data.get("networkCode", ""),
        serviceCode=form_data.get("serviceCode", ""),
        text=form_data.get("text", "")
    )
    
    response_text = await process_ussd_request(ussd_req, db)
    return Response(content=response_text, media_type="text/plain")
""")

write_file("app/modules/ussd/schemas.py", """
from pydantic import BaseModel

class USSDRequest(BaseModel):
    sessionId: str
    phoneNumber: str
    networkCode: str
    serviceCode: str
    text: str
""")

write_file("app/modules/ussd/session.py", """
from redis.asyncio import Redis
import json
from app.core.config import settings

redis_client = Redis.from_url(settings.REDIS_URL)
SESSION_TTL = 90

async def get_session(session_id: str) -> dict:
    data = await redis_client.get(f"ussd_session:{session_id}")
    if data:
        return json.loads(data)
    return {"state": "MENU", "failed_attempts": 0}

async def save_session(session_id: str, state_data: dict):
    await redis_client.setex(
        f"ussd_session:{session_id}",
        SESSION_TTL,
        json.dumps(state_data)
    )
""")

write_file("app/modules/ussd/service.py", """
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .schemas import USSDRequest
from .session import get_session, save_session
from app.shared.models.collector import AjoCollector
from app.core.security import verify_password
from datetime import datetime, timedelta, timezone

async def process_ussd_request(req: USSDRequest, db: AsyncSession) -> str:
    session_data = await get_session(req.sessionId)
    
    # Check if collector exists
    result = await db.execute(select(AjoCollector).where(AjoCollector.phone_number == req.phoneNumber))
    collector = result.scalar_one_or_none()
    
    if not collector:
        return "END Unregistered phone number."

    if collector.lockout_until and collector.lockout_until > datetime.now(timezone.utc):
        return "END Your account is locked. Try again later."

    inputs = req.text.split("*") if req.text else []
    last_input = inputs[-1] if inputs else ""

    state = session_data.get("state", "MENU")

    if state == "MENU":
        if not req.text:
            session_data["state"] = "AUTH"
            await save_session(req.sessionId, session_data)
            return "CON Welcome to Koboworth\\nEnter your PIN:"
        else:
            state = "AUTH"

    if state == "AUTH":
        if not last_input:
            return "CON Welcome to Koboworth\\nEnter your PIN:"
            
        if verify_password(last_input, collector.pin_hash):
            collector.failed_pin_attempts = 0
            await db.commit()
            session_data["state"] = "MAIN_MENU"
            await save_session(req.sessionId, session_data)
            return "CON 1. View Groups\\n2. Record Contribution"
        else:
            collector.failed_pin_attempts += 1
            if collector.failed_pin_attempts >= 3:
                collector.lockout_until = datetime.now(timezone.utc) + timedelta(minutes=30)
                await db.commit()
                # Here we would normally enqueue an SMS alert
                return "END Your account is locked due to multiple failed attempts."
            await db.commit()
            session_data["state"] = "AUTH"
            await save_session(req.sessionId, session_data)
            return "CON Invalid PIN. Try again:"
            
    return "END System error."
""")

write_file("app/main.py", """
from fastapi import FastAPI
from app.core.config import settings
from app.modules.ussd.router import router as ussd_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.include_router(ussd_router, prefix="/ussd", tags=["USSD"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
""")
