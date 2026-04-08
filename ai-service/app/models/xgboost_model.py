"""
XGBoost Model Wrapper — Rapor §3.3
=====================================
7 giriş özelliği → 0-100 öncelik skoru

Feature ağırlıkları (XGBoost tarafından öğrenilir, bunlar başlangıç referansı):
  urgency_level    %25  (en önemli)
  waiting_time_min %20
  need_type_weight %18
  damage_score     %15
  distance_km      %10
  population        %7
  weather_score     %5

Eğitim (Rapor §3.3):
  - Grid Search + 5-katlı çapraz doğrulama
  - Hedef: R² ≥ 0.85, MAE < 10
  - Veri: Kahramanmaraş retrospektif + uzman senaryoları

Issue: AI-009
"""
from pathlib import Path

NEED_TYPE_MAP = {"rescue": 1.0, "medical": 0.9, "shelter": 0.6, "food": 0.4}


class XGBoostModel:
    def __init__(self, path: str):
        self.path = path
        self.model = None
        self.loaded = False
        self._load()

    def _load(self):
        if not Path(self.path).exists():
            print(f"[AI] XGBoost model yok: {self.path}")
            print("[AI] Kural tabanlı fallback aktif (eğitim sonrası değiştirilecek)")
            return
        try:
            import joblib
            self.model = joblib.load(self.path)
            self.loaded = True
            print(f"[AI] XGBoost yüklendi: {self.path}")
        except Exception as e:
            print(f"[AI] XGBoost yüklenemedi: {e}")

    def predict(self, features: list[dict]) -> list[float]:
        if not self.loaded:
            return self._rule_based(features)
        import numpy as np
        X = np.array([[
            f["urgency_level"],
            f["waiting_time_min"],
            f["distance_km"],
            NEED_TYPE_MAP.get(f["need_type"], 0.4),
            f["weather_score"],
            f["population"],
            f["damage_score"],
        ] for f in features])
        raw = self.model.predict(X)
        mn, mx = raw.min(), raw.max()
        return ((raw - mn) / (mx - mn) * 100).tolist() if mx > mn else [50.0] * len(features)

    def _rule_based(self, features: list[dict]) -> list[float]:
        """
        Rapor: kural tabanlı fallback
        score = urgency(40%) + waiting(30%) + need_type(20%) + population(10%)
        """
        out = []
        for f in features:
            s = (f["urgency_level"] * 20 * 0.40
                 + min(f["waiting_time_min"] / 2, 100) * 0.30
                 + NEED_TYPE_MAP.get(f["need_type"], 0.4) * 100 * 0.20
                 + min(f["population"] * 10, 100) * 0.10)
            out.append(min(round(s, 2), 100.0))
        return out
