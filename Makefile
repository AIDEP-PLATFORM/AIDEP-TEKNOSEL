.PHONY: help dev dev-fast prod down logs migrate shell-db shell-back shell-ai test test-mvp demo-seed clean osrm-check build-cache

help:
	@echo "======= AIDEP Makefile ======="
	@echo "make dev         -> .env kurulumu yapar ve 'dev' profilinde (Adminer dahil) başlatır."
	@echo "make prod        -> Arka planda başlar (-d) ve logları dökmez."
	@echo "make down        -> Konteynerleri güvenle durdurur."
	@echo "make logs        -> Servislerin canlı loglarını takip eder."
	@echo "make migrate     -> Veritabanı tablolarını günceller (db-migrate servisini tetikler)."
	@echo "make shell-db    -> Supabase DB bilgisi (psql komutu önerisi)."
	@echo "make shell-back  -> Backend konteynerinin içine (sh) bağlanır."
	@echo "make shell-ai    -> AI konteynerinin içine (sh) bağlanır."
	@echo "make test        -> Backend testlerini (Docker) çalıştırır."
	@echo "make test-mvp    -> Sadece integration testleri (MVP, Docker)."
	@echo "make demo-seed   -> Test/Demo için örnek harita/veri yükleme scriptini çalıtırır."
	@echo "make clean       -> DİKKAT: Redis, MinIO ve OSRM Docker volume'larını siler (Supabase verisi silinmez)."
	@echo "make osrm-check  -> Backend içinden OSRM harita motoruna ping atıp hazır olduğunu test eder."

dev:
	@[ -f .env ] || cp .env.example .env
	@echo "🚀 Geliştirme ortamı başlatılıyor..."
	DOCKER_BUILDKIT=1 docker compose --profile dev up --build

# Hızlı dev: AI servisi kapalı + hot-reload (ilk build'den sonra saniyeler içinde başlar)
dev-fast:
	@[ -f .env ] || cp .env.example .env
	@echo "⚡ Hızlı geliştirme ortamı (AI servisi kapalı)..."
	DOCKER_BUILDKIT=1 docker compose \
		-f docker-compose.yml \
		-f docker-compose.dev.yml \
		--profile dev up --build

prod:
	@[ -f .env ] || cp .env.example .env
	@echo "🔒 Prodüksiyon arka planda başlatılıyor..."
	DOCKER_BUILDKIT=1 docker compose up --build -d

# Bağımlılık katmanlarını önceden cache'le (CI/CD öncesi çalıştır)
build-cache:
	@echo "📦 Bağımlılık katmanları cache'leniyor..."
	DOCKER_BUILDKIT=1 docker compose build --parallel

down:
	@echo "🛑 Sistem durduruluyor..."
	docker compose --profile dev down

logs:
	docker compose logs -f --tail=100

migrate:
	@echo "⚙️  Migrasyon işlemi başlatılıyor..."
	docker compose up db-migrate --build

shell-db:
	@echo "🗄️  Veritabanı Supabase (bulutta). Tablolar ve SQL için Supabase Dashboard → SQL Editor kullanın."
	@echo "    Yerel psql: .env içindeki DATABASE_URL değerini bağlantı dizesi olarak kullanın."

shell-back:
	@echo "💻 Backend içine (sh) giriliyor..."
	docker compose exec backend /bin/sh

shell-ai:
	@echo "🧠 AI servisi içine (sh) giriliyor..."
	docker compose exec ai /bin/sh

test:
	@echo "🧪 Testler başlatılıyor..."
	docker compose exec backend pytest tests/ -v

test-mvp:
	@echo "🧪 MVP integration testleri..."
	docker compose exec backend pytest tests/integration -v

demo-seed:
	@echo "🌱 Örnek veri yükleniyor..."
	docker compose exec backend python app/data/seed_demo.py

clean:
	@echo "⚠️  DİKKAT: VERİLER SİLİNECEK!"
	@read -p "Docker volume'ları (Redis, MinIO, OSRM; Supabase hariç) sıfırlamak istediğine emin misin? (Enter ile devam et) " _
	docker compose --profile dev down -v --remove-orphans

osrm-check:
	@echo "🗺️  OSRM servisine sağlık kontrolü yapılıyor..."
	docker compose exec backend curl -I http://osrm:5000/ || echo "UYARI: OSRM yanıt vermedi veya curl bulunamadı."
