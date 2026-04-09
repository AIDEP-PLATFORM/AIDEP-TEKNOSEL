.PHONY: help dev prod down logs migrate shell-db shell-back shell-ai test demo-seed clean osrm-check

help:
	@echo "======= AIDEP Makefile ======="
	@echo "make dev         -> .env kurulumu yapar ve 'dev' profilinde (Adminer dahil) başlatır."
	@echo "make prod        -> Arka planda başlar (-d) ve logları dökmez."
	@echo "make down        -> Konteynerleri güvenle durdurur."
	@echo "make logs        -> Servislerin canlı loglarını takip eder."
	@echo "make migrate     -> Veritabanı tablolarını günceller (db-migrate servisini tetikler)."
	@echo "make shell-db    -> Postgres veritabanına doğrudan konsoldan giriş yapar."
	@echo "make shell-back  -> Backend konteynerinin içine (sh) bağlanır."
	@echo "make shell-ai    -> AI konteynerinin içine (sh) bağlanır."
	@echo "make test        -> Backend testlerini çalıştırır."
	@echo "make demo-seed   -> Test/Demo için örnek harita/veri yükleme scriptini çalıtırır."
	@echo "make clean       -> DİKKAT: Bütün database, minio ve redis volume'larını tamamen siler."
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
	@echo "🗄️  Postgres veritabanı komut satırına bağlanılıyor..."
	docker compose exec postgres psql -U aidep -d aidep_db

shell-back:
	@echo "💻 Backend içine (sh) giriliyor..."
	docker compose exec backend /bin/sh

shell-ai:
	@echo "🧠 AI servisi içine (sh) giriliyor..."
	docker compose exec ai /bin/sh

test:
	@echo "🧪 Testler başlatılıyor..."
	docker compose exec backend pytest tests/ -v

demo-seed:
	@echo "🌱 Örnek veri yükleniyor..."
	docker compose exec backend python app/data/seed_demo.py

clean:
	@echo "⚠️  DİKKAT: VERİLER SİLİNECEK!"
	@read -p "Tüm verileri (veritabanı, resimler) sıfırlamak istediğine emin misin? (Enter ile devam et) " _
	docker compose --profile dev down -v --remove-orphans

osrm-check:
	@echo "🗺️  OSRM servisine sağlık kontrolü yapılıyor..."
	docker compose exec backend curl -I http://osrm:5000/ || echo "UYARI: OSRM yanıt vermedi veya curl bulunamadı."
