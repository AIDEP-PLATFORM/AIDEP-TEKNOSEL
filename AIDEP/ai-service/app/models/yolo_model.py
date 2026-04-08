"""
YOLOv8m Model Wrapper — Rapor §3.3
====================================
7 sınıf:
  0 road_blocked      — Enkaz/çöküntü ile kapanan yol
  1 road_passable     — Hasarlı ama geçilebilir
  2 road_damaged      — Yüzey hasarı, yavaş geçiş
  3 building_collapse — Tamamen/kısmen çökmüş
  4 building_damaged  — Ayakta ama hasarlı
  5 debris_pile       — Enkaz yığını
  6 clear             — Hasar yok, güvenli

Eğitim (Rapor §3.3):
  - COCO pretrained → fine-tuning (transfer learning)
  - Veri: %60 train / %20 val / %20 test
  - Augmentation: flip, brightness, noise, rotation, mosaic
  - Hedef: mAP@50 ≥ 0.85

Issue: AI-005, AI-006
"""
from pathlib import Path

SEVERITY_MAP = {
    "road_blocked": 5, "building_collapse": 5,
    "road_damaged": 3, "building_damaged": 3,
    "debris_pile":  2, "road_passable": 1, "clear": 0,
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
            print(f"[AI] YOLOv8m model yok: {self.path}")
            print("[AI] Eğitim tamamlanınca ml_models/ klasörüne ekleyin")
            return
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.path)
            self.loaded = True
            print(f"[AI] YOLOv8m yüklendi: {self.path}")
        except Exception as e:
            print(f"[AI] YOLOv8m yüklenemedi: {e}")

    def predict(self, image, threshold: float = 0.5) -> list[dict]:
        if not self.loaded:
            return [{"class_name": "pending", "confidence": 0.0, "bbox": []}]
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
