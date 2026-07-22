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
