from app.modules.scoring.engine import *
def test_calculate_ajo_score():
    assert calculate_ajo_score(5, 1.0) == 30.0
    assert calculate_ajo_score(10, 1.0) == 40.0
    assert calculate_ajo_score(0, 0.0) == 0.0

def test_calculate_catch_up_bonus():
    assert calculate_catch_up_bonus(0, 0) == 15.0
    assert calculate_catch_up_bonus(5, 5) == 15.0
    assert calculate_catch_up_bonus(10, 5) == 7.5

def test_calculate_velocity_score():
    assert calculate_velocity_score(100.0, 10, 0.5) == 8.0
    assert calculate_velocity_score(0.0, None, None) == 0.0

def test_calculate_trade_credit_score():
    assert calculate_trade_credit_score([]) == 0.0
    assert calculate_trade_credit_score([5, 5]) == 12.5 # 15 - (5*0.5)

def test_calculate_telco_score():
    assert calculate_telco_score(10, 500.0, 12) == 7.4
    assert calculate_telco_score(None, None, 0) == 0.0

def test_calculate_composite_score():
    scores = {"ajo": 40.0, "catch_up": 15.0, "velocity": 20.0, "trade": 15.0, "telco": 10.0}
    assert calculate_composite_score(scores) == 100.0
    
    missing_telco = {"ajo": 40.0, "catch_up": 15.0, "velocity": 20.0, "trade": 15.0}
    assert calculate_composite_score(missing_telco) == 100.0 

def test_classify_tier():
    assert classify_tier(85.0, 10, True) == "GOLD"
    assert classify_tier(85.0, 5, True) == "NONE"
    assert classify_tier(45.0, 10, False) == "BRONZE"

def test_recalculate_score_definition():
    from app.modules.scoring.tasks import recalculate_score
    assert callable(recalculate_score)
