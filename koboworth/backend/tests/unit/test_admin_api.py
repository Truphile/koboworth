
def test_admin_worker_export():
    from app.modules.admin.router import router
    routes = [r.path for r in router.routes]
    assert "/workers/{id}/data-export" in routes

def test_ussd_dispute_and_summary():
    from app.modules.ussd.service import process_dispute, process_data_summary
    assert "logged" in process_dispute("w1", "e1")
    assert "Summary:" in process_data_summary("w1")

def test_admin_delete_worker():
    from app.modules.admin.router import router
    routes = [r.path for r in router.routes]
    assert "/workers/{id}" in routes

def test_admin_audit_export():
    from app.modules.admin.router import router
    routes = [r.path for r in router.routes]
    assert "/audit-logs/export" in routes
