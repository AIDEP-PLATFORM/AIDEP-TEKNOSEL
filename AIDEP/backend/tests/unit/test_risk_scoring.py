# Risk skoru birim testleri — Issue BE2-002
from app.logic.risk_scoring import route_risk_score, is_route_safe

def test_clear_route():
    assert route_risk_score(["clear","clear","clear"]) == 0.0

def test_blocked_route_unsafe():
    assert is_route_safe(["clear","road_blocked","clear"]) is False

def test_mixed_route():
    score = route_risk_score(["clear","road_damaged","road_passable"])
    assert 0 < score < 1
