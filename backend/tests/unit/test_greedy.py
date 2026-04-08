# Enhanced Greedy birim testleri — Issue AI-014
import pytest
from app.logic.greedy_algorithm import MatchRequest, MatchVolunteer, _skill_ok

def test_rescue_needs_arama_kurtarma():
    req = MatchRequest(1, 90, "rescue", 37.57, 36.93)
    ok  = MatchVolunteer("v1", ["arama_kurtarma"], 37.57, 36.93)
    bad = MatchVolunteer("v2", ["ilk_yardim"],     37.57, 36.93)
    assert _skill_ok(req, ok)  is True
    assert _skill_ok(req, bad) is False

def test_food_no_skill_required():
    req = MatchRequest(2, 30, "food", 37.57, 36.93)
    vol = MatchVolunteer("v1", [], 37.57, 36.93)
    assert _skill_ok(req, vol) is True
