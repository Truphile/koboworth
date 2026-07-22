import httpx
from app.core.config import settings

async def send_termii_sms(to: str, sms: str) -> bool:
    print(f"[TERMII SMS] To: {to} | Message: {sms}")
    return True
