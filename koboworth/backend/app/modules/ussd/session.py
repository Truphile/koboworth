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
