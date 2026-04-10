.PHONY: help dev prod down logs migrate shell-db shell-back shell-ai test test-mvp demo-seed clean osrm-check

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
	docker compose --profile dev up --build

prod:
	@[ -f .env ] || cp .env.example .env
	@echo "🔒 Prodüksiyon arka planda başlatılıyor..."
	docker compose up --build -d

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
