"""
Hasar Tespit Pipeline
======================
Rapor §3.3: Çoklu teyit yöntemi
  3+ fotoğraf → YOLOv8m ile analiz → skorları ortala → güven skoru
  confidence > 0.7 → otomatik onay
  0.4-0.7 → manuel kontrol
  < 0.4   → red

Issue: BE1-013
"""
# TODO: Issue BE1-013
async def process_damage_report(image_base64: str, lat: float, lng: float, user_id: str) -> dict:
    raise NotImplementedError("Issue BE1-013")
