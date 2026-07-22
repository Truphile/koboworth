import pytest
from app.core.security import *

def test_create_and_verify_token():
    token = create_access_token({"sub": "lender_123"})
    payload = verify_token(token)
    assert payload["sub"] == "lender_123"

def test_login_route():
    from app.modules.lender.router import router
    assert len(router.routes) > 0

def test_middlewares_exist():
    from app.core.middleware import AuditLogMiddleware, RateLimitMiddleware
    assert AuditLogMiddleware
    assert RateLimitMiddleware
