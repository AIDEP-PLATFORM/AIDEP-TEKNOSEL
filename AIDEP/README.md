# AIDEP — AI Disaster Emergency Platform
Teknosel 2026 | OÜ2662 | Yerel Yönetimlerde Akıllı Şehircilik

## AI Pipeline (Rapor §3.3)
1. YOLOv8m   → Hasar tespiti, 7 sınıf         [ai-service/]
2. XGBoost   → Talep önceliklendirme, 0-100    [ai-service/]
3. Greedy    → Gönüllü-talep eşleştirme        [backend/app/logic/]
4. OSRM      → Güvenli rota hesaplama          [backend/app/services/]

## Başlangıç
```bash
cp docker/.env.dev.example docker/.env.dev
make dev
```
