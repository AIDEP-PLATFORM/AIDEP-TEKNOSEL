# AIDEP Platform (Teknosel O2662)

## Projeye Genel Bakış
Teknosel MVP O2662 numaralı proje için hazırlanmış ileri düzey altyapı, harita ve konteynerize edilmiş yapay zeka platformudur. Veri katmanı **PostgreSQL (PostGIS)** — Docker Compose ile `postgres` servisi ayağa kalkar; backend konteyneri `postgres:5432` üzerinden bağlanır. Coğrafi yönlendirme **OSRM**, model depolama **MinIO S3** ile sağlanır.

**MVP öncelikleri ve kapsam dışı:** [docs/MVP.md](docs/MVP.md)

## Hızlı Kurulum

İlgili ortam değişkenlerini hızlıca oluşturup (`.env.example` kopya) sistemi çalıştırmak için:
```bash
make dev
```
⚠️ **Dikkat:** İlk kez `make dev` dediğinizde OSRM Container'i Türkiye haritasını (`turkey-latest.osm.pbf`) ~15 GB yer tutacak şekilde arka planda indirip, graf analizleri yapacaktır. Bu süreç bilgisayar hızınıza göre ortalama 15 dakika sürebilmektedir.

## Servis Adresleri Tablosu

| Servis Servisleri (Local) | URL |
|---|---|
| Web Panel (React - Nginx Proxy) | `http://localhost/` |
| Swagger UI (FastAPI) | `http://localhost/docs` |
| Adminer (DB Yönetim Arayüzü) | `http://localhost:8080/` |
| MinIO Console (S3 Arayüzü) | `http://localhost:9001/` |

## Klasör Yapısı
- `/backend`: FastAPI mikroservisi ve PostgreSQL (PostGIS) bağlantıları
- `/ai-service`: Ultralytics/XGBoost analiz motorları (Port: 8001)
- `/frontend`: Web panel için React geliştirme ortamı (Port: 3000)
- `/postgres`: İsteğe bağlı yerel SQL betikleri (PostGIS uzantıları vb.)
- `/nginx`: Gelen trafikleri ayrıştıran Reverse Proxy dosyaları
- `/secrets`: İsteğe bağlı yerel gizli dosyalar (repoya eklenmez)

## Katkı Rehberi
Lütfen commit atarken Conventional Commits kurallarına (feat/fix/chore vb.) uyunuz. Kodlarınızı PR'lamadan önce `make test` testlerini kendi lokalinizde koşarak çalıştırdığınızdan emin olunuz. PR açtığınızda GitHub CI otomatize pipeline'ı `.github/pull_request_template.md` kurallarındaki onayları varsayarak işlem başlatacaktır.
