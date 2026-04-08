# AIDEP AI Servisi

FastAPI tabanlı inference servisi (Port: 8001)

## Modeller (Rapor §3.3)

| Model | Görev | Hedef Metrik |
|-------|-------|-------------|
| YOLOv8m | 7 sınıf hasar tespiti | mAP@50 ≥ 0.85 |
| XGBoost | 7 özellik → 0-100 skor | R² ≥ 0.85, MAE < 10 |

## Endpoint'ler
GET  /health        → yolo_loaded + xgboost_loaded
POST /detect        → YOLOv8m hasar tespiti (Issue AI-011)
POST /prioritize    → XGBoost önceliklendirme (Issue AI-012)

## Enhanced Greedy NEREDE?
backend/app/logic/greedy_algorithm.py — hafif Python, GPU gerektirmiyor.
ai-service sadece ağır model inference'ı yapar.

## Model Dosyaları
ml_models/
├── yolov8m_aidep.pt        # AI-002 tamamlanınca ekle
└── xgboost_priority.pkl    # AI-009 tamamlanınca ekle
