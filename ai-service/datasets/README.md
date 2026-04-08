# Veri Seti

Issue: AI-001 (Kahramanmaraş), AI-002 (uluslararası), AI-003 (etiketleme), AI-004 (augmentation)

## Kaynaklar (Rapor §3.3)
- 6 Şubat 2023 Kahramanmaraş (öncelik)
- 2023 Marakeş, 2023 Suriye, 2020 İzmir
- AIDER, RescueNet, xBD açık kaynak veri setleri

## Klasör Yapısı
datasets/
├── raw/          # Ham görüntüler (.gitignore)
├── labeled/      # Roboflow export (.gitignore)
├── train/images/ train/labels/
├── val/images/   val/labels/
└── test/images/  test/labels/

## XGBoost Verisi
xgboost_train.csv: ≥1500 kayıt, 7 özellik + priority_score
