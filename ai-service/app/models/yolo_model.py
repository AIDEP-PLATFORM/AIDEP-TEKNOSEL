"""
YOLOv8s Model Wrapper — Rapor 3.3
====================================
11 sınıf (Roboflow veri seti: veri_disaster.v5i):
  0  bina_cok_riskli  — Çok riskli bina (yıkılma tehlikesi)
  1  bina_riskli      — Riskli bina (hasarlı, ayakta)
  2  bina_saglam      — Sağlam bina (hasar yok)
  3  bina_yikilmis    — Yıkılmış bina (tamamen çökmüş)
  4  yol_az_hasarli   — Az hasarlı yol
  5  yol_cok_hasarli  — Çok hasarlı yol
  6  yol_gecilebilir  — Geçilebilir yol
  7  yol_gecilemez    — Geçilemez yol (tamamen kapalı)
  8  yol_orta_hasarli — Orta hasarlı yol
  9  yol_saglam       — Sağlam yol
  10 yol_yikilmis     — Yıkılmış yol (tamamen tahrip)

Eğitim (Rapor 3.3):
  - YOLOv8s pretrained → fine-tuning (transfer learning)
  - Veri: Roboflow veri_disaster v5 (CC BY 4.0)
  - Epochs: 50, Batch: 16, Image size: 640
  - Hedef: mAP@50 ≥ 0.85

Issue: AI-005, AI-006
"""
from pathlib import Path

SEVERITY_MAP = {
    # Binalar
    "bina_yikilmis":    5,  # Tamamen çökmüş
    "bina_cok_riskli":  4,  # Yıkılma tehlikesi
    "bina_riskli":      3,  # Hasarlı, ayakta
    "bina_saglam":      0,  # Hasar yok
    # Yollar
    "yol_yikilmis":     5,  # Tamamen tahrip
    "yol_gecilemez":    5,  # Tamamen kapalı
    "yol_cok_hasarli":  4,  # Çok hasarlı
    "yol_orta_hasarli": 3,  # Orta hasarlı
    "yol_az_hasarli":   2,  # Az hasarlı
    "yol_gecilebilir":  1,  # Geçilebilir
    "yol_saglam":       0,  # Hasar yok
}
CLASS_NAMES = list(SEVERITY_MAP.keys())


class YOLOModel:
    def __init__(self, path: str):
        self.path = path
        self.model = None
        self.loaded = False
        self._load()

    def _load(self):
        if not Path(self.path).exists():
            print(f"[AI] YOLOv8s model yok: {self.path}")
            print("[AI] Eğitim tamamlanınca ml_models/ klasörüne ekleyin")
            return
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.path)
            self.loaded = True
            print(f"[AI] YOLOv8s yüklendi: {self.path}")
        except Exception as e:
            print(f"[AI] YOLOv8s yüklenemedi: {e}")

    async def predict(self, image, threshold: float = 0.5) -> list[dict]:
        """YOLO inference CPU-bound olduğu için thread pool'da çalıştırılır."""
        if not self.loaded:
            return [{"class_name": "pending", "confidence": 0.0, "bbox": []}]
        import asyncio
        return await asyncio.to_thread(self._run_inference, image, threshold)

    def _run_inference(self, image, threshold: float) -> list[dict]:
        """Senkron YOLO çıkarım — doğrudan çağrılmaz, thread'de koşar."""
        results = self.model.predict(image, conf=threshold, verbose=False)
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class_name": self.model.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": box.xyxy[0].tolist(),
                })
        return detections

    @staticmethod
    def dominant(detections: list[dict]) -> tuple[str, int]:
        if not detections or detections[0]["class_name"] == "pending":
            return "pending", 0
        best = max(detections, key=lambda d: d["confidence"])
        cls = best["class_name"]
        return cls, SEVERITY_MAP.get(cls, 0)
