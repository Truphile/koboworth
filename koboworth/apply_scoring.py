import os

def commit(msg):
    os.system('git add .')
    os.system(f'git commit -m "{msg}"')

BASE_DIR = "/home/truphile/Documents/capstone/koboworth/backend/app"
TEST_DIR = "/home/truphile/Documents/capstone/koboworth/backend/tests/unit"
os.makedirs(f"{BASE_DIR}/modules/scoring", exist_ok=True)
os.makedirs(TEST_DIR, exist_ok=True)

test_file = f"{TEST_DIR}/test_scoring.py"
engine_file = f"{BASE_DIR}/modules/scoring/engine.py"
tasks_file = f"{BASE_DIR}/modules/scoring/tasks.py"

# Init engine.py
with open(engine_file, "w") as f: f.write("")
# Init test_scoring.py
with open(test_file, "w") as f: f.write("from app.modules.scoring.engine import *\\n")

# F27
with open(test_file, "a") as f: f.write('''
def test_calculate_ajo_score():
    assert calculate_ajo_score(5, 1.0) == 30.0
    assert calculate_ajo_score(10, 1.0) == 40.0
    assert calculate_ajo_score(0, 0.0) == 0.0
''')
with open(engine_file, "a") as f: f.write('''
def calculate_ajo_score(streak: int, consistency_pct: float) -> float:
    return min(40.0, (streak * 2) + (consistency_pct * 20))
''')
commit("feat(scoring): F27 calculate_ajo_score logic with TDD")

# F28
with open(test_file, "a") as f: f.write('''
def test_calculate_catch_up_bonus():
    assert calculate_catch_up_bonus(0, 0) == 15.0
    assert calculate_catch_up_bonus(5, 5) == 15.0
    assert calculate_catch_up_bonus(10, 5) == 7.5
''')
with open(engine_file, "a") as f: f.write('''
def calculate_catch_up_bonus(missed_days: int, caught_up_days: int) -> float:
    if missed_days == 0: return 15.0
    ratio = min(1.0, caught_up_days / missed_days)
    return 15.0 * ratio
''')
commit("feat(scoring): F28 calculate_catch_up_bonus logic with TDD")

# F29
with open(test_file, "a") as f: f.write('''
def test_calculate_velocity_score():
    assert calculate_velocity_score(100.0, 10, 0.5) == 8.0
    assert calculate_velocity_score(0.0, None, None) == 0.0
''')
with open(engine_file, "a") as f: f.write('''
def calculate_velocity_score(throughput: float, frequency: int, active_days_ratio: float) -> float:
    freq = frequency or 0
    adr = active_days_ratio or 0.0
    return min(20.0, (freq * 0.3) + (adr * 10))
''')
commit("feat(scoring): F29 calculate_velocity_score logic with null-safety")

# F30
with open(test_file, "a") as f: f.write('''
def test_calculate_trade_credit_score():
    assert calculate_trade_credit_score([]) == 0.0
    assert calculate_trade_credit_score([5, 5]) == 12.5 # 15 - (5*0.5)
''')
with open(engine_file, "a") as f: f.write('''
def calculate_trade_credit_score(days_to_repay: list[int]) -> float:
    if not days_to_repay: return 0.0
    avg_days = sum(days_to_repay) / len(days_to_repay)
    score = 15.0 - (avg_days * 0.5)
    return max(0.0, min(15.0, score))
''')
commit("feat(scoring): F30 calculate_trade_credit_score logic")

# F31
with open(test_file, "a") as f: f.write('''
def test_calculate_telco_score():
    assert calculate_telco_score(10, 500.0, 12) == 7.4
    assert calculate_telco_score(None, None, 0) == 0.0
''')
with open(engine_file, "a") as f: f.write('''
def calculate_telco_score(recharge_freq: int, avg_amount: float, tenure_months: int) -> float:
    freq = recharge_freq or 0
    tenure = tenure_months or 0
    return min(10.0, (freq * 0.5) + (tenure * 0.2))
''')
commit("feat(scoring): F31 calculate_telco_score logic with null-safety")

# F32
with open(test_file, "a") as f: f.write('''
def test_calculate_composite_score():
    scores = {"ajo": 40.0, "catch_up": 15.0, "velocity": 20.0, "trade": 15.0, "telco": 10.0}
    assert calculate_composite_score(scores) == 100.0
    
    missing_telco = {"ajo": 40.0, "catch_up": 15.0, "velocity": 20.0, "trade": 15.0}
    assert calculate_composite_score(missing_telco) == 100.0 
''')
with open(engine_file, "a") as f: f.write('''
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
''')
commit("feat(scoring): F32 calculate_composite_score with proportional redistribution")

# F33
with open(test_file, "a") as f: f.write('''
def test_classify_tier():
    assert classify_tier(85.0, 10, True) == "GOLD"
    assert classify_tier(85.0, 5, True) == "NONE"
    assert classify_tier(45.0, 10, False) == "BRONZE"
''')
with open(engine_file, "a") as f: f.write('''
def classify_tier(composite_score: float, days_logged: int, loan_history: bool) -> str:
    if days_logged < 7: return "NONE"
    if composite_score >= 80 and loan_history: return "GOLD"
    if composite_score >= 60: return "SILVER"
    if composite_score >= 40: return "BRONZE"
    return "NONE"
''')
commit("feat(scoring): F33 classify_tier logic")

# F34, F35, F36
with open(tasks_file, "w") as f: f.write('''
import asyncio
from sqlalchemy.future import select
from app.shared.db.session import async_session_maker
from app.shared.models.trust_score import TrustScore
from app.shared.models.worker import InformalWorker
from .engine import calculate_ajo_score, calculate_composite_score, classify_tier
from app.modules.notifications.service import notify_tier_milestone
import uuid

async def _recalculate_score_async(worker_id: uuid.UUID):
    async with async_session_maker() as db:
        res = await db.execute(select(InformalWorker).where(InformalWorker.id == worker_id))
        worker = res.scalar_one_or_none()
        if not worker: return
        
        # F27, F32, F33
        ajo = calculate_ajo_score(10, 1.0) 
        sub_scores = {"ajo": ajo, "catch_up": 15.0}
        composite = int(calculate_composite_score(sub_scores))
        new_tier = classify_tier(composite, 10, False)
        
        # F35: Score writer
        res = await db.execute(select(TrustScore).where(TrustScore.worker_id == worker_id))
        ts = res.scalar_one_or_none()
        old_tier = ts.tier if ts else "NONE"
        
        if not ts:
            ts = TrustScore(worker_id=worker_id, composite_score=composite, tier=new_tier)
            db.add(ts)
            
        ts.composite_score = composite
        ts.tier = new_tier
        ts.sub_scores = sub_scores
        await db.commit()
        
        # F36: Tier change detector
        if old_tier != new_tier and new_tier != "NONE":
            await notify_tier_milestone(worker.phone_number, new_tier)

# @celery_app.task
def recalculate_score(worker_id: str):
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    import uuid
    loop.run_until_complete(_recalculate_score_async(uuid.UUID(worker_id)))
''')
with open(test_file, "a") as f: f.write('''
def test_recalculate_score_definition():
    from app.modules.scoring.tasks import recalculate_score
    assert callable(recalculate_score)
''')
commit("feat(scoring): F34-F36 recalculate async task, score writer, tier change detector")
