"""
Rota Risk Skoru Hesaplama
=========================
Rapor §3.3: YOLOv8m hasar verisi + OSRM rota segmentleri

Hasar sınıf → risk skoru:
  road_blocked:      5.0  ← bu segmenti kullanma!
  building_collapse: 5.0
  road_damaged:      2.0
  building_damaged:  2.0
  debris_pile:       1.5
  road_passable:     0.5
  clear:             0.0
  pending:           1.0  ← henüz analiz edilmemiş

risk_score = Σ(segment_skor) / (n × max_skor)  → 0-1
final_cost = 0.7 × süre + 0.3 × risk_score

Issue: BE2-002
"""

DAMAGE_SCORES: dict[str, float] = {
    "road_blocked":      5.0,
    "building_collapse": 5.0,
    "road_damaged":      2.0,
    "building_damaged":  2.0,
    "debris_pile":       1.5,
    "road_passable":     0.5,
    "clear":             0.0,
    "pending":           1.0,
}
_MAX = 5.0


def route_risk_score(segment_classes: list[str]) -> float:
    """0.0 (güvenli) → 1.0 (çok riskli)"""
    if not segment_classes:
        return 0.0
    total = sum(DAMAGE_SCORES.get(c, 1.0) for c in segment_classes)
    return min(total / (len(segment_classes) * _MAX), 1.0)


def is_route_safe(segment_classes: list[str]) -> bool:
    """road_blocked segmenti varsa direkt False (Rapor: riskli segmenti bypass et)"""
    if "road_blocked" in segment_classes:
        return False
    return route_risk_score(segment_classes) < 0.8
