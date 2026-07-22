
from .rules import *

# @celery_app.task
def run_fraud_checks(session_id: str, data: dict):
    flags = {}
    flags["FRAUD-01"] = check_fraud_01_bulk_backdating(data.get("entries", []))
    flags["FRAUD-02"] = check_fraud_02_perfect_streak(data.get("amounts", []), data.get("days_count", 0))
    flags["FRAUD-03"] = check_fraud_03_duplicate(data.get("db_exists", False))
    flags["FRAUD-04"] = check_fraud_04_dormant_surge(data.get("days_since_last_active", 0), data.get("session_entry_count", 0))
    flags["FRAUD-05"] = check_fraud_05_new_group_consistency(data.get("group_age_days", 999), data.get("consistency_pct", 0.0))
    
    return flags
