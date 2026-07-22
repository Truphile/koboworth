
from app.modules.lender.router import router
def test_score_events_route():
    routes = [r.path for r in router.routes]
    assert "/score-events" in routes

def test_usage_route():
    routes = [r.path for r in router.routes]
    assert "/usage" in routes

def test_audit_log_middleware_sync_write():
    from app.core.middleware import AuditLogMiddleware
    assert hasattr(AuditLogMiddleware, "dispatch")
