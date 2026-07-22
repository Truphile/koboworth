
def calculate_ajo_score(streak: int, consistency_pct: float) -> float:
    return min(40.0, (streak * 2) + (consistency_pct * 20))

def calculate_catch_up_bonus(missed_days: int, caught_up_days: int) -> float:
    if missed_days == 0: return 15.0
    ratio = min(1.0, caught_up_days / missed_days)
    return 15.0 * ratio

def calculate_velocity_score(throughput: float, frequency: int, active_days_ratio: float) -> float:
    freq = frequency or 0
    adr = active_days_ratio or 0.0
    return min(20.0, (freq * 0.3) + (adr * 10))

def calculate_trade_credit_score(days_to_repay: list[int]) -> float:
    if not days_to_repay: return 0.0
    avg_days = sum(days_to_repay) / len(days_to_repay)
    score = 15.0 - (avg_days * 0.5)
    return max(0.0, min(15.0, score))

def calculate_telco_score(recharge_freq: int, avg_amount: float, tenure_months: int) -> float:
    freq = recharge_freq or 0
    tenure = tenure_months or 0
    return min(10.0, (freq * 0.5) + (tenure * 0.2))

def calculate_composite_score(scores: dict) -> float:
    weights = {"ajo": 40, "catch_up": 15, "velocity": 20, "trade": 15, "telco": 10}
    missing_weight = 0.0
    earned = 0.0
    
    for k, v in weights.items():
        if scores.get(k) is None:
            missing_weight += v
        else:
            earned += scores[k]
            
    if missing_weight == 100: return 0.0
    
    multiplier = 100.0 / (100.0 - missing_weight)
    return min(100.0, earned * multiplier)

def classify_tier(composite_score: float, days_logged: int, loan_history: bool) -> str:
    if days_logged < 7: return "NONE"
    if composite_score >= 80 and loan_history: return "GOLD"
    if composite_score >= 60: return "SILVER"
    if composite_score >= 40: return "BRONZE"
    return "NONE"

def filter_disputed_contributions(contributions: list[dict]) -> list[dict]:
    return [c for c in contributions if not c.get("is_disputed", False)]
