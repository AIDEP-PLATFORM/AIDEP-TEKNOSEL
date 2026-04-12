.PHONY: help dev dev-fast prod down logs migrate shell-db shell-back shell-ai test test-mvp demo-seed clean osrm-check build-cache

# Windows (PowerShell) ve Linux/macOS uyumlu DOCKER_BUILDKIT ayarı
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

help:
	@echo "======= AIDEP Makefile ======="
	@echo "make dev         -> .env kurulumu yapar ve 'dev' profilinde (Adminer dahil) başlatır."
	@echo "make dev-fast    -> AI servisi olmadan hızlı geliştirme (hot-reload)."
	@echo "make prod        -> Arka planda başlar (-d) ve logları dökmez."
	@echo "make build-cache -> Tüm imajları paralel olarak önceden build eder."
	@echo "make down        -> Konteynerleri güvenle durdurur."
	@echo "make logs        -> Servislerin canlı loglarını takip eder."
	@echo "make migrate     -> Veritabanı tablolarını günceller (db-migrate servisini tetikler)."
	@echo "make shell-db    -> Docker postgres (PostGIS) icin psql baglanti hatirlatmasi."
	@echo "make shell-back  -> Backend konteynerinin içine (sh) bağlanır."
	@echo "make shell-ai    -> AI konteynerinin içine (sh) bağlanır."
	@echo "make test        -> Backend testlerini (Docker) çalıştırır."
	@echo "make test-mvp    -> Sadece integration testleri (MVP, Docker)."
	@echo "make demo-seed   -> Test/Demo için örnek harita/veri yükleme scriptini çalıştırır."
	@echo "make clean       -> DİKKAT: Redis, MinIO ve OSRM Docker volume'larını siler."
	@echo "make osrm-check  -> OSRM harita motoruna ping atıp hazır olduğunu test eder."

dev:
	@[ -f .env ] || cp .env.example .env
	@echo "Gelistirme ortami baslatiliyor..."
	docker compose --profile dev up --build

# Hızlı dev: AI servisi kapalı + hot-reload
dev-fast:
	@[ -f .env ] || cp .env.example .env
	@echo "Hizli gelistirme ortami baslatiliyor (AI servisi kapali)..."
	docker compose \
		-f docker-compose.yml \
		-f docker-compose.dev.yml \
		--profile dev up --build

prod:
	@[ -f .env ] || cp .env.example .env
	@echo "Produksiyon arka planda baslatiliyor..."
	docker compose up --build -d

# Bağımlılık katmanlarını önceden cache'le
build-cache:
	@echo "Bagimlilik katmanlari onbellekleniyor..."
	docker compose build --parallel

down:
	@echo "Sistem durduruluyor..."
	docker compose --profile dev down

logs:
	docker compose logs -f --tail=100

migrate:
	@echo "Migrasyon islemi baslatiliyor..."
	docker compose up db-migrate --build

shell-db:
	@echo "Docker postgres: localhost:5433 -> konteyner 5432 (compose port mapping)."
	@echo "Ornek: psql postgresql://aidep:aidep_pass@localhost:5433/aidep"
	@echo "Adminer: http://localhost:8080 (docker compose --profile dev)"

shell-back:
	@echo "Backend icine giriliyor..."
	docker compose exec backend /bin/sh

shell-ai:
	@echo "AI servisi icine giriliyor..."
	docker compose exec ai /bin/sh

test:
	@echo "Testler baslatiliyor..."
	docker compose exec backend pytest tests/ -v

test-mvp:
	@echo "MVP integration testleri..."
	docker compose exec backend pytest tests/integration -v

demo-seed:
	@echo "Ornek veri yukleniyor..."
	docker compose exec backend python app/data/seed_demo.py

clean:
	@echo "DIKKAT: VERILER SILINECEK!"
	docker compose --profile dev down -v --remove-orphans

osrm-check:
	@echo "OSRM servisine saglik kontrolu yapiliyor..."
	docker compose exec backend curl -I http://osrm:5000/ || echo "UYARI: OSRM yanit vermedi."
