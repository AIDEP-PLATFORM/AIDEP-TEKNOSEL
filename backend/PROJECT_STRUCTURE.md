# Backend Yapısı

app/api/          → HTTP route'ları + dependency injection
app/authentication/ → Firebase JWT doğrulama
app/core/         → Config, DB bağlantısı, Redis
app/crud/         → Veritabanı CRUD işlemleri
app/data/         → Seed ve başlangıç verileri
app/logic/        → İş mantığı (Greedy, risk skoru) — AI servisinden bağımsız
app/schemas/      → Pydantic modeller
app/services/     → Dış servis çağrıları (ai_service, osrm, minio)
