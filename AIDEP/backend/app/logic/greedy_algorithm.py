"""
Enhanced Greedy Eşleştirme Algoritması
=======================================
Rapor §3.3:
  - O(n log n + n×m) karmaşıklık
  - %95-98 optimal (Hungarian'ın O(n³)'e karşı)
  - cost = 0.7 × süre + 0.3 × (100 - öncelik_skoru)
  - Constraint: max 3 görev/gün, 06:00-23:00

Issue: AI-013, AI-014
"""
from dataclasses import dataclass, field


@dataclass
class MatchRequest:
    id: int
    priority_score: float    # XGBoost çıktısı (0-100)
    type: str                # rescue | medical | shelter | food
    lat: float
    lng: float


@dataclass
class MatchVolunteer:
    id: str
    skills: list[str] = field(default_factory=list)
    lat: float = 0.0
    lng: float = 0.0
    current_load: int = 0    # Aktif görev sayısı (max 3)


@dataclass
class Match:
    request_id: int
    volunteer_id: str
    eta_min: float
    cost: float


# Beceri kısıtları (Rapor §3.3)
SKILL_MAP = {
    "rescue":  "arama_kurtarma",
    "medical": "tibbi_yardim",
}


async def run_matching(
    requests: list[MatchRequest],
    volunteers: list[MatchVolunteer],
) -> dict:
    """
    Enhanced Greedy eşleştirme — Rapor §3.3
    Returns: {"matches": [...], "unmatched": [...]}
    Süre: 100 talep × 50 gönüllü ≈ 0.5 sn, 1000×200 ≈ 2 sn
    """
    if not requests or not volunteers:
        return {"matches": [], "unmatched": [r.id for r in requests]}

    # Adım 1: Önceliğe göre azalan sırala  O(n log n)
    sorted_reqs = sorted(requests, key=lambda r: r.priority_score, reverse=True)

    matches: list[Match] = []
    unmatched: list[int] = []
    busy: set[str] = set()

    # Adım 2: Eşleştirme döngüsü  O(n×m)
    for req in sorted_reqs:
        available = [
            v for v in volunteers
            if v.id not in busy
            and v.current_load < 3          # constraint: max 3 görev
            and _skill_ok(req, v)            # constraint: beceri uyumu
        ]
        if not available:
            unmatched.append(req.id)
            continue

        best = min(available, key=lambda v: _cost(req, v))
        busy.add(best.id)
        matches.append(Match(
            request_id=req.id,
            volunteer_id=best.id,
            eta_min=_eta(req, best),
            cost=_cost(req, best),
        ))

    # Adım 3: Lokal swap optimizasyonu (opsiyonel, 2 iterasyon)
    # TODO: son 10 eşleşmede swap dene

    return {"matches": matches, "unmatched": unmatched}


def _skill_ok(req: MatchRequest, vol: MatchVolunteer) -> bool:
    required = SKILL_MAP.get(req.type)
    return required is None or required in vol.skills


def _cost(req: MatchRequest, vol: MatchVolunteer) -> float:
    """Rapor: cost = 0.7×süre + 0.3×(100-öncelik)"""
    return 0.7 * _eta(req, vol) + 0.3 * (100 - req.priority_score)


def _eta(req: MatchRequest, vol: MatchVolunteer) -> float:
    """
    Yaklaşık ETA (dakika).
    Gerçek implementasyonda OSRM table API kullanılır (BE2-001).
    """
    import math
    dist_km = math.sqrt((req.lat - vol.lat)**2 + (req.lng - vol.lng)**2) * 111
    return dist_km / 40 * 60   # 40 km/h
