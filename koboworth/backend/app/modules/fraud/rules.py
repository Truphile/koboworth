from datetime import datetime, timedelta

def check_fraud_01_bulk_backdating(entries: list[dict]) -> bool:
    now = datetime.now()
    old_count = sum(1 for e in entries if (now - e.get("date", now)).days > 3)
    return old_count >= 10

def check_fraud_02_perfect_streak(amounts: list[float], days_count: int) -> bool:
    if days_count < 90 or len(amounts) < 90:
        return False
    return len(set(amounts)) == 1

def check_fraud_03_duplicate(db_exists: bool) -> bool:
    return db_exists

def check_fraud_04_dormant_surge(days_since_last_active: int, session_entry_count: int) -> bool:
    return days_since_last_active > 30 and session_entry_count >= 100

def check_fraud_05_new_group_consistency(group_age_days: int, consistency_pct: float) -> bool:
    return group_age_days <= 30 and consistency_pct == 1.0
