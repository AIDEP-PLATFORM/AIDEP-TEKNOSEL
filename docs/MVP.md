# AIDEP — MVP kapsamı

Bu depo **MVP (Minimum Uygulanabilir Ürün)** öncelikleriyle ilerler: önce uçtan uca çalışan ince bir dilim, sonra genişletme.

## MVP’de hedef (öncelik sırası)

1. **Kimlik / oturum** — Supabase Auth ile giriş; backend’de korumalı örnek endpoint.
2. **Temel API** — Sağlık (`/health`), OpenAPI (`/docs`); `/api/v1` altında en az bir gerçek iş akışı (ör. hasar kaydı listesi veya tek CRUD).
3. **Ön yüz** — Giriş + ana sayfa; API’ye bağlı tek ekran.
4. **Harita / rota** — OSRM veya statik rota: MVP’de tek senaryo yeter (ör. iki nokta arası süre).
5. **AI (isteğe bağlı dilim)** — Tek endpoint (ör. görüntüden tespit); model dosyası MinIO veya volume ile.

## MVP’de bilinçli olarak ertelenen

- Tam birim / E2E test matrisi (şimdilik `tests/integration` yeter).
- Tüm boş route modüllerinin doldurulması (ihtiyaç oldukça eklenir).
- Production sertleştirme (rate limit, ayrıntılı audit) — MVP sonrası.

## Geliştirme disiplini

- Küçük PR’lar; her PR tek özellik veya tek hata düzeltmesi.
- `make test` veya `cd backend && pytest tests/integration -v` yeşil kalsın.
- Şema değişikliği: Alembic migration + Supabase’te uygun SQL.

## Sonraki adımlar (ürün kararına bağlı)

Ürün sahibiyle netleştirilecek: MVP demo için **tek ana kullanıcı hikâyesi** (ör. “gönüllü hasar bildirimi gönderir”).
