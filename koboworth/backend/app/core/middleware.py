
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.shared.db.session import AsyncSessionLocal
from sqlalchemy import text

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # F53 Synchronous write to audit_logs
        path = request.url.path
        method = request.method
        ip = request.client.host if request.client else "127.0.0.1"
        
        async with AsyncSessionLocal() as db:
            try:
                await db.execute(text("INSERT INTO audit_logs (method, path, ip) VALUES (:m, :p, :ip)"), {"m": method, "p": path, "ip": ip})
                await db.commit()
            except Exception:
                pass
                
        response = await call_next(request)
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests = {}

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        if ip not in self.requests: self.requests[ip] = []
        self.requests[ip] = [t for t in self.requests[ip] if now - t < 10]
        if len(self.requests[ip]) >= 10:
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=429, content={"detail": "Too many requests"})
        self.requests[ip].append(now)
        return await call_next(request)
