from app.modules.fraud.rules import *
from datetime import datetime, timedelta

def test_check_fraud_01_bulk_backdating():
    now = datetime.now()
    # 10 entries old
    entries_bad = [{"date": now - timedelta(days=4)} for _ in range(10)]
    assert check_fraud_01_bulk_backdating(entries_bad) == True
    
    # 9 entries old
    entries_good = [{"date": now - timedelta(days=4)} for _ in range(9)]
    assert check_fraud_01_bulk_backdating(entries_good) == False

def test_check_fraud_02_perfect_streak():
    amounts = [100.0] * 90
    assert check_fraud_02_perfect_streak(amounts, 90) == True
    
    amounts_varied = [100.0] * 89 + [200.0]
    assert check_fraud_02_perfect_streak(amounts_varied, 90) == False
    
    amounts_short = [100.0] * 80
    assert check_fraud_02_perfect_streak(amounts_short, 80) == False

def test_check_fraud_03_duplicate():
    assert check_fraud_03_duplicate(True) == True 
    assert check_fraud_03_duplicate(False) == False

def test_check_fraud_04_dormant_surge():
    assert check_fraud_04_dormant_surge(35, 105) == True
    assert check_fraud_04_dormant_surge(20, 105) == False
    assert check_fraud_04_dormant_surge(35, 50) == False

def test_check_fraud_05_new_group_consistency():
    assert check_fraud_05_new_group_consistency(5, 1.0) == True
    assert check_fraud_05_new_group_consistency(5, 0.9) == False
    assert check_fraud_05_new_group_consistency(40, 1.0) == False

def test_run_fraud_checks():
    from app.modules.fraud.tasks import run_fraud_checks
    data = {
        "entries": [{"date": datetime.now() - timedelta(days=4)} for _ in range(10)],
        "amounts": [100.0] * 90,
        "days_count": 90,
        "db_exists": True,
        "days_since_last_active": 40,
        "session_entry_count": 120,
        "group_age_days": 10,
        "consistency_pct": 1.0
    }
    flags = run_fraud_checks("session-123", data)
    assert flags["FRAUD-01"] == True
    assert flags["FRAUD-02"] == True
    assert flags["FRAUD-03"] == True
    assert flags["FRAUD-04"] == True
    assert flags["FRAUD-05"] == True
