from app.modules.scoring.engine import filter_disputed_contributions

def test_filter_disputed_contributions():
    c = [{"amount": 100, "is_disputed": True}, {"amount": 200, "is_disputed": False}]
    filtered = filter_disputed_contributions(c)
    assert len(filtered) == 1
    assert filtered[0]["amount"] == 200
